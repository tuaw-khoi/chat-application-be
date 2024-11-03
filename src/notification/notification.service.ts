import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async createLikeNotification(recipient: User, liker: User, postId: string) {
    const message = `${liker.username} liked your post.`;
    const notification = this.notificationRepository.create({
      message,
      recipient,
      type: 'like',
      postId,
    });
    await this.notificationRepository.save(notification);
    return notification;
  }

  async createCommentNotification(
    recipient: User,
    commenter: User,
    postId: string,
  ) {
    const message = `${commenter.username} commented on your post.`;
    const notification = this.notificationRepository.create({
      message,
      recipient,
      type: 'comment',
      postId,
    });
    await this.notificationRepository.save(notification);
    return notification;
  }

  async createReplyNotification(
    recipient: User,
    replier: User,
    postId: string,
  ) {
    const message = `${replier.username} replied to your comment.`;
    const notification = this.notificationRepository.create({
      message,
      recipient,
      type: 'reply',
      postId,
    });
    await this.notificationRepository.save(notification);
    return notification;
  }

  async markAsRead(notificationId: string) {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId },
    });
    if (!notification) throw new NotFoundException(`Notification not found`);
    notification.isRead = true;
    return await this.notificationRepository.save(notification);
  }

  async getNotifications(userId: string) {
    return this.notificationRepository.find({
      where: { recipient: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }
}
