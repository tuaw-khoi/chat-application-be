import { IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  emailorusername: string;

  @IsNotEmpty()
  @IsString()
  password?: string;
}
