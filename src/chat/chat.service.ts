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

@Injectable()
export class ChatService {
  constructor(
    private readonly messageService: MessageService,
    private readonly roomService: RoomService,
    private readonly friendService: FriendService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async joinRoom(userId: string, roomId: number): Promise<void> {
    const room = await this.roomService.findOneRoom(roomId);
    if (!room) {
      throw new NotFoundException('Room not found');
    }
    await this.roomService.addUserToRoom(userId, roomId);
  }

  async leaveRoom(userId: string, roomId: number): Promise<void> {
    await this.roomService.removeUserFromRoom(roomId, userId);
  }

  async createRoomForUsers(senderId: string, reciveId: string): Promise<Room> {
    const newRoom = await this.roomService.createRoom({
      name: `${senderId}_${reciveId}`,
      isPublic: false,
      admins: [senderId, reciveId],
    });
    return newRoom;
  }

  async createMessage(
    roomId: number,
    senderId: string,
    content: string,
  ): Promise<Message> {
    const id = roomId;
    const room = await this.roomService.findOneRoom(id);
    if (!room) {
      throw new NotFoundException('Room not found');
    }
    const admins = room.admins;
    const reciveId = admins.find((adminId) => adminId.id !== senderId);

    if (!reciveId) {
      throw new BadRequestException('Invalid room admins');
    }
    const isFriend = await this.friendService.checkFriendship(
      senderId,
      reciveId.id,
    );
    if (!isFriend) {
      const sentMessagesCount = await this.messageService.countMessages(
        senderId,
        roomId,
      );
      if (sentMessagesCount >= 3) {
        throw new BadRequestException(
          'You can only send 3 messages if you are not friends',
        );
      }
    }

    return await this.messageService.createMessage(senderId, roomId, content);
  }

  async getRoomsForUser(userId: string): Promise<any[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['rooms'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Lấy tất cả các phòng của người dùng
    const rooms = user.rooms;

    // Lấy tin nhắn gần nhất trong từng phòng
    const roomsWithMessages = await Promise.all(
      rooms.map(async (room) => {
        // Lấy tin nhắn gần nhất trong phòng
        const latestMessage = await this.messageService.getLatestMessageInRoom(
          room.id,
        );

        let roomName: string;
        let roomImg: string;

        // Nếu là phòng private (isPublic = false)
        if (!room.isPublic) {
          // Giả định room.name chứa 2 userId ngăn cách bằng dấu "_"
          const userIds = room.name.split('_');

          // Loại bỏ userId trùng với userId được nhận
          const otherUserId = userIds.find((id) => id !== userId);

          if (otherUserId) {
            // Tìm thông tin của người dùng còn lại
            const otherUser = await this.userRepository.findOne({
              where: { id: otherUserId },
            });

            if (otherUser) {
              // Tên phòng là tên của người dùng còn lại và ảnh đại diện của họ
              roomName = otherUser.fullname;
              roomImg = otherUser.img || null; // Nếu ảnh đại diện của user còn lại tồn tại
            }
          }
        } else {
          // Nếu là phòng public
          roomName = room.name;
          roomImg = room.img || null; // Ảnh đại diện của phòng public
        }

        return {
          roomName: roomName,
          roomId: room.id,
          roomImg: roomImg,
          latestMessage: latestMessage ? latestMessage.content : null,
          sentAt: latestMessage ? latestMessage.sent_at : null, // Thêm thời gian gửi tin nhắn
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

  async checkRoomForUsers(userId1: string, userId2: string): Promise<any> {
    // Tìm tất cả các phòng mà userId1 đang tham gia
    const user1Rooms = await this.userRepository.findOne({
      where: { id: userId1 },
      relations: ['rooms'],
    });

    if (!user1Rooms) {
      throw new NotFoundException('User 1 not found');
    }

    // Lấy danh sách các roomId mà userId1 đang tham gia
    const roomIdsForUser1 = user1Rooms.rooms.map((room) => room.id);

    // Tìm userId2 và xem user này có trong các phòng của userId1 không
    const user2 = await this.userRepository.findOne({
      where: { id: userId2 },
      relations: ['rooms'],
    });

    if (!user2) {
      throw new NotFoundException('User 2 not found');
    }

    // Kiểm tra xem có phòng nào giữa userId1 và userId2 không
    const commonRoom = user2.rooms.find((room) =>
      roomIdsForUser1.includes(room.id),
    );

    return commonRoom || null;
  }
}
