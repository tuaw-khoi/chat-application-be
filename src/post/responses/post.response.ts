import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { faker } from '@faker-js/faker';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsArray,
} from 'class-validator';

export class PostResponse {
  @ApiProperty({ example: faker.lorem.paragraph() }) // Nội dung bài viết
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({ example: faker.string.uuid() }) // ID của tác giả
  @IsNotEmpty()
  @IsUUID('4')
  authorId: string;

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

  @ApiPropertyOptional({ example: faker.number.int() }) // Tổng số lượt thích
  @IsOptional()
  totalLikes: number;

  @ApiPropertyOptional({ example: faker.number.int() }) // Tổng số bình luận
  @IsOptional()
  totalComments: number;
}
