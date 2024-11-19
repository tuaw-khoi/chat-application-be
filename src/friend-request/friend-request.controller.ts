import {
  Controller,
  Post,
  Body,
  Param,
  Patch,
  Get,
  Query,
  BadRequestException,
  Delete,
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

  @Get('/status')
  async checkFriendRequestStatus(
    @Query('userId1') userId1: string,
    @Query('userId2') userId2: string,
  ) {
    return this.friendRequestService.checkFriendRequestStatus(userId1, userId2);
  }

  @Delete(':userId/cancel-request/:friendId')
  async cancelFriendRequest(
    @Param('userId') userId: string,
    @Param('friendId') friendId: string,
  ) {
    return this.friendRequestService.cancelFriendRequest(userId, friendId);
  }

  @Get('/suggestions')
  async suggestFriends(@Query('userId') userId: string) {
    if (!userId) {
      throw new BadRequestException('UserId is required');
    }
    return this.friendRequestService.suggestFriends(userId);
  }
}
