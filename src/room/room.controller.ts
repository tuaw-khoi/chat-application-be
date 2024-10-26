import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dtos/create-room.dto';
import { createPrivateRoom } from './dtos/createPrivateRoom.dto';
import { CreateGroupDto } from './dtos/CreateGroupRoom.dto';
import { Room } from './entities/room.entity';
import { AddUsersToRoomDto } from './dtos/AddUsersToRoom.dto';

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

  @Get('public/:userId')
  async getPublicRooms(@Param('userId') userId: string): Promise<Room[]> {
    return this.roomService.getPublicRoomsByUser(userId);
  }

  @Post('group')
  async createGroup(@Body() createGroupDto: CreateGroupDto) {
    return this.roomService.createGroup(createGroupDto);
  }

  @Get(':roomId/details')
  async getRoomDetailsWithImages(@Param('roomId') roomId: string) {
    return this.roomService.getRoomDetailsWithImages(roomId);
  }

  @Delete(':roomId/user/:userId')
  async removeUserFromRoom(
    @Param('roomId') roomId: string,
    @Param('userId') userId: string,
  ) {
    return this.roomService.removeUserFromRoom(roomId, userId);
  }

  @Delete(':roomId/remove-user')
  async removeUserFromRoomByAdmin(
    @Param('roomId') roomId: string,
    @Body('senderId') senderId: string, // ID người gửi yêu cầu
    @Body('targetUserId') targetUserId: string, // ID người bị xóa khỏi phòng
  ) {
    return this.roomService.removeUserFromRoomByAdmin(
      roomId,
      senderId,
      targetUserId,
    );
  }

  @Post(':roomId/add-users')
  async addUsersToRoom(
    @Param('roomId') roomId: string,
    @Body() createUsersToRoomDto: AddUsersToRoomDto,
  ) {
    return this.roomService.addUsersToRoom(
      roomId,
      createUsersToRoomDto.userIds,
    );
  }

  @Post(':roomId/leave')
  async leaveRoom(
    @Param('roomId') roomId: string,
    @Body('userId') userId: string,
  ) {
    return this.roomService.leaveRoom(userId, roomId);
  }

  @Patch(':roomId/change-admin-status')
  async changeAdminStatus(
    @Param('roomId') roomId: string,
    @Body('senderId') senderId: string,
    @Body('targetUserId') targetUserId: string,
    @Body('isAdmin') isAdmin: boolean,
  ) {
    return this.roomService.changeAdminStatus(
      roomId,
      senderId,
      targetUserId,
      isAdmin,
    );
  }
}
