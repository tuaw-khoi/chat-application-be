import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class createPrivateRoom {
  @IsString()
  @IsUUID('4', { each: true })
  senderId: string;

  @IsString()
  @IsUUID('4', { each: true })
  receiverId: string;
}
