import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { FriendRequest } from './entities/friendRequest.entity';
import { Friend } from 'src/friend/entities/friend.entity';

@Injectable()
export class FriendRequestService {
  constructor(
    @InjectRepository(FriendRequest)
    private friendRequestRepository: Repository<FriendRequest>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Friend)
    private friendRepository: Repository<Friend>,
  ) {}

  async sendFriendRequest(senderId: string, receiverId: string) {
    const sender = await this.userRepository.findOne({
      where: { id: senderId },
    });
    const receiver = await this.userRepository.findOne({
      where: { id: receiverId },
    });

    if (!sender || !receiver) {
      throw new NotFoundException('User not found');
    }

    const existingRequest = await this.friendRequestRepository.findOne({
      where: {
        sender: { id: senderId },
        receiver: { id: receiverId },
        status: 'pending',
      },
    });

    if (existingRequest) {
      throw new BadRequestException('Friend request already sent');
    }

    const friendRequest = this.friendRequestRepository.create({
      sender,
      receiver,
      status: 'pending',
    });

    return this.friendRequestRepository.save(friendRequest);
  }

  async respondToFriendRequest(
    requestId: number,
    status: 'accepted' | 'rejected',
  ) {
    console.log(requestId);
    const friendRequest = await this.friendRequestRepository.findOne({
      where: { id: requestId },
      relations: ['sender', 'receiver'],
    });

    if (!friendRequest) {
      throw new NotFoundException('Friend request not found');
    }

    if (friendRequest.status !== 'pending') {
      throw new BadRequestException(
        'Friend request has already been responded to',
      );
    }

    friendRequest.status = status;
    await this.friendRequestRepository.save(friendRequest);

    if (status === 'accepted') {
      const { sender, receiver } = friendRequest;
      await this.createFriendship(sender, receiver);
    }

    return friendRequest;
  }

  async createFriendship(user1: User, user2: User) {
    const friendship = this.friendRepository.create({
      user1,
      user2,
    });

    return this.friendRepository.save(friendship);
  }
}
