import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateCommentDto {
  @ApiProperty({ example: 'Updated comment content.' })
  @IsNotEmpty()
  content: string;
}
