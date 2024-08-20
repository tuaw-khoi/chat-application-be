import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { Room } from './entities/room.entity';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { Message } from 'src/message/entities/message.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Room, User,Message])],
  providers: [RoomService, UserService],
  controllers: [RoomController],
  exports: [RoomService], // Export RoomService if needed elsewhere
})
export class RoomModule {}
