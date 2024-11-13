import { ApiProperty } from '@nestjs/swagger';
import { PostResponse } from './post.response';

export class GetPostsResponse {
  @ApiProperty({ type: [PostResponse] })
  data: PostResponse[];

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 1 }) 
  currentPage: number;

  @ApiProperty({ example: 10 }) 
  totalPages: number;
}
