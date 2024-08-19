import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dtos/create-room.dto';
import { JoinRoomDto } from './dtos/join-room.dto';

@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post()
  async create(@Body() createRoomDto: CreateRoomDto) {
    return this.roomService.createRoom(createRoomDto);
  }

  @Post(':roomId/join')
  async join(
    @Param('roomId') roomId: string,
    @Body() joinRoomDto: JoinRoomDto,
  ) {
    return this.roomService.addUserToRoom(roomId, joinRoomDto.userId);
  }

  @Post(':roomId/leave')
  async leave(
    @Param('roomId') roomId: string,
    @Body() joinRoomDto: JoinRoomDto,
  ) {
    return this.roomService.removeUserFromRoom(joinRoomDto.userId, roomId);
  }

  @Get()
  async findAll() {
    return this.roomService.findAllRooms();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.roomService.findOneRoom(id);
  }
}
