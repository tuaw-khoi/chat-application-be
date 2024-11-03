import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // Nếu bạn sử dụng TypeORM
import { PhotoController } from './photo.controller';
import { PhotoService } from './photo.service';
import { Photo } from './entities/photo.entity'; // Import entity Photo

@Module({
  imports: [
    TypeOrmModule.forFeature([Photo]), 
  ],
  controllers: [PhotoController],
  providers: [PhotoService],
  exports: [PhotoService], 
})
export class PhotoModule {}
