import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { faker } from '@faker-js/faker';

export class LikeResponse {
  @ApiProperty({ example: faker.string.uuid() }) 
  @IsNotEmpty()
  @IsUUID('4')
  id: string;

  @ApiProperty({ example: faker.string.uuid() })
  @IsNotEmpty()
  @IsUUID('4')
  userId: string;

  @ApiProperty({ example: faker.string.uuid() }) 
  @IsNotEmpty()
  @IsUUID('4')
  postId: string;

  @ApiProperty({ example: faker.date.past() }) 
  @IsNotEmpty()
  createdAt: Date;
}
