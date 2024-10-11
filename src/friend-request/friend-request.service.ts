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
    if (senderId === receiverId) {
      throw new BadRequestException(
        'You cannot send a friend request to yourself',
      );
    }
    const sender = await this.userRepository.findOne({
      where: { id: senderId },
    });
    const receiver = await this.userRepository.findOne({
      where: { id: receiverId },
    });

    if (!sender || !receiver) {
      throw new NotFoundException('User not found');
    }

    // Kiểm tra xem đã là bạn bè chưa
    const isFriend = await this.friendRepository.findOne({
      where: [
        { user1: { id: senderId }, user2: { id: receiverId } },
        { user1: { id: receiverId }, user2: { id: senderId } },
      ],
    });

    if (isFriend) {
      throw new BadRequestException('You are already friends with this user');
    }

    // Kiểm tra xem đã gửi lời mời kết bạn chưa
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

    // Tạo lời mời kết bạn mới
    const friendRequest = this.friendRequestRepository.create({
      sender,
      receiver,
      status: 'pending',
    });

    this.friendRequestRepository.save(friendRequest);
    return 'Add friend success';
  }

  async respondToFriendRequest(
    requestId: number,
    status: 'accepted' | 'rejected',
  ) {
    const friendRequest = await this.friendRequestRepository.findOne({
      where: { id: requestId },
      relations: ['sender', 'receiver'],
    });

    if (!friendRequest) {
      throw new NotFoundException('Friend request not found');
    }

    // Nếu trạng thái đã được xử lý, ném ra lỗi
    if (friendRequest.status !== 'pending') {
      throw new BadRequestException(
        'Friend request has already been responded to',
      );
    }

    // Cập nhật trạng thái lời mời kết bạn
    friendRequest.status = status;

    // Nếu từ chối, xóa lời mời kết bạn
    if (status === 'rejected') {
      await this.friendRequestRepository.remove(friendRequest);
      return { message: 'Friend request rejected and removed' };
    }

    await this.friendRequestRepository.save(friendRequest);

    // Nếu chấp nhận, tạo tình bạn
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

  async getPendingFriendRequests(userId: string) {
    // Find the user by their ID
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Fetch only the friend requests where the current user is the receiver and the status is 'pending'
    const pendingRequests = await this.friendRequestRepository.find({
      where: {
        receiver: { id: userId },
        status: 'pending',
      },
      relations: ['receiver', 'sender'],
    });

    // Map the results to only include relevant fields
    const filteredRequests = pendingRequests.map((request) => ({
      id: request.id,
      status: request.status,
      created_at: request.created_at,
      sender: {
        id: request.sender.id,
        username: request.sender.username,
        fullname: request.sender.fullname,
        img: request.sender.img,
      },
    }));

    return filteredRequests;
  }

 
}
