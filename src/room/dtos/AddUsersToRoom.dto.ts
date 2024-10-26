import { IsNotEmpty, IsUUID } from "class-validator";

export class AddUsersToRoomDto {
  @IsNotEmpty()
  @IsUUID('all', { each: true })
  userIds: string[];

  @IsNotEmpty()
  @IsUUID()
  roomId: string;
}
