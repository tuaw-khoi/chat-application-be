import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Post } from 'src/post/entities/post.entity';
import { User } from 'src/user/entities/user.entity';
import { Like } from './entities/likes.entity';
import { PostService } from 'src/post/post.service';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,
    private readonly postService: PostService,
    private readonly notificationService: NotificationService,
  ) {}

  async likePost(postId: string, user: User): Promise<Like> {
    const post = await this.postService.findOne(postId);

    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    const existLike = await this.likeRepository.findOne({
      where: { post: { id: postId }, user: { id: user.id } },
    });

    if (existLike) {
      return existLike;
    }

    const like = await this.likeRepository.save({
      post,
      user: { id: user.id } as User,
    });

    const recipient = await this.postService.findPostOwner(postId);
    if (recipient && recipient.id !== user.id) {
      await this.notificationService.createLikeNotification(
        recipient,
        user,
        postId,
      );
    }

    return like;
  }

  async unlikePost(postId: string, userId: string): Promise<void> {
    const like = await this.likeRepository.findOne({
      where: { post: { id: postId }, user: { id: userId } },
    });

    if (!like) {
      throw new NotFoundException('Like not found');
    }

    await this.likeRepository.remove(like);
  }

  async countLikes(postId: string): Promise<number> {
    return this.likeRepository.count({ where: { post: { id: postId } } });
  }

  async countLikesForPosts(postIds: string[]): Promise<number> {
    if (!postIds || postIds.length === 0) {
      return 0;
    }

    const totalLikes = await this.likeRepository
      .createQueryBuilder('like')
      .where('like.postId IN (:...postIds)', { postIds })
      .getCount();

    return totalLikes;
  }

  async countLikesInWeek(): Promise<number> {
    // Tính khoảng thời gian tuần hiện tại
    const now = new Date();
    const startOfWeek = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - now.getDay(), // Lấy ngày đầu tiên trong tuần (Chủ nhật)
      0,
      0,
      0,
      0,
    );
    const endOfWeek = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - now.getDay() + 6, // Lấy ngày cuối cùng trong tuần (Thứ bảy)
      23,
      59,
      59,
      999,
    );
    return this.likeRepository.count({
      where: {
        createdAt: Between(startOfWeek, endOfWeek),
      },
    });
  }

  async countLikesInMonth(): Promise<number> {
    // Tính khoảng thời gian tháng hiện tại
    const now = new Date();
    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
      0,
      0,
      0,
      0,
    );
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1, // Tháng tiếp theo
      0, // Ngày cuối cùng của tháng hiện tại
      23,
      59,
      59,
      999,
    );

    // Đếm số lượng like trong khoảng thời gian tháng hiện tại
    return this.likeRepository.count({
      where: {
        createdAt: Between(startOfMonth, endOfMonth),
      },
    });
  }
}
