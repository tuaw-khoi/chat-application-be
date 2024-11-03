import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { PhotoService } from 'src/photo/photo.service';
import { Photo } from 'src/photo/entities/photo.entity';
import { CreatePostDto } from './dtos/Create.dto';
import { UpdatePostDto } from './dtos/Update.dto';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly photoService: PhotoService,
  ) {}

  async create(createPostDto: CreatePostDto, userId: string): Promise<Post> {
    const { content, photos } = createPostDto;
    const post = this.postRepository.create({
      content,
      author: { id: userId },
    });

    if (photos && photos.length > 0) {
      post.photos = await this.photoService.createPhotos(photos);
    }

    return await this.postRepository.save(post);
  }

  async findAllById(userId: string): Promise<Post[]> {
    return this.postRepository.find({
      where: {
        author: { id: userId },
      },
      relations: ['author', 'photos', 'likes', 'comments'],
    });
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
}
