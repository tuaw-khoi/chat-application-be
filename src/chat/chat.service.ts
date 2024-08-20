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

  async joinRoom(userId: string, roomId: string): Promise<void> {
    const room = await this.roomService.findOneRoom(roomId);
    if (!room) {
      throw new NotFoundException('Room not found');
    }
    await this.roomService.addUserToRoom(userId, roomId);
  }

  async leaveRoom(userId: string, roomId: string): Promise<void> {
    await this.roomService.removeUserFromRoom(userId, roomId);
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
    roomId: string,
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
        const latestMessage = await this.messageService.getLatestMessageInRoom(
          room.id,
        );

        return {
          roomName: room.name,
          roomId: room.id,
          latestMessage: latestMessage ? latestMessage.content : null,
        };
      }),
    );

    return roomsWithMessages;
  }
}
