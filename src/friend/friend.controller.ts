import { Controller, Get, Param } from '@nestjs/common';
import { FriendService } from './friend.service';

@Controller('friends')
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  @Get(':userId1/are-friends/:userId2')
  async areFriends(
    @Param('userId1') userId1: string,
    @Param('userId2') userId2: string,
  ) {
    return this.friendService.checkFriendship(userId1, userId2);
  }

  @Get(':userId')
  async getAllFriends(@Param('userId') userId: string) {
    return this.friendService.getAllFriends(userId);
  }
}
