import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { FriendRequestModule } from './friend-request/friend-request.module';
import { FriendModule } from './friend/friend.module';
import { RoomModule } from './room/room.module';
import { MessageModule } from './message/message.module';
import { AppDataSource } from './db/migrations/data-source';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { FirebaseModule } from './config/firebase/firebase.module';
import { ChatModule } from './chat/chat.module';
import { SocketModule } from './socket/socket.module';
import { PostModule } from './post/post.module';
import { CommentController } from './comment/comment.controller';
import { CommentService } from './comment/comment.service';
import { CommentModule } from './comment/comment.module';
import { LikesController } from './likes/likes.controller';
import { LikesModule } from './likes/likes.module';
import { NotificationController } from './notification/notification.controller';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: async () => ({
        type: 'postgres',
        host: 'localhost',
        port: 5434,
        username: 'root',
        password: 'password',
        database: 'postgres',
        entities: ['dist/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
    }),
    UserModule,
    FriendRequestModule,
    FriendModule,
    RoomModule,
    MessageModule,
    AuthModule,
    FirebaseModule,
    ChatModule,
    SocketModule,
    PostModule,
    CommentModule,
    LikesModule,
    NotificationModule,
  ],
  controllers: [AppController, CommentController, LikesController, NotificationController],
  providers: [AppService, CommentService],
})
export class AppModule {}
