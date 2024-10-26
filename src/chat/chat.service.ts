import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { MessageService } from 'src/message/message.service';
import { RoomService } from 'src/room/room.service';
import { FriendService } from 'src/friend/friend.service';
import { Message } from 'src/message/entities/message.entity';
import { Room } from 'src/room/entities/room.entity';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { FriendRequest } from 'src/friend-request/entities/friendRequest.entity';
import { FriendRequestService } from 'src/friend-request/friend-request.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly messageService: MessageService,
    private readonly roomService: RoomService,
    private readonly friendService: FriendService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // async joinRoom(userId: string, roomId: number): Promise<void> {
  //   const room = await this.roomService.findOneRoom(roomId);
  //   if (!room) {
  //     throw new NotFoundException('Room not found');
  //   }
  //   await this.roomService.addUserToRoom(userId, roomId);
  // }

  // async leaveRoom(userId: string, roomId: number): Promise<void> {
  //   await this.roomService.removeUserFromRoom(roomId, userId);
  // }

  async createRoomForUsers(
    senderId: string,
    receiverId: string,
  ): Promise<{
    roomName: string;
    roomId: string;
    roomImg: string;
  }> {
    const newRoom = await this.roomService.createPrivateRoom({
      senderId,
      receiverId,
    });

    const otherUser = await this.userRepository.findOne({
      where: { id: receiverId },
    });

    if (otherUser) {
      const roomName = otherUser.fullname || 'Unknown User';
      const roomImg = otherUser.img || null;

      const returnRoom = {
        roomName: roomName,
        roomId: newRoom.id,
        roomImg: roomImg,
      };
      return returnRoom;
    }
  }

  async createMessage(
    roomId: string,
    senderId: string,
    content: string,
    type: string,
  ): Promise<Message> {
    const room = await this.roomService.findOneRoom(roomId);

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    const memberIds = room.roomUsers.map((ru) => ru.user.id);

    if (room.isPublic) {
      if (!memberIds.includes(senderId)) {
        throw new BadRequestException(
          'You must be a member of the room to send a message',
        );
      }
    }

    // Tạo tin nhắn
    return this.messageService.createMessage(senderId, roomId, content, type);
  }
  async getRoomsForUser(userId: string): Promise<any[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roomUsers', 'roomUsers.room'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Lấy tất cả các phòng mà user đã tham gia
    const rooms = user.roomUsers.map((roomUser) => roomUser.room);

    // Lấy tin nhắn gần nhất trong từng phòng
    const roomsWithMessages = await Promise.all(
      rooms.map(async (room) => {
        // Lấy tin nhắn gần nhất trong phòng
        const latestMessage = await this.messageService.getLatestMessageInRoom(
          room.id,
        );

        let roomName: string;
        let roomImg: string;
        let receiveId: string;
        // Nếu phòng là private (isPublic = false), đặt tên dựa trên user khác trong phòng
        if (!room.isPublic) {
          // Giả định room.name chứa 2 userId ngăn cách bằng dấu "_"
          const userIds = room.name.split('_');

          // Loại bỏ userId trùng với userId hiện tại
          const otherUserId = userIds.find((id) => id !== userId);

          if (otherUserId) {
            // Tìm thông tin của người dùng còn lại trong phòng
            const otherUser = await this.userRepository.findOne({
              where: { id: otherUserId },
            });

            if (otherUser) {
              roomName = otherUser.fullname || 'Unknown User';
              roomImg = otherUser.img || null;
              receiveId = otherUser.id || null;
            }
          }
        } else {
          // Nếu là phòng public, lấy tên phòng và ảnh đại diện phòng
          roomName = room.name;
          roomImg = room.img || null;
        }

        return {
          roomName: roomName,
          roomId: room.id,
          roomImg: roomImg,
          latestMessage: latestMessage ? latestMessage.content : null,
          sentAt: latestMessage ? latestMessage.sent_at : null,
          receiveId,
        };
      }),
    );

    // Sắp xếp danh sách phòng theo thời gian tin nhắn mới nhất (sentAt)
    roomsWithMessages.sort((a, b) => {
      if (a.sentAt && b.sentAt) {
        return new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime(); // Sắp xếp giảm dần theo thời gian
      }
      return 0;
    });

    return roomsWithMessages;
  }

  async checkRoomForUsers(
    userId1: string,
    userId2: string,
  ): Promise<Room | null> {
    // Lấy thông tin phòng của userId1
    const user1 = await this.userRepository.findOne({
      where: { id: userId1 },
      relations: ['roomUsers', 'roomUsers.room'],
    });

    if (!user1) {
      throw new NotFoundException('User 1 not found');
    }

    // Lấy thông tin phòng của userId2
    const user2 = await this.userRepository.findOne({
      where: { id: userId2 },
      relations: ['roomUsers', 'roomUsers.room'],
    });

    if (!user2) {
      throw new NotFoundException('User 2 not found');
    }

    // Kiểm tra xem có phòng chung giữa hai người dùng không
    const commonRoom = user1.roomUsers.find((roomUser1) =>
      user2.roomUsers.some(
        (roomUser2) =>
          roomUser2.room.id === roomUser1.room.id && !roomUser1.room.isPublic, // Kiểm tra isPublic là false
      ),
    );

    return commonRoom ? commonRoom.room : null; // Trả về phòng hoặc null
  }

  async getUserRooms(userId: string, query: string): Promise<Room[]> {
    // Lấy tất cả các phòng mà userId đã tham gia
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roomUsers', 'roomUsers.room'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Sử dụng Set để loại bỏ các phòng trùng lặp
    const roomMap = new Map<string, Room>();

    user.roomUsers.forEach((roomUser) => {
      const room = roomUser.room;

      if (
        room.name.toLowerCase().includes(query.toLowerCase()) &&
        !roomMap.has(room.id)
      ) {
        roomMap.set(room.id, room);
      }
    });

    return Array.from(roomMap.values());
  }
}
