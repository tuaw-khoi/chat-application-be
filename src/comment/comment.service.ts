import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { User } from 'src/user/entities/user.entity';
import { CreateCommentDto } from './dtos/create.dto';
import { UpdateCommentDto } from './dtos/update.dto';
import { PostService } from 'src/post/post.service';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    private readonly postService: PostService,
    private readonly notificationService: NotificationService,
  ) {}

  async createComment(
    createCommentDto: CreateCommentDto,
    author: User,
  ): Promise<Comment> {
    const { content, postId, parentCommentId } = createCommentDto;

    const post = await this.postService.findOne(postId);
    if (!post) throw new NotFoundException(`Post with ID ${postId} not found`);

    const parentComment = parentCommentId
      ? await this.commentRepository.findOne({
          where: { id: parentCommentId },
          relations: ['author'],
        })
      : null;

    const savedComment = await this.commentRepository.save({
      content,
      author,
      post,
      parentComment,
    });

    const recipient = await this.postService.findPostOwner(postId);

    if (recipient && recipient.id !== author.id) {
      await this.notificationService.createCommentNotification(
        recipient,
        author,
        postId,
      );
    }

    if (parentComment && parentComment.author.id !== author.id) {
      await this.notificationService.createReplyNotification(
        parentComment.author,
        author,
        postId,
      );
    }

    return savedComment;
  }

  async updateComment(
    id: string,
    updateCommentDto: UpdateCommentDto,
  ): Promise<Comment> {
    const comment = await this.commentRepository.preload({
      id,
      ...updateCommentDto,
    });

    if (!comment)
      throw new NotFoundException(`Comment with ID ${id} not found`);

    return await this.commentRepository.save(comment);
  }

  async deleteComment(id: string): Promise<void> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['replies'],
    });

    if (!comment)
      throw new NotFoundException(`Comment with ID ${id} not found`);

    await this.commentRepository.remove(comment);
  }

  async getAllReplies(commentId: string): Promise<Comment[]> {
    // Lấy comment gốc để kiểm tra tồn tại
    const parentComment = await this.commentRepository.findOne({
      where: { id: commentId },
    });
    if (!parentComment)
      throw new NotFoundException(`Comment with ID ${commentId} not found`);

    // Lấy tất cả các replies cho comment này mà không cần đệ quy
    const replies = await this.commentRepository.find({
      where: { parentComment: { id: commentId } },
      relations: ['author'], // Bao gồm cả thông tin tác giả nếu cần
    });

    return replies;
  }
}
