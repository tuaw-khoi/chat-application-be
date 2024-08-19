import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async createMessage(senderId: string, roomId: string, content: string) {
    const message = this.messageRepository.create({
      sender: { id: senderId },
      room: { id: roomId },
      content,
    });
    return await this.messageRepository.save(message);
  }

  async countMessages(senderId: string, roomId: string): Promise<number> {
    return await this.messageRepository.count({
      where: { sender: { id: senderId }, room: { id: roomId } },
    });
  }
}
