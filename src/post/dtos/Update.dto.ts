import { IsOptional, IsString } from 'class-validator';

export class UpdatePostDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  photos?: string[]; // Danh sách URL hoặc ID của ảnh
}
