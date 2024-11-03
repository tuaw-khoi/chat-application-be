import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ example: 'This is a comment content.' })
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    example: 'Post ID to comment on',
    type: String,
    format: 'uuid',
  })
  @IsUUID()
  postId: string;

  @ApiProperty({
    example: 'Parent comment ID if replying to another comment',
    type: String, format: 'uuid',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  parentCommentId?: string;
}
