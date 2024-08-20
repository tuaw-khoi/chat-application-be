import { Controller, Get, Param } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Room } from 'src/room/entities/room.entity';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('/:userId/rooms')
  async getRoomsForUser(@Param('userId') userId: string): Promise<Room[]> {
    return this.chatService.getRoomsForUser(userId);
  }
}
