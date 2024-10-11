import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dtos/create-room.dto';
import { createPrivateRoom } from './dtos/createPrivateRoom.dto';

@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post()
  async create(@Body() createRoomDto: CreateRoomDto) {
    return this.roomService.createRoom(createRoomDto);
  }

  @Post('private-room')
  async createPrivateRoom(@Body() createPrivateRoomDto: createPrivateRoom) {
    return this.roomService.createPrivateRoom(createPrivateRoomDto);
  }

  @Get('public')
  async findPublicRooms() {
    return this.roomService.findPublicRooms();
  }

  // @Post(':roomId/join')
  // async join(
  //   @Param('roomId') roomId: number,
  //   @Body() joinRoomDto: JoinRoomDto,
  // ) {
  //   return this.roomService.addUserToRoom(joinRoomDto.userId, roomId);
  // }

  // @Post(':roomId/leave')
  // async leave(
  //   @Param('roomId') roomId: number,
  //   @Body() joinRoomDto: JoinRoomDto,
  // ) {
  //   return this.roomService.removeUserFromRoom(roomId, joinRoomDto.userId);
  // }

  // @Get()
  // async findAll() {
  //   return this.roomService.findAllRooms();
  // }

  // @Get(':id')
  // async findOne(@Param('id') id: number) {
  //   return this.roomService.findOneRoom(id);
  // }

  // @Get(':userId')
  // async getUserRooms(@Param('userId') userId: string) {
  //   const rooms = await this.roomService.getUserRooms(userId);
  //   return rooms;
  // }

  // @Get(':roomId/messages')
  // async getRoomMessages(@Param('roomId') roomId: number) {
  //   const messages = await this.roomService.getRoomMessages(roomId);
  //   return messages;
  // }
}
