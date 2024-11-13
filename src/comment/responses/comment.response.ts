import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { faker } from '@faker-js/faker';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsArray,
} from 'class-validator';
import { UserResponse } from 'src/user/responses/user.response';
import { LikeResponse } from 'src/likes/reponses/like.response';

export class CommentResponse {
  @ApiProperty({ example: faker.string.uuid() }) // ID của bình luận
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @ApiProperty({ example: faker.lorem.sentence() }) // Nội dung của bình luận
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({ type: UserResponse }) // Tác giả của bình luận
  @IsNotEmpty()
  author: UserResponse;

  @ApiProperty({ example: faker.date.past() }) // Thời gian tạo bình luận
  @IsNotEmpty()
  createdAt: Date;

  @ApiPropertyOptional({ type: LikeResponse, isArray: true }) // Danh sách lượt thích
  @IsOptional()
  @IsArray()
  likes?: LikeResponse[];

  @ApiPropertyOptional({ type: CommentResponse, isArray: true }) // Danh sách trả lời của bình luận
  @IsOptional()
  @IsArray()
  replies?: CommentResponse[];

  @ApiPropertyOptional({ example: faker.string.uuid() }) // ID của bình luận cha (nếu có)
  @IsOptional()
  @IsUUID()
  parentCommentId?: string;
}
