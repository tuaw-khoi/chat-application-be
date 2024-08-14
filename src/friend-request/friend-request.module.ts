
import { Module } from '@nestjs/common';
import { FriendRequestService } from './friend-request.service';
import { FriendRequestController } from './friend-request.controller';


@Module({

  providers: [FriendRequestService],
  controllers: [FriendRequestController]
})
export class FriendRequestModule {}
