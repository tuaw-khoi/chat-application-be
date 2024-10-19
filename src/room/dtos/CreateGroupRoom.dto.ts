// src/room/dtos/create-group.dto.ts
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateGroupDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  img?: string; // Link ảnh nhóm, có thể không cần thiết

  @IsArray()
  @IsNotEmpty()
  members: string[]; // Danh sách userId của các thành viên trong nhóm

  @IsNotEmpty()
  userId: string; // ID của người tạo nhóm
}
