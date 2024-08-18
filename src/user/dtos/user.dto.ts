import { IsOptional, IsString, IsEmail, IsNotEmpty } from 'class-validator';
import { OmitType } from '@nestjs/mapped-types';
export enum Role {
  Admin = 'admin',
  User = 'user',
}

export class UserDto {
  @IsString()
  id: string;

  @IsString()
  username: string;

  @IsString()
  fulllname: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsEmail()
  email: string;

  @IsString()
  role: string;

  @IsOptional()
  @IsString()
  img?: string;
}

export class UserWithGoogleDto {
  @IsNotEmpty()
  @IsString()
  fullname: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  img?: string;
}
