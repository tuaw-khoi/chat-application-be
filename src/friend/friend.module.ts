import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Friend } from './entities/friend.entity';
import { FriendService } from './friend.service';
import { FriendController } from './friend.controller';
import { User } from 'src/user/entities/user.entity';
import { UserModule } from 'src/user/user.module';
import { Room } from 'src/room/entities/room.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Friend, User, Room])],
  controllers: [FriendController],
  providers: [FriendService],
  exports: [FriendService],
})
export class FriendModule {}
