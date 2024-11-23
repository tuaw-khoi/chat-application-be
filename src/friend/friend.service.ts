import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, In } from 'typeorm';
import { Friend } from './entities/friend.entity';
import { User } from 'src/user/entities/user.entity';
import { Room } from 'src/room/entities/room.entity';

@Injectable()
export class FriendService {
  constructor(
    @InjectRepository(Friend)
    private friendRepository: Repository<Friend>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
  ) {}

  async getFriend(userId: string): Promise<Friend[]> {
    const friends = await this.friendRepository.find({
      where: [{ user1: { id: userId } }, { user2: { id: userId } }],
      relations: ['user1', 'user2'],
    });

    if (!friends) {
      throw new NotFoundException('User not found');
    }

    return friends;
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
    // Nếu query trống hoặc chỉ có khoảng trắng, trả về mảng rỗng
    if (!query.trim()) {
      return [];
    }

    // Lấy danh sách bạn bè (cả user1 và user2) của người dùng
    const friends = await this.friendRepository.find({
      where: [{ user1: { id: userId } }, { user2: { id: userId } }],
      relations: ['user1', 'user2'],
    });

    // Lấy danh sách userId từ bạn bè
    const userIds = new Set<string>();
    friends.forEach((friend) => {
      if (friend.user1.id !== userId) userIds.add(friend.user1.id);
      if (friend.user2.id !== userId) userIds.add(friend.user2.id);
    });

    // Tìm kiếm user trong danh sách bạn bè dựa theo query
    const users = await this.userRepository.find({
      where: {
        id: In(Array.from(userIds)),
        fullname: ILike(`%${query}%`), // Tìm kiếm theo tên đầy đủ khớp với query
      },
    });

    return users;
  }

  async getAllFriends(userId: string): Promise<any[]> {
    const friends = await this.friendRepository.find({
      where: [{ user1: { id: userId } }, { user2: { id: userId } }],
      relations: ['user1', 'user2'],
    });

    const friendsData = await Promise.all(
      friends.map(async (friend) => {
        const friendUser =
          friend.user1.id === userId ? friend.user2 : friend.user1;
        // Kiểm tra nếu có room chứa cả userId và friendUser.id
        const room = await this.roomRepository
          .createQueryBuilder('room')
          .where('room.isPublic = false') // Phòng không công khai
          .andWhere('(room.name = :name1 OR room.name = :name2)', {
            name1: `${userId}_${friendUser.id}`,
            name2: `${friendUser.id}_${userId}`,
          })
          .getOne();

        return {
          id: friendUser.id,
          fullname: friendUser.fullname,
          img: friendUser.img,
          room: room
            ? {
                roomName: friendUser.fullname,
                roomId: room.id,
                roomImg: friendUser.img,
              }
            : null,
        };
      }),
    );

    const uniqueFriendsData = Array.from(
      new Map(
        friendsData.map((friend) => [friend.room?.roomId, friend]),
      ).values(),
    );

    return uniqueFriendsData;
  }

  async removeFriend(userId: string, friendId: string): Promise<void> {
    // Tìm người dùng và bạn bè
    const [user, friend] = await Promise.all([
      this.userRepository.findOne({ where: { id: userId } }),
      this.userRepository.findOne({ where: { id: friendId } }),
    ]);

    if (!user || !friend) {
      throw new NotFoundException('User or friend not found');
    }

    // Kiểm tra xem có mối quan hệ bạn bè không
    const friendship = await this.friendRepository.findOne({
      where: [
        { user1: { id: userId }, user2: { id: friendId } },
        { user1: { id: friendId }, user2: { id: userId } },
      ],
      relations: ['user1', 'user2'],
    });

    if (!friendship) {
      throw new NotFoundException('Friendship does not exist');
    }

    // Xóa mối quan hệ bạn bè
    await this.friendRepository.delete(friendship.id);
  }

  async countFriends(userId: string): Promise<number> {
    // Đếm số lượng bạn bè trong mối quan hệ (user1, user2) của userId
    const totalFriends = await this.friendRepository.count({
      where: [{ user1: { id: userId } }, { user2: { id: userId } }],
    });

    return totalFriends;
  }
}
