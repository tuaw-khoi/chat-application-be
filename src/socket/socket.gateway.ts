import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from 'src/chat/chat.service';
import { FriendService } from 'src/friend/friend.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly friendService: FriendService,
  ) {}

  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      content: string;
      roomId?: number;
      senderId: string;
      reciveId?: string;
    },
  ) {
    try {
      if (!data.content || data.content.trim() === '') {
        throw new Error('Content of the message cannot be empty');
      }
      let roomId = data.roomId;
      if (roomId === undefined && data.reciveId) {
        const room = await this.chatService.createRoomForUsers(
          data.senderId,
          data.reciveId,
        );
        roomId = room.id;

        client.emit('newroomId', roomId);
      }

      if (roomId === undefined) {
        throw new Error('Room ID is required');
      }

      const message = await this.chatService.createMessage(
        roomId,
        data.senderId,
        data.content,
      );
      this.server.to(roomId.toString()).emit('newMessage', message);
    } catch (error) {
      client.emit('errorNewChat', { message: 'Failed to send message', error });
    }
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: number,
  ) {
    if (roomId === null || roomId === -1) {
      return;
    }
    if (roomId === undefined) {
      throw new Error('Room ID is required');
    }
    client.join(roomId.toString());
    console.log(`Client ${client.id} joined room ${roomId}`);
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: number,
  ) {
    if (roomId === undefined) {
      throw new Error('Room ID is required');
    }
    client.leave(roomId.toString());
    console.log(`Client ${client.id} left room ${roomId}`);
  }

  @SubscribeMessage('searchFriends')
  async handleSearchFriends(
    @MessageBody() data: { query: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { query, userId } = data;
    if (query.trim() === '') {
      client.emit('searchFriendsResult', []);
      return;
    }

    // Tìm kiếm bạn bè dựa trên query
    const friends = await this.friendService.searchFriends(query, userId);
    // Lấy danh sách bạn bè và kiểm tra xem có phòng giữa user và bạn đó không
    const friendsReturn = await Promise.all(
      friends.map(async (friend) => {
        // Kiểm tra xem đã có room giữa user và friend chưa
        const room = await this.chatService.checkRoomForUsers(
          userId,
          friend.id,
        );

        return {
          id: friend.id,
          fullname: friend.fullname,
          img: friend.img,
          roomId: room ? room.id : null, // Nếu đã có room, gửi kèm roomId
        };
      }),
    );

    // Trả kết quả về client
    client.emit('searchFriendsResult', friendsReturn);
  }
}
