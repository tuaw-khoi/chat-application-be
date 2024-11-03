import {
  Controller,
  Post,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { LikesService } from './likes.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { User } from 'src/user/entities/user.entity';
import { CurrentUser } from 'src/config/decorators/user.decorator';
import { ApiCreatedResponse, ApiOperation } from '@nestjs/swagger';
import { LikeResponse } from './reponses/like.response';

@Controller('posts/:postId/likes')
@JwtAuthGuard()
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post()
  @ApiOperation({
    description: 'Like a post',
  })
  @ApiCreatedResponse({
    type: LikeResponse,
  })
  @HttpCode(HttpStatus.CREATED)
  async likePost(@Param('postId') postId: string, @CurrentUser() user: User) {
    return this.likesService.likePost(postId, user);
  }

  @Delete()
  @ApiOperation({
    summary: 'Unlike a post',
    description:
      'Removes the like from the specified post by the currently authenticated user.',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async unlikePost(@Param('postId') postId: string, @CurrentUser() user: User) {
    return this.likesService.unlikePost(postId, user.id);
  }
}
