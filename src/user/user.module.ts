import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { Friend } from 'src/friend/entities/friend.entity';
import { FriendModule } from 'src/friend/friend.module';
import { RoomModule } from 'src/room/room.module';
import { LikesModule } from 'src/likes/likes.module';
import { PostModule } from 'src/post/post.module';
import { NotificationModule } from 'src/notification/notification.module';
import { PhotoModule } from 'src/photo/photo.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Friend]),
    FriendModule,
    LikesModule,
    PostModule,
    forwardRef(() => RoomModule),
  ],

  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
