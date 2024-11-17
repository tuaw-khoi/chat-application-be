import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { faker } from '@faker-js/faker';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsArray,
  IsBoolean,
} from 'class-validator';
import { UserResponse } from 'src/user/responses/user.response';
import { LikeResponse } from 'src/likes/reponses/like.response';
import { CommentResponse } from 'src/comment/responses/comment.response';
import { Like } from 'src/likes/entities/likes.entity';

export class PostResponse {
  @ApiProperty({ example: faker.string.uuid() })
  @IsNotEmpty()
  @IsUUID('4')
  id: string;

  @ApiProperty({ example: faker.lorem.paragraph() }) // Nội dung bài viết
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({ type: UserResponse })
  @IsNotEmpty()
  author: UserResponse;

  @ApiProperty({ example: faker.date.past() }) // Thời gian tạo bài viết
  @IsNotEmpty()
  createdAt: Date;

  @ApiProperty({ example: faker.date.recent() }) // Thời gian cập nhật bài viết
  @IsNotEmpty()
  updatedAt: Date;

  @ApiPropertyOptional({
    isArray: true,
    type: String,
    example: [faker.internet.url()],
  }) // Mảng URL ảnh
  @IsOptional()
  @IsArray()
  photos: string[];

  @ApiPropertyOptional({ type: LikeResponse })
  @IsOptional()
  likes?: Like[];

  @ApiPropertyOptional({ type: CommentResponse }) // Tổng số bình luận
  @IsOptional()
  comments?: CommentResponse[];

  @ApiProperty({ example: true }) // Trạng thái công khai của bài viết
  @IsNotEmpty()
  @IsBoolean()
  isPublic: boolean;

  @ApiProperty({ example: faker.number }) 
  @IsNotEmpty()
  @IsBoolean()
  totalComment?: number;
}
