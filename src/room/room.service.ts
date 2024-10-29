import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Room } from './entities/room.entity';
import { User } from 'src/user/entities/user.entity';
import { CreateRoomDto } from './dtos/create-room.dto';
import { Message } from 'src/message/entities/message.entity';
import { RoomUser } from './entities/roomUser.entity';
import { createPrivateRoom } from './dtos/createPrivateRoom.dto';
import { CreateGroupDto } from './dtos/CreateGroupRoom.dto';
import * as CryptoJS from 'crypto-js';

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

  private readonly secretKey = 'your-secret-key';

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

  async removeUserFromRoom(roomId: string, userId: string): Promise<void> {
    const roomUser = await this.roomUserRepository.findOne({
      where: { room: { id: roomId }, user: { id: userId } },
    });

    if (!roomUser) {
      throw new NotFoundException('User is not in the room');
    }

    await this.roomUserRepository.remove(roomUser);
  }

  async addUsersToRoom(roomId: string, userIds: string[]): Promise<void> {
    const room = await this.roomRepository.findOne({
      where: { id: roomId },
    });

    const users = await this.userRepository.findByIds(userIds);

    if (!room) {
      throw new NotFoundException('Room not found');
    }
    if (users.length === 0) {
      throw new NotFoundException('No users found');
    }

    const roomUsers: RoomUser[] = [];
    for (const user of users) {
      // Kiểm tra xem người dùng đã có trong phòng chưa
      const existingRoomUser = await this.roomUserRepository.findOne({
        where: { room: { id: roomId }, user: { id: user.id } },
      });

      if (!existingRoomUser) {
        roomUsers.push(
          this.roomUserRepository.create({
            room,
            user,
            isAdmin: false,
          }),
        );
      }
    }

    if (roomUsers.length > 0) {
      await this.roomUserRepository.save(roomUsers);
    }
  }

  async leaveRoom(userId: string, roomId: string): Promise<void> {
    // Kiểm tra xem người dùng có trong nhóm không
    const roomUser = await this.roomUserRepository.findOne({
      where: { room: { id: roomId }, user: { id: userId } },
    });

    if (!roomUser) {
      throw new NotFoundException('User is not in the room');
    }

    // Xóa người dùng khỏi phòng
    await this.roomUserRepository.remove(roomUser);

    // Kiểm tra xem có còn quản trị viên nào không
    const remainingAdmins = await this.roomUserRepository.find({
      where: { room: { id: roomId }, isAdmin: true },
    });

    if (remainingAdmins.length === 0) {
      // Nếu không còn quản trị viên nào, chọn một thành viên ngẫu nhiên làm quản trị viên
      const remainingMembers = await this.roomUserRepository.find({
        where: { room: { id: roomId }, user: { id: Not(userId) } }, // Loại trừ người vừa rời
      });

      if (remainingMembers.length > 0) {
        // Chọn một người bất kỳ làm quản trị viên mới
        const randomIndex = Math.floor(Math.random() * remainingMembers.length);
        const newAdmin = remainingMembers[randomIndex];

        // Cập nhật thành viên mới thành quản trị viên
        newAdmin.isAdmin = true;
        await this.roomUserRepository.save(newAdmin);
      }
    }
  }

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

  async getPublicRoomsByUser(userId: string): Promise<Room[]> {
    // Kiểm tra xem user có tồn tại không
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Tìm tất cả các phòng mà user đang tham gia và là phòng public
    const publicRooms = await this.roomRepository
      .createQueryBuilder('room')
      .innerJoin('room.roomUsers', 'roomUser')
      .where('roomUser.userId = :userId', { userId })
      .andWhere('room.isPublic = true') // Chỉ lấy các phòng public
      .getMany();

    return publicRooms;
  }

  async changeAdminStatus(
    roomId: string,
    senderId: string, // ID của người yêu cầu
    targetUserId: string, // ID của người bị thay đổi quyền
    isAdmin: boolean, // Trạng thái admin mới
  ): Promise<void> {
    // Kiểm tra xem người gửi có phải admin không
    const senderRoomUser = await this.roomUserRepository.exists({
      where: { room: { id: roomId }, user: { id: senderId }, isAdmin: true },
    });

    // Nếu người gửi không phải admin, trả về lỗi
    if (!senderRoomUser) {
      throw new BadRequestException('You are not an admin of this room');
    }

    // Tìm người dùng bị thay đổi quyền
    const targetRoomUser = await this.roomUserRepository.findOne({
      where: { room: { id: roomId }, user: { id: targetUserId } },
    });

    // Kiểm tra nếu người dùng mục tiêu có trong phòng
    if (!targetRoomUser) {
      throw new NotFoundException('Target user is not in the room');
    }

    // Cập nhật quyền admin cho người dùng
    targetRoomUser.isAdmin = isAdmin;

    // Lưu thay đổi vào cơ sở dữ liệu
    await this.roomUserRepository.save(targetRoomUser);
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

  decryptContent(encryptedContent: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedContent, this.secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  async getRoomDetailsWithImages(roomId: string): Promise<any> {
    // Tìm phòng với roomId
    const room = await this.roomRepository
      .createQueryBuilder('room')
      .leftJoinAndSelect('room.roomUsers', 'roomUser')
      .leftJoinAndSelect('roomUser.user', 'user')
      .where('room.id = :roomId', { roomId })
      .getOne();

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Tìm tất cả các tin nhắn có type là IMG trong phòng
    const messages = await this.messageRepository.find({
      where: { room: { id: roomId }, type: 'IMG' },
      order: { sent_at: 'DESC' },
    });

    // Mã hóa nội dung của các tin nhắn
    const encryptedMessages = messages.map((message) => ({
      ...message,
      content: this.decryptContent(message.content),
    }));

    return {
      room,
      imageMessages: encryptedMessages,
    };
  }

  async removeUserFromRoomByAdmin(
    roomId: string,
    senderId: string, // Người gửi yêu cầu (admin)
    targetUserId: string, // Người bị xóa khỏi phòng
  ): Promise<void> {
    // Kiểm tra xem người gửi có phải admin của phòng không
    const senderRoomUser = await this.roomUserRepository.exists({
      where: { room: { id: roomId }, user: { id: senderId }, isAdmin: true },
    });

    if (!senderRoomUser) {
      throw new BadRequestException('You are not an admin of this room');
    }

    // Kiểm tra xem người bị xóa có tồn tại trong phòng không
    const targetRoomUser = await this.roomUserRepository.findOne({
      where: { room: { id: roomId }, user: { id: targetUserId } },
    });

    if (!targetRoomUser) {
      throw new NotFoundException('Target user is not in the room');
    }

    // Xóa người dùng khỏi phòng
    await this.roomUserRepository.remove(targetRoomUser);
  }

  async updateRoomName(roomId: string, newName: string): Promise<Room> {
    const room = await this.roomRepository.findOne({ where: { id: roomId } });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    room.name = newName;
    return await this.roomRepository.save(room);
  }
}
