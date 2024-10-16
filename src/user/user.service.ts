import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserWithGoogleDto } from './dtos/user.dto';
import { hash } from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { FriendService } from 'src/friend/friend.service';
import { RoomService } from 'src/room/room.service';
import { FriendRequest } from 'src/friend-request/entities/friendRequest.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly friendService: FriendService,
    private readonly roomService: RoomService,
  ) {
  }
  async refreshLogin(token: string): Promise<any> {
    try {
      const jwtObject: any = jwt.verify(token, 'secret');
      const username = jwtObject.username;
      const user = await this.usersRepository.findOne({ where: { username } });
      if (!user) {
        throw new NotFoundException('User not found.');
      }
      const userReturn = {
        id: user.id,
        role: user.Role,
        img: user.img,
        fullname: user.fullname,
      };

      return { userReturn };
    } catch (error) {
      throw new UnauthorizedException('Invalid token.');
    }
  }
  async create(createUserDto: CreateUserDto): Promise<any> {
    // Validate input
    if (!createUserDto.email || !createUserDto.password) {
      throw new ConflictException('Email and password are required');
    }

    // Check if email or username already exists
    const existingUser =
      (await this.findByEmail(createUserDto.email)) ||
      (await this.findByUsername(createUserDto.username));
    if (existingUser) {
      throw new ConflictException('Email or username is already in use');
    }

    const hashedPassword = await hash(createUserDto.password, 10);

    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    try {
      await this.usersRepository.save(user);
      return { success: true, message: 'Register success' };
    } catch (error) {
      throw new ConflictException('Register failed');
    }
  }

  async createWithGoogle(
    createUserWithGoogleDto: UserWithGoogleDto,
  ): Promise<User> {
    // Validate input
    if (!createUserWithGoogleDto.email) {
      throw new ConflictException('Email is required');
    }

    // Check if email already exists
    const existingUser = await this.findByEmail(createUserWithGoogleDto.email);
    if (existingUser) {
      throw new ConflictException('Email is already in use');
    }

    // Create and save user
    const user = this.usersRepository.create(createUserWithGoogleDto);
    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.usersRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }
  }

  async findByUsername(username: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async searchFriends(query: string, userId: string): Promise<User[]> {
    // Kiểm tra nếu query trống hoặc chỉ có khoảng trắng
    if (!query.trim()) {
      return [];
    }

    return this.usersRepository
      .createQueryBuilder('user')
      .innerJoin(
        'user.friends', // Tên quan hệ từ User đến bảng friends
        'friend', // Alias cho bảng friends
        '(friend.user1Id = :userId OR friend.user2Id = :userId)', // Điều kiện join
        { userId },
      )
      .where('(user.id = friend.user1Id OR user.id = friend.user2Id)') // Điều kiện để lấy user đúng
      .andWhere('user.id <> :userId', { userId }) // Loại bỏ người dùng hiện tại khỏi kết quả
      .where('user.fullname ILIKE :query', { query: `%${query}%` }) // Điều kiện tìm kiếm theo tên
      .take(15) // Giới hạn kết quả
      .getMany();
  }

  async searchUser(query: string, userId: string): Promise<any> {
    // Tìm người dùng dựa trên username hoặc email
    const getuser = await this.usersRepository.findOne({
      where: [{ username: query }, { email: query }],
    });
    // Nếu không tìm thấy người dùng
    if (!getuser) {
      return { message: 'usernotfound' };
    }

    if (getuser.id === userId) {
      return { message: 'usernotfound' };
    }

    // Gọi hàm kiểm tra quan hệ bạn bè
    const areFriends = await this.friendService.checkFriendship(
      userId,
      getuser.id,
    );

    // Chuẩn bị dữ liệu người dùng trả về
    const userReturn = {
      id: getuser.id,
      fullname: getuser.fullname,
      img: getuser.img,
    };

    // const sentRequest =
    //   await this.friendRequestService.findPendingRequestByUsers(
    //     getuser.id,
    //     userId,
    //   );

    // Nếu hai người là bạn bè, tìm room chung
    if (areFriends) {
      // Gọi hàm tìm room chung giữa hai người dùng
      const getroom = await this.roomService.getRoomBetweenUsers(
        userId,
        userReturn.id,
      );

      // Kiểm tra nếu room tồn tại
      if (getroom && getroom.commonRoom) {
        const room = {
          roomId: getroom.commonRoom.id,
          roomName: userReturn.fullname,
          roomImg: getroom.commonRoom.img || '',
          latestMessage: getroom.latestMessage || '',
        };

        return { user: userReturn, room, message: 'Friends' };
      } else {
        // Nếu không tìm thấy room chung dù là bạn bè
        return {
          user: userReturn,
          room: null,
          message: 'Friends but no room found',
        };
      }
    } else {
      // Trả về thông tin người dùng nhưng room là null nếu không phải bạn bè
      return { user: userReturn, room: null, message: 'Not friends yet' };
    }
  }
}
