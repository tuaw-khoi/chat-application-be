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
    const message = `${liker.fullname} đã thích bài viết của bạn.`;
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
    const message = `${commenter.fullname} đã bình luận bài viết của bạn.`;
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
    const message = `${replier.fullname} đã trả lời bình luận của bạn.`;
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

  async getAllNotifications(userId: string) {
    // Tìm tất cả các thông báo của user
    const notifications = await this.notificationRepository.find({
      where: { recipient: { id: userId } },
      order: { createdAt: 'DESC' },
    });

    return notifications.map((notification) => ({
      id: notification.id,
      message: notification.message,
      isRead: notification.isRead,
      type: notification.type,
      postId: notification.postId,
      createdAt: notification.createdAt,
    }));
  }
}
