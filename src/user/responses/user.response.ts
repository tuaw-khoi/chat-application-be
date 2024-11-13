// UserResponse.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { faker } from '@faker-js/faker';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class UserResponse {
  @ApiProperty({ example: faker.string.uuid() }) // ID của user
  @IsNotEmpty()
  @IsUUID('4')
  id: string;

  @ApiProperty({ example: faker.internet.username() }) // Tên người dùng
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiPropertyOptional({ example: faker.person.fullName() }) // Họ tên đầy đủ
  @IsOptional()
  @IsString()
  fullname?: string;

  @ApiPropertyOptional({ example: faker.internet.email() }) // Email
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ example: faker.image.avatar() })
  @IsOptional()
  img?: string;
}
