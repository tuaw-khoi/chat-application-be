import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendRequestService } from './friend-request.service';
import { FriendRequestController } from './friend-request.controller';
import { User } from 'src/user/entities/user.entity';
import { FriendRequest } from './entities/friendRequest.entity';
import { FriendModule } from 'src/friend/friend.module';
import { Friend } from 'src/friend/entities/friend.entity';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FriendRequest, User, Friend]),
    FriendModule,
    NotificationModule
  ],
  controllers: [FriendRequestController],
  providers: [FriendRequestService],
  exports: [FriendRequestService],
})
export class FriendRequestModule {}
