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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
