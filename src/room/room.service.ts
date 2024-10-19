import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './entities/room.entity';
import { User } from 'src/user/entities/user.entity';
import { CreateRoomDto } from './dtos/create-room.dto';
import { Message } from 'src/message/entities/message.entity';
import { RoomUser } from './entities/roomUser.entity';
import { createPrivateRoom } from './dtos/createPrivateRoom.dto';
import { CreateGroupDto } from './dtos/CreateGroupRoom.dto';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(RoomUser)
    private roomUserRepository: Repository<RoomUser>,
  ) {}

  // Tạo phòng mới và gán admins cho phòng
  async createRoom(createRoomDto: CreateRoomDto): Promise<Room> {
    const creator = await this.userRepository.findOne({
      where: { id: createRoomDto.userId },
    });

    if (!creator) {
      throw new NotFoundException('Creator not found');
    }

    const members = await this.userRepository.findByIds(createRoomDto.members);

    if (members.length !== createRoomDto.members.length) {
      throw new NotFoundException('One or more members not found');
    }

    const room = this.roomRepository.create({
      name: createRoomDto.name,
      isPublic: createRoomDto.isPublic,
    });

    const savedRoom = await this.roomRepository.save(room);

    const roomUsers: RoomUser[] = [];

    roomUsers.push(
      this.roomUserRepository.create({
        room: savedRoom,
        user: creator,
        isAdmin: true,
      }),
    );

    for (const member of members) {
      // Kiểm tra để không thêm lại creator vào danh sách
      if (member.id !== creator.id) {
        roomUsers.push(
          this.roomUserRepository.create({
            room: savedRoom,
            user: member,
            isAdmin: false,
          }),
        );
      }
    }

    await this.roomUserRepository.save(roomUsers);

    return savedRoom;
  }

  async createPrivateRoom(
    createPrivateRoomDto: createPrivateRoom,
  ): Promise<any> {
    const sender = await this.userRepository.findOne({
      where: { id: createPrivateRoomDto.senderId },
    });
    if (!sender) {
      throw new NotFoundException('Sender not found');
    }

    const receiver = await this.userRepository.findOne({
      where: { id: createPrivateRoomDto.receiverId },
    });
    if (!receiver) {
      throw new NotFoundException('Receiver not found');
    }

    const existingRoom = await this.roomRepository
      .createQueryBuilder('room')
      .where('room.isPublic = false')
      .andWhere('(room.name = :name1 OR room.name = :name2)', {
        name1: `${createPrivateRoomDto.senderId}_${createPrivateRoomDto.receiverId}`,
        name2: `${createPrivateRoomDto.receiverId}_${createPrivateRoomDto.senderId}`,
      })
      .getOne();

    if (existingRoom) {
      return existingRoom;
    }

    const room = this.roomRepository.create({
      name: `${createPrivateRoomDto.senderId}_${createPrivateRoomDto.receiverId}`,
      isPublic: false,
    });

    const savedRoom = await this.roomRepository.save(room);

    const roomUsers: RoomUser[] = [
      this.roomUserRepository.create({
        room: savedRoom,
        user: sender,
        isAdmin: true,
      }),
      this.roomUserRepository.create({
        room: savedRoom,
        user: receiver,
        isAdmin: true,
      }),
    ];

    await this.roomUserRepository.save(roomUsers);

    return savedRoom;
  }

  // // Thêm người dùng vào phòng
  // async addUserToRoom(userId: string, roomId: string): Promise<void> {
  //   const room = await this.roomRepository.findOne({
  //     where: { id: roomId },
  //     relations: ['users'],
  //   });

  //   const user = await this.userRepository.findOne({ where: { id: userId } });

  //   if (!room) {
  //     throw new NotFoundException('Room not found');
  //   }
  //   if (!user) {
  //     throw new NotFoundException('User not found');
  //   }

  //   // Kiểm tra xem người dùng đã có trong phòng chưa
  //   if (room.users.some((u) => u.id === user.id)) {
  //     throw new Error('User already in the room');
  //   }

  //   room.users.push(user);
  //   await this.roomRepository.save(room);
  // }

  // // Xóa người dùng khỏi phòng
  // async removeUserFromRoom(roomId: string, userId: string): Promise<void> {
  //   const room = await this.roomRepository.findOne({
  //     where: { id: roomId },
  //     relations: ['users'],
  //   });

  //   if (!room) {
  //     throw new NotFoundException('Room not found');
  //   }

  //   // Loại bỏ user khỏi danh sách users của phòng
  //   room.users = room.users.filter((user) => user.id !== userId);
  //   await this.roomRepository.save(room);
  // }

  // // Lấy danh sách tất cả các phòng
  // async findAllRooms(): Promise<Room[]> {
  //   return this.roomRepository.find({ relations: ['users', 'admins'] });
  // }

  // Tìm một phòng theo ID
  async findOneRoom(id: string): Promise<Room> {
    const room = await this.roomRepository
      .createQueryBuilder('room')
      .leftJoinAndSelect('room.roomUsers', 'roomUser')
      .leftJoinAndSelect('roomUser.user', 'user')
      .where('room.id = :id', { id })
      .getOne();

    if (!room) {
      throw new NotFoundException('Room not found');
    }
    return room;
  }

  async findPublicRooms(): Promise<Room[]> {
    const publicRooms = await this.roomRepository.find({
      where: { isPublic: true },
      relations: ['roomUsers', 'roomUsers.user'],
    });

    return publicRooms;
  }

  async getRoomBetweenUsers(userId1: string, userId2: string): Promise<any> {
    // Tìm room có cả 2 người dùng trong danh sách roomUsers
    const commonRoom = await this.roomRepository
      .createQueryBuilder('room')
      .innerJoin('room.roomUsers', 'roomUser1')
      .innerJoin('roomUser1.user', 'user1', 'user1.id = :userId1', { userId1 })
      .innerJoin('room.roomUsers', 'roomUser2')
      .innerJoin('roomUser2.user', 'user2', 'user2.id = :userId2', { userId2 })
      .andWhere('room.isPublic = :isPublic', { isPublic: false }) // Chỉ tìm room riêng tư (nếu cần)
      .getOne();

    // Nếu tìm thấy room chung giữa hai người
    if (commonRoom) {
      // Lấy tin nhắn mới nhất trong room (nếu có)
      const latestMessage = await this.roomRepository
        .createQueryBuilder('room')
        .leftJoinAndSelect('room.messages', 'message')
        .where('room.id = :roomId', { roomId: commonRoom.id })
        .orderBy('message.sent_at', 'DESC')
        .getOne();

      // Trả về room và tin nhắn mới nhất
      return {
        commonRoom,
        latestMessage: latestMessage?.messages?.[0] || null, // Nếu có tin nhắn, trả về tin nhắn mới nhất, nếu không thì null
      };
    }

    // Nếu không tìm thấy room chung
    return null;
  }

  async createGroup(createGroupDto: CreateGroupDto): Promise<Room> {
    // Kiểm tra xem creator có tồn tại không
    const creator = await this.userRepository.findOne({
      where: { id: createGroupDto.userId },
    });

    if (!creator) {
      console.error(`Creator not found for userId: ${createGroupDto.userId}`);
      throw new NotFoundException('Creator not found');
    }

    // Kiểm tra các thành viên
    const members = await this.userRepository.findByIds(createGroupDto.members);

    if (members.length !== createGroupDto.members.length) {
      console.error(
        `Members not found. Expected: ${createGroupDto.members.length}, Found: ${members.length}`,
      );
      throw new NotFoundException('One or more members not found');
    }

    // Kiểm tra tên nhóm
    if (!createGroupDto.name || createGroupDto.name.trim().length === 0) {
      console.error('Group name is required and cannot be empty');
      throw new BadRequestException('Group name is required');
    }

    // Tạo phòng mới
    const room = this.roomRepository.create({
      name: createGroupDto.name,
      isPublic: true, // Chắc chắn rằng isPublic được đặt là true
      img: createGroupDto.img,
    });

    try {
      const savedRoom = await this.roomRepository.save(room);
      console.log(`Room created successfully with id: ${savedRoom.id}`);

      // Tạo danh sách người dùng phòng
      const roomUsers: RoomUser[] = [];

      roomUsers.push(
        this.roomUserRepository.create({
          room: savedRoom,
          user: creator,
          isAdmin: true,
        }),
      );

      for (const member of members) {
        roomUsers.push(
          this.roomUserRepository.create({
            room: savedRoom,
            user: member,
            isAdmin: false,
          }),
        );
      }

      // Lưu người dùng phòng
      await this.roomUserRepository.save(roomUsers);
      console.log(`Room users added successfully for room id: ${savedRoom.id}`);

      return savedRoom; // Trả về phòng đã được lưu
    } catch (error) {
      console.error('Error saving room or room users:', error);
      throw new InternalServerErrorException('Error creating room');
    }
  }
}
