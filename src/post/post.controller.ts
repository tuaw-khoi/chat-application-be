import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PostService } from './post.service';
import { Post as PostEntity } from './entities/post.entity';
import { CreatePostDto } from './dtos/Create.dto';
import { UpdatePostDto } from './dtos/Update.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { PostResponse } from './responses/post.response';
import { ApiCreatedResponse, ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from 'src/config/decorators/user.decorator';
import { User } from 'src/user/entities/user.entity';

@Controller('posts')
@JwtAuthGuard()
export class PostController {
  constructor(private readonly postService: PostService) {}

  // Tạo bài viết mới
  @Post()
  @ApiOperation({ description: 'Create a new post' })
  @ApiCreatedResponse({ type: PostResponse })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createPostDto: CreatePostDto,
    @CurrentUser() user: User,
  ): Promise<PostResponse> {
    const postEntity = await this.postService.create(createPostDto, user.id);

    const postResponse: PostResponse = {
      content: postEntity.content,
      authorId: postEntity.author.id,
      createdAt: postEntity.createdAt,
      updatedAt: postEntity.updatedAt,
      photos: postEntity.photos?.map((photo) => photo.url),
      totalLikes: postEntity.likes ? postEntity.likes.length : 0,
      totalComments: postEntity.comments ? postEntity.comments.length : 0,
    };

    return postResponse;
  }

  @Get()
  @ApiOperation({ description: 'Find all posts' })
  @ApiCreatedResponse({ type: PostResponse })
  @HttpCode(HttpStatus.OK)
  async findAll(@CurrentUser() user: User): Promise<PostEntity[]> {
    return this.postService.findAllById(user.id);
  }

  @ApiOperation({ description: 'Find a post' })
  @ApiCreatedResponse({ type: PostResponse })
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<PostEntity> {
    return this.postService.findOne(id);
  }

  @ApiOperation({ description: 'update a posta' })
  @ApiCreatedResponse({ type: PostResponse })
  @HttpCode(HttpStatus.OK)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @CurrentUser() user: User,
  ): Promise<PostEntity> {
    return this.postService.update(id, updatePostDto, user.id);
  }

  // Xóa bài viết theo ID
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.postService.remove(id, user.id);
  }
}
