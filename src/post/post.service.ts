import { Comment } from './../comment/entities/comment.entity';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { PhotoService } from 'src/photo/photo.service';
import { Photo } from 'src/photo/entities/photo.entity';
import { CreatePostDto } from './dtos/Create.dto';
import { UpdatePostDto } from './dtos/Update.dto';
import { User } from 'src/user/entities/user.entity';
import { FriendService } from 'src/friend/friend.service';
import { da } from '@faker-js/faker/.';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly photoService: PhotoService,
    private readonly friendService: FriendService,
  ) {}

  async create(createPostDto: CreatePostDto, userId: string): Promise<Post> {
    const { content, photos, isPublic = true } = createPostDto;
    const post = this.postRepository.create({
      content,
      isPublic,
      author: { id: userId },
    });

    if (photos && photos.length > 0) {
      post.photos = await this.photoService.createPhotos(photos);
    }

    return await this.postRepository.save(post);
  }

  async findAllById(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ data: Post[]; total: number }> {
    const [data, total] = await this.postRepository.findAndCount({
      where: {
        author: { id: userId },
      },
      relations: ['author', 'photos', 'likes', 'comments'],
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }

  async update(
    id: string,
    updatePostDto: UpdatePostDto,
    userId: string,
  ): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id, author: { id: userId } },
      relations: ['author', 'photos'],
    });

    if (!post) throw new NotFoundException(`Post with ID ${id} not found`);

    if (post.author.id !== userId)
      throw new ForbiddenException(
        'You do not have permission to edit this post',
      );

    if (updatePostDto.content) {
      post.content = updatePostDto.content;
    }

    if (updatePostDto.isPublic !== undefined)
      post.isPublic = updatePostDto.isPublic;

    if (updatePostDto.photos && updatePostDto.photos.length > 0) {
      post.photos = await this.photoService.findOrCreateMultiple(
        updatePostDto.photos,
      );
    }

    return await this.postRepository.save(post);
  }

  async remove(id: string, userId: string): Promise<void> {
    const post = await this.postRepository.findOne({
      where: { id, author: { id: userId } },
      relations: ['author', 'photos'],
    });
    await this.postRepository.remove(post);
  }

  async findPostOwner(postId: string): Promise<User> {
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: ['author'],
    });

    if (!post) throw new NotFoundException(`Post with ID ${postId} not found`);

    return post.author;
  }

  async getAllPostsOfFriendsAndUser(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ data: Post[]; total: number }> {
    const friends = await this.friendService.getFriend(userId);
    const friendIds = friends.map((friend) =>
      friend.user1.id === userId ? friend.user2.id : friend.user1.id,
    );

    friendIds.push(userId);

    const [data, total] = await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.photos', 'photos')
      .leftJoinAndSelect('post.comments', 'comments')
      .leftJoinAndSelect('comments.author', 'commentAuthor')
      .leftJoinAndSelect('comments.parentComment', 'parentCommentId')
      .leftJoinAndSelect('post.likes', 'likes')
      .leftJoinAndSelect('likes.user', 'likeUser')
      .leftJoinAndSelect('likeUser.roomUsers', 'roomUser')
      .leftJoinAndSelect('roomUser.room', 'room')
      .where('post.author.id IN (:...friendIds)', { friendIds })
      .orderBy('post.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    const filteredData = data.map((post: any) => {
      const totalComment = post.comments.length;
      if (post.comments) {
        post.comments = post.comments
          .filter((comment) => comment.parentComment === null)
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );
      }

      // Xử lý likes và room của mỗi post
      post.likes.forEach((like: any) => {
        like.user.roomUsers = like.user.roomUsers
          .filter((roomUser) => roomUser.room.isPublic === false)
          .map((roomUser) => ({
            ...roomUser,
            room: { ...roomUser.room, name: like.user.fullname },
          }));
      });
      post.totalComment = totalComment;
      return post;
    });
    return { data: filteredData, total };
  }

  async getAllPostsByUser(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ data: Post[]; total: number }> {
    const [data, total] = await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.photos', 'photos')
      .leftJoinAndSelect('post.comments', 'comments')
      .leftJoinAndSelect('comments.author', 'commentAuthor')
      .leftJoinAndSelect('comments.parentComment', 'parentCommentId')
      .leftJoinAndSelect('post.likes', 'likes')
      .leftJoinAndSelect('likes.user', 'likeUser')
      .where('post.author.id = :userId', { userId })
      .orderBy('post.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const filteredData = data.map((post: any) => {
      const totalComment = post.comments.length;

      if (post.comments) {
        post.comments = post.comments
          .filter((comment) => comment.parentComment === null)
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );
      }

      post.totalComment = totalComment;
      return post;
    });
    return { data: filteredData, total };
  }

  async findOnePostWithDetails(
    userId: string,
    postId: string,
  ): Promise<
    Omit<Post, 'photos'> & { photos: string[]; totalComment: number }
  > {
    const friends = await this.friendService.getFriend(userId);
    const friendIds = friends.map((friend) =>
      friend.user1.id === userId ? friend.user2.id : friend.user1.id,
    );

    // Thêm userId vào danh sách friendIds
    friendIds.push(userId);

    const post = await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.photos', 'photos')
      .leftJoinAndSelect('post.comments', 'comments')
      .leftJoinAndSelect('comments.author', 'commentAuthor')
      .leftJoinAndSelect('comments.parentComment', 'parentCommentId')
      .leftJoinAndSelect('post.likes', 'likes')
      .leftJoinAndSelect('likes.user', 'likeUser')
      .leftJoinAndSelect('likeUser.roomUsers', 'roomUser')
      .leftJoinAndSelect('roomUser.room', 'room')
      .where('post.author.id IN (:...friendIds)', { friendIds })
      .andWhere('post.id = :postId', { postId })
      .getOne();

    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    // Tổng số comment
    const totalComment = post.comments.length;

    // Lọc và sắp xếp comment
    if (post.comments) {
      post.comments = post.comments
        .filter((comment) => comment.parentComment === null)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
    }

    // Xử lý likes và room
    post.likes.forEach((like: any) => {
      like.user.roomUsers = like.user.roomUsers
        .filter((roomUser) => roomUser.room.isPublic === false)
        .map((roomUser) => ({
          ...roomUser,
          room: { ...roomUser.room, name: like.user.fullname },
        }));
    });

    // Tạo mảng photos chỉ chứa URL
    const photos = post.photos.map((photo) => photo.url);

    // Thêm `photos` và `totalComment` vào post
    return {
      ...post,
      photos,
      totalComment,
    };
  }

  async findOne(id: string): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['author', 'photos', 'likes', 'comments'],
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return post;
  }
}
