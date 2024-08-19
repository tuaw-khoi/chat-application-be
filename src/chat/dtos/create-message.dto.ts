import { IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  content: string;

  @IsUUID()
  senderId: string;

  @IsUUID()
  @IsOptional()
  receiverId?: string;

  @IsUUID()
  roomId: string;
}
