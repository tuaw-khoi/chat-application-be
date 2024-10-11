import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { ChatService } from 'src/chat/chat.service';
import { UserService } from 'src/user/user.service';
import { MessageModule } from 'src/message/message.module'; // Nhập khẩu MessageModule
import { RoomModule } from 'src/room/room.module'; // Nhập khẩu RoomModule
import { FriendModule } from 'src/friend/friend.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    MessageModule,
    RoomModule,
    FriendModule,
    
  ],
  providers: [SocketGateway, ChatService, UserService],
})
export class SocketModule {}
