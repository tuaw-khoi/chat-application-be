import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Friend } from './entities/friend.entity';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class FriendService {
  constructor(
    @InjectRepository(Friend)
    private friendRepository: Repository<Friend>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getFriends(userId: string): Promise<Friend[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['friends'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.friends;
  }

  async checkFriendship(userId1: string, userId2: string): Promise<boolean> {
    const friendship = await this.friendRepository.findOne({
      where: [
        { user1: { id: userId1 }, user2: { id: userId2 } },
        { user1: { id: userId2 }, user2: { id: userId1 } },
      ],
    });
    return !!friendship;
  }
}
