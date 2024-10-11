import { IsUUID } from 'class-validator';

export class AddUserToRoomDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  roomId: string;
}
