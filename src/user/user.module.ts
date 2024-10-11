import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { Friend } from 'src/friend/entities/friend.entity';
import { FriendModule } from 'src/friend/friend.module';
import { RoomModule } from 'src/room/room.module';
import { FriendRequestModule } from 'src/friend-request/friend-request.module';
import { FriendRequest } from 'src/friend-request/entities/friendRequest.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([User, Friend]),
    FriendModule,
    forwardRef(() => RoomModule),
  ],

  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
