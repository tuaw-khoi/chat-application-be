import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendRequestService } from './friend-request.service';
import { FriendRequestController } from './friend-request.controller';
import { User } from 'src/user/entities/user.entity';
import { FriendRequest } from './entities/friendRequest.entity';
import { FriendModule } from 'src/friend/friend.module';
import { Friend } from 'src/friend/entities/friend.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([FriendRequest, User, Friend]),
    FriendModule,
  ],
  controllers: [FriendRequestController],
  providers: [FriendRequestService],
  exports: [FriendRequestService],
})
export class FriendRequestModule {}
