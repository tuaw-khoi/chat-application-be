import {
  Controller,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { User } from 'src/user/entities/user.entity';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { CreateCommentDto } from './dtos/create.dto';
import { CurrentUser } from 'src/config/decorators/user.decorator';
import { UpdateCommentDto } from './dtos/update.dto';

@ApiTags('comments')
@Controller('comments')
@JwtAuthGuard()
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new comment' })
  @ApiResponse({ status: 201, description: 'Comment created successfully' })
  async createComment(
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser() user: User,
  ) {
    return this.commentService.createComment(createCommentDto, user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a comment' })
  @ApiResponse({ status: 200, description: 'Comment updated successfully' })
  async updateComment(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentService.updateComment(id, updateCommentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiResponse({ status: 204, description: 'Comment deleted successfully' })
  async deleteComment(@Param('id') id: string) {
    await this.commentService.deleteComment(id);
  }
}
