import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, In } from 'typeorm';
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

  async searchFriends(query: string, userId: string): Promise<User[]> {
    // Kiểm tra nếu query trống hoặc chỉ có khoảng trắng
    if (!query.trim()) {
      return [];
    }

    // Lấy danh sách các friend của người dùng
    const friends = await this.friendRepository.find({
      where: [{ user1: { id: userId } }, { user2: { id: userId } }],
      relations: ['user1', 'user2'],
    });

    // Tạo danh sách các userIds từ danh sách friends
    const userIds = new Set<string>();
    friends.forEach((friend) => {
      if (friend.user1.id !== userId) userIds.add(friend.user1.id);
      if (friend.user2.id !== userId) userIds.add(friend.user2.id);
    });
    // Lấy danh sách người dùng từ userIds
    const users = await this.userRepository.find({
      where: {
        id: In(Array.from(userIds)),
        fullname: ILike(`%${query}%`),
      },
    });

    return users;
  }
}
