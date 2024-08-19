import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from './chat.service';
import { MessageService } from 'src/message/message.service';
import { RoomService } from 'src/room/room.service';
import { FriendService } from 'src/friend/friend.service';
import { Message } from 'src/message/entities/message.entity';
import { User } from 'src/user/entities/user.entity';
import { Room } from 'src/room/entities/room.entity';
import { MessageModule } from 'src/message/message.module';
import { RoomModule } from 'src/room/room.module'; // Nhập khẩu RoomModule
import { FriendModule } from 'src/friend/friend.module'; // Nhập khẩu FriendModule nếu cần
import { Friend } from 'src/friend/entities/friend.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, User, Room, Friend]),
    MessageModule,
    RoomModule,
    FriendModule,
  ],
  providers: [ChatService, MessageService, RoomService, FriendService],
  exports: [ChatService],
})
export class ChatModule {}
