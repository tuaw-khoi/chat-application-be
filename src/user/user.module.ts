import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { Friend } from 'src/friend/entities/friend.entity';
import { FriendModule } from 'src/friend/friend.module';
import { RoomModule } from 'src/room/room.module';
import { ChatService } from 'src/chat/chat.service';
import { MessageService } from 'src/message/message.service';
import { RoomService } from 'src/room/room.service';
import { FriendService } from 'src/friend/friend.service';
import { MessageModule } from 'src/message/message.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Friend]),
    FriendModule, // Khai báo User entity
    forwardRef(() => RoomModule)
  ],

  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
