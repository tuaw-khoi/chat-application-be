import { IsString, IsBoolean, IsArray } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  name: string;

  @IsBoolean()
  isPublic: boolean;

  @IsArray()
  @IsString({ each: true })
  admins: string[];
}
