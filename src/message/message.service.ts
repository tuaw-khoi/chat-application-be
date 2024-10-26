import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import * as CryptoJS from 'crypto-js';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  private readonly secretKey = 'your-secret-key';

  encryptContent(content: string): string {
    return CryptoJS.AES.encrypt(content, this.secretKey).toString();
  }

  decryptContent(encryptedContent: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedContent, this.secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  async createMessage(
    senderId: string,
    roomId: string,
    content: string,
    type?: string,
  ) {
    const encryptedContent = this.encryptContent(content);
    const message = this.messageRepository.create({
      sender: { id: senderId },
      room: { id: roomId },
      content: encryptedContent,
      type,
    });
    // Lưu tin nhắn vào cơ sở dữ liệu
    const savedMessage = await this.messageRepository.save(message);

    // Giải mã nội dung tin nhắn đã lưu
    savedMessage.content = this.decryptContent(savedMessage.content);

    // Trả về đối tượng Message đầy đủ với các thuộc tính cần thiết
    return savedMessage;
  }

  async getLatestMessageInRoom(roomId: string): Promise<Message | null> {
    const latestMessages = await this.messageRepository.find({
      where: { room: { id: roomId } },
      order: { sent_at: 'DESC' },
      take: 1,
    });

    if (latestMessages.length > 0) {
      const latestMessage = latestMessages[0];
      latestMessage.content =
        latestMessages[0].type !== 'IMG'
          ? this.decryptContent(latestMessage.content)
          : 'Đã gửi một ảnh';
      return latestMessage;
    }

    return null;
  }

  async getMessagesByRoom(roomId: string) {
    const messages = await this.messageRepository.find({
      where: { room: { id: roomId } },
      order: { sent_at: 'ASC' },
      relations: ['sender'],
    });

    const returnMessages = messages.map((message) => ({
      id: message.id,
      content: this.decryptContent(message.content),
      senderId: message.sender.id,
      type: message.type,
    }));

    return returnMessages;
  }
}
