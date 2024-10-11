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
  async getLatestMessageInRoom(roomId: string): Promise<Message | null> {
    return this.messageRepository.findOne({
      where: { room: { id: roomId } },
      order: { sent_at: 'DESC' },
    });
  }

  async createMessage(senderId: string, roomId: string, content: string) {
    const message = this.messageRepository.create({
      sender: { id: senderId },
      room: { id: roomId },
      content,
    });
    return await this.messageRepository.save(message);
  }

  async getMessagesByRoom(roomId: string) {
    const mess = await this.messageRepository.find({
      where: { room: { id: roomId } },
      order: { sent_at: 'ASC' },
      relations: ['sender'],
    });
    if (!mess) {
      return null;
    }

    const returnMess = mess?.map((message) => ({
      id: message.id,
      content: message.content,
      senderId: message.sender.id,
    }));
    return returnMess;
  }
}
