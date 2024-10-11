import { IsUUID } from 'class-validator';

export class RemoveUserFromRoomDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  roomId: string;
}
