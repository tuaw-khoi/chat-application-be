import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { PhotoModule } from 'src/photo/photo.module';
import { FriendModule } from 'src/friend/friend.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [TypeOrmModule.forFeature([Post]),PhotoModule,FriendModule,NotificationModule],
  providers: [PostService],
  controllers: [PostController],
  exports:[PostService]
})
export class PostModule {}
