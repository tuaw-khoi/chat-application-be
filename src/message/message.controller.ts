import { Controller, Post, Body } from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dtos/create-message.dto';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  async sendMessage(@Body() createMessageDto: CreateMessageDto) {
    return this.messageService.createMessage(
      createMessageDto.senderId,
      createMessageDto.roomId,
      createMessageDto.content,
    );
  }
}
