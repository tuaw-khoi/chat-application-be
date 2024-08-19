import { IsString, IsUUID } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  content: string;

  @IsUUID()
  senderId: string;

  @IsUUID()
  roomId: string;
}
