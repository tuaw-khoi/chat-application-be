import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsBoolean()
  @IsOptional()
  isPublic: boolean = false;

  @IsArray()
  @IsUUID('4', { each: true }) // Mảng UUID của các thành viên trong phòng
  members: string[];

  @IsUUID('4', { each: true })
  userId: string;
}
