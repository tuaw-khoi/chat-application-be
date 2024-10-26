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
      roomId?: string;
      senderId: string;
      receiveId?: string;
      type: string;
    },
  ) {
    try {
      if (!data.content || data.content.trim() === '') {
        throw new Error('Content of the message cannot be empty');
      }
      let roomId = data.roomId;
      if (roomId === undefined && data.receiveId) {
        const room = await this.chatService.createRoomForUsers(
          data.senderId,
          data.receiveId,
        );
        roomId = room.roomId;
        this.server.to(client.id).emit('newroomId', room);
        this.server.to(data.receiveId).emit('newroomId', roomId);
      }

      if (roomId === undefined) {
        throw new Error('Room ID is required');
      }

      const message = await this.chatService.createMessage(
        roomId,
        data.senderId,
        data.content,
        data.type,
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

  @SubscribeMessage('searchChats')
  async handleSearchFriends(
    @MessageBody() data: { query: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { query, userId } = data;

    if (query.trim() === '') {
      client.emit('searchChatsResult', []);
      return;
    }

    // Tìm kiếm bạn bè dựa trên query
    const friends = await this.friendService.searchFriends(query, userId);

    // Kiểm tra xem đã có phòng với bạn bè chưa và gom lại
    const friendsWithRooms = await Promise.all(
      friends.map(async (friend) => {
        const room = await this.chatService.checkRoomForUsers(
          userId,
          friend.id,
        );
        return {
          id: friend.id,
          fullname: friend.fullname, // Dùng 'name' thay vì 'fullname' để đồng nhất với room
          img: friend.img,
          roomId: room ? room.id : null, // Nếu có phòng, trả về roomId
          type: 'friend', // Đánh dấu là friend
        };
      }),
    );

    // Lấy danh sách các phòng mà user đã tham gia và tên phòng khớp với query
    const userRooms = await this.chatService.getUserRooms(userId, query);

    // Định dạng các phòng với cấu trúc tương tự friend
    const formattedRooms = userRooms.map((room) => ({
      id: room.id,
      fullname: room.name, // Sử dụng 'name' để khớp với friend
      img: room.img, // Phòng không có img nên để null
      roomId: room.id, // roomId chính là id của phòng
      type: 'room', // Đánh dấu là room
    }));

    // Gom bạn bè và phòng vào chung một mảng
    const searchResults = [...friendsWithRooms, ...formattedRooms];
    // Trả kết quả về client
    client.emit('searchChatsResult', searchResults);
  }
}
