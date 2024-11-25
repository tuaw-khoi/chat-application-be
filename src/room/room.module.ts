import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { Room } from './entities/room.entity';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { Message } from 'src/message/entities/message.entity';
import { UserModule } from 'src/user/user.module';
import { MessageModule } from 'src/message/message.module';
import { FriendModule } from 'src/friend/friend.module';
import { Friend } from 'src/friend/entities/friend.entity';
import { RoomUser } from './entities/roomUser.entity';
import { FriendRequestModule } from 'src/friend-request/friend-request.module';
import { LikesModule } from 'src/likes/likes.module';
import { PostModule } from 'src/post/post.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Room, User, Message, Friend, RoomUser]),
    forwardRef(() => UserModule), // Sử dụng forwardRef nếu có vòng lặp phụ thuộc
    FriendModule,
    MessageModule,
    FriendRequestModule,
    LikesModule,
    PostModule
  ],
  providers: [RoomService, UserService],
  controllers: [RoomController],
  exports: [RoomService],
})
export class RoomModule {}
