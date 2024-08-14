import { FriendRequest } from 'src/friend-request/entities/friendRequest.entity';
import { Friend } from 'src/friend/entities/friend.entity';
import { Message } from 'src/message/entities/message.entity';
import { Room } from 'src/room/entities/room.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  OneToMany,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    enum: ['ADMIN', 'USER'],
  })
  @Column({ unique: true })
  username: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToMany(() => Room, (room) => room.users)
  rooms: Room[];

  @OneToMany(() => Message, (message) => message.sender)
  messages: Message[];

  @OneToMany(() => FriendRequest, (friendRequest) => friendRequest.sender)
  sentFriendRequests: FriendRequest[];

  @OneToMany(() => FriendRequest, (friendRequest) => friendRequest.receiver)
  receivedFriendRequests: FriendRequest[];

  @OneToMany(() => Friend, (friend) => friend.user1)
  friends: Friend[];
}
