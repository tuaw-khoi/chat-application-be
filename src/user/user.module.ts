import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { Friend } from 'src/friend/entities/friend.entity';
import { FriendModule } from 'src/friend/friend.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // Khai báo User entity
  ],

  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
