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
  Query,
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
import { GetPostsResponse } from './responses/get.response';

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
      id: postEntity.id,
      content: postEntity.content,
      author: postEntity.author,
      createdAt: postEntity.createdAt,
      updatedAt: postEntity.updatedAt,
      photos: postEntity.photos?.map((photo) => photo.url),
      isPublic: postEntity.isPublic,
    };

    return postResponse;
  }

  @Get()
  @ApiOperation({ description: 'Find all posts with pagination' })
  @ApiCreatedResponse({ type: PostEntity, isArray: true })
  @HttpCode(HttpStatus.OK)
  async findAll(
    @CurrentUser() user: User,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<GetPostsResponse> {
    const { data, total } = await this.postService.findAllById(
      user.id,
      page,
      limit,
    );

    return {
      data: data.map((post) => ({
        id: post.id,
        content: post.content,
        author: post.author,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        photos: post.photos?.map((photo) => photo.url),
        likes: post.likes,
        comments: post.comments,
        isPublic: post.isPublic,
      })),
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    };
  }

  @Get('friends')
  @ApiOperation({
    description: 'Get posts of user and their friends with pagination',
  })
  @ApiCreatedResponse({ type: PostEntity, isArray: true })
  @HttpCode(HttpStatus.OK)
  async getAllPostsOfFriendsAndUser(
    @CurrentUser() user: User,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<GetPostsResponse> {
    const { data, total } = await this.postService.getAllPostsOfFriendsAndUser(
      user.id,
      page,
      limit,
    );

    return {
      data: data.map((post: any) => ({
        id: post.id,
        content: post.content,
        author: post.author,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        photos: post.photos?.map((photo) => photo.url),
        likes: post.likes,
        comments: post.comments,
        isPublic: post.isPublic,
        totalComment: post.totalComment,
      })),
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    };
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
