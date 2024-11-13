import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Photo } from './entities/photo.entity';

@Injectable()
export class PhotoService {
  constructor(
    @InjectRepository(Photo)
    private readonly photoRepository: Repository<Photo>,
  ) {}

  async createPhotos(urls: string[]): Promise<Photo[]> {
    const photos = urls.map((url) => this.photoRepository.create({ url }));
    return this.photoRepository.save(photos);
  }

  async findOrCreate(criteria: string): Promise<Photo> {
    const photo = await this.photoRepository.findOne({
      where: { url: criteria },
    });

    return (
      photo ??
      this.photoRepository.save(this.photoRepository.create({ url: criteria }))
    );
  }

  async findOrCreateMultiple(criteriaList: string[]): Promise<Photo[]> {
    const photos = await Promise.all(
      criteriaList.map((criteria) => this.findOrCreate(criteria)),
    );

    return photos;
  }
}
