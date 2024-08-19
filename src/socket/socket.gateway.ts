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
import { UserService } from 'src/user/user.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly userService: UserService,
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
      roomId?: string;
      senderId: string;
      reciveId?: string;
    },
  ) {
    let roomId = data.roomId;
    if (!roomId && data.reciveId) {
      const room = await this.chatService.createRoomForUsers(
        data.senderId,
        data.reciveId,
      );
      roomId = room.id;
    }

    const message = await this.chatService.createMessage(
      roomId,
      data.senderId,
      data.content,
    );

    this.server.to(roomId.toString()).emit('newMessage', message);
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: number,
  ) {
    client.join(roomId.toString());
    console.log(`Client ${client.id} joined room ${roomId}`);
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: number,
  ) {
    client.leave(roomId.toString());
    console.log(`Client ${client.id} left room ${roomId}`);
  }
}
