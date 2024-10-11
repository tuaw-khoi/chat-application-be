import {
  Controller,
  Post,
  Body,
  Param,
  Patch,
  Get,
  Query,
  BadRequestException,
} from '@nestjs/common';
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

  @Get('/pending') // Thêm endpoint rõ ràng hơn, ví dụ 'pending'
  async getPendingFriendRequests(@Query('userId') userId: string) {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.friendRequestService.getPendingFriendRequests(userId);
  }

  @Patch(':id')
  async respondToFriendRequest(
    @Param('id') requestId: number,
    @Body('status') status: 'accepted' | 'rejected',
  ) {
    return this.friendRequestService.respondToFriendRequest(requestId, status);
  }
}
