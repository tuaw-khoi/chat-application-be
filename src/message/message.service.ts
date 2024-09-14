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
  async getLatestMessageInRoom(roomId: number): Promise<Message> {
    return this.messageRepository.findOne({
      where: { room: { id: roomId } },
      order: { sent_at: 'DESC' },
    });
  }

  async createMessage(senderId: string, roomId: number, content: string) {
    const message = this.messageRepository.create({
      sender: { id: senderId },
      room: { id: roomId },
      content,
    });
    return await this.messageRepository.save(message);
  }

  async countMessages(senderId: string, roomId: number): Promise<number> {
    return await this.messageRepository.count({
      where: { sender: { id: senderId }, room: { id: roomId } },
    });
  }

  async getMessagesByRoom(roomId: number) {
    const mess = this.messageRepository.find({
      where: { room: { id: roomId } },
      order: { sent_at: 'ASC' },
    });
    return mess;
  }
}
