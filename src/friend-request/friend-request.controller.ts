import { Controller, Post, Body, Param, Patch } from '@nestjs/common';
import { FriendRequestService } from './friend-request.service';

@Controller('friend-requests')
export class FriendRequestController {
  constructor(private readonly friendRequestService: FriendRequestService) {}

  @Post()
  async sendFriendRequest(
    @Body('senderId') senderId: string,
    @Body('receiverId') receiverId: string,
  ) {
    return this.friendRequestService.sendFriendRequest(senderId, receiverId);
  }

  @Patch(':id')
  async respondToFriendRequest(
    @Param('id') requestId: number,
    @Body('status') status: 'accepted' | 'rejected',
  ) {
    return this.friendRequestService.respondToFriendRequest(requestId, status);
  }
}
