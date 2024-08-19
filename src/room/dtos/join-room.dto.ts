import { IsString } from 'class-validator';

export class JoinRoomDto {
  @IsString()
  userId: string;
}
// export class JoinRoomDto {
//   @IsString()
//   userId: string;

//   @IsUUID()
//   roomId: string;
// }
