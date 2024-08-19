import { IsUUID } from 'class-validator';

export class JoinRoomDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  roomId: string;
}
