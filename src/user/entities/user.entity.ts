import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { FriendRequest } from 'src/friend-request/entities/friendRequest.entity';
import { Friend } from 'src/friend/entities/friend.entity';
import { Message } from 'src/message/entities/message.entity';
import { RoomUser } from 'src/room/entities/roomUser.entity';
import { Post } from 'src/post/entities/post.entity';
import { Like } from 'src/likes/entities/likes.entity';
import { Comment } from 'src/comment/entities/comment.entity';
import { Notification } from 'src/notification/entities/notification.entity';

@Entity('Users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ nullable: true })
  fullname: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true, select: false })
  password: string;

  @Column({
    type: 'enum',
    enum: ['ADMIN', 'USER'],
    default: 'USER',
  })
  Role: string;

  @Column({ nullable: true })
  img: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => RoomUser, (roomUser) => roomUser.user, {
    cascade: true, // Xóa roomUsers khi user bị xóa
    onDelete: 'CASCADE',
  })
  roomUsers: RoomUser[];

  @OneToMany(() => Message, (message) => message.sender, {
    cascade: true, // Xóa roomUsers khi user bị xóa
    onDelete: 'CASCADE',
  })
  messages: Message[];

  @OneToMany(() => FriendRequest, (friendRequest) => friendRequest.sender, {
    cascade: true, // Xóa roomUsers khi user bị xóa
    onDelete: 'CASCADE',
  })
  sentFriendRequests: FriendRequest[];

  @OneToMany(() => FriendRequest, (friendRequest) => friendRequest.receiver, {
    cascade: true, // Xóa roomUsers khi user bị xóa
    onDelete: 'CASCADE',
  })
  receivedFriendRequests: FriendRequest[];

  @OneToMany(() => Friend, (friend) => friend.user1, {
    cascade: true, // Xóa roomUsers khi user bị xóa
    onDelete: 'CASCADE',
  })
  friends: Friend[];

  @OneToMany(() => Post, (post) => post.author, {
    cascade: true, // Xóa roomUsers khi user bị xóa
    onDelete: 'CASCADE',
  })
  posts: Post[];

  @OneToMany(() => Comment, (comment) => comment.author, {
    cascade: true, // Xóa roomUsers khi user bị xóa
    onDelete: 'CASCADE',
  })
  comments: Comment[];

  @OneToMany(() => Like, (like) => like.user, {
    cascade: true, // Xóa roomUsers khi user bị xóa
    onDelete: 'CASCADE',
  })
  likes: Like[];

  @OneToMany(() => Notification, (notification) => notification.recipient, {
    cascade: true, // Xóa roomUsers khi user bị xóa
    onDelete: 'CASCADE',
  })
  notifications: Notification[];
}
