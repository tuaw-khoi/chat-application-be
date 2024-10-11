import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { FriendRequest } from 'src/friend-request/entities/friendRequest.entity';
import { Friend } from 'src/friend/entities/friend.entity';
import { Message } from 'src/message/entities/message.entity';
import { Room } from 'src/room/entities/room.entity';
import { RoomUser } from 'src/room/entities/roomUser.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ nullable: true })
  fullname: string;
  @Column({ unique: true })
  email: string;

  @Column({ nullable: true }) // Để password có thể null trong trường hợp đăng nhập bằng Google
  password: string;

  @Column({
    type: 'enum',
    enum: ['ADMIN', 'USER'],
    default: 'USER',
  })
  Role: string;

  @Column({ nullable: true }) // Có thể null trong trường hợp không có ảnh đại diện từ Google
  img: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => RoomUser, (roomUser) => roomUser.user)
  roomUsers: RoomUser[]; 

  @OneToMany(() => Message, (message) => message.sender)
  messages: Message[];

  @OneToMany(() => FriendRequest, (friendRequest) => friendRequest.sender)
  sentFriendRequests: FriendRequest[];

  @OneToMany(() => FriendRequest, (friendRequest) => friendRequest.receiver)
  receivedFriendRequests: FriendRequest[];

  @OneToMany(() => Friend, (friend) => friend.user1)
  friends: Friend[];
}
