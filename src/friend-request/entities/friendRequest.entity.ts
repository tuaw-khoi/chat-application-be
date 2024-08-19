import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Column,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';

@Entity()
export class FriendRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.sentFriendRequests)
  sender: User;

  @ManyToOne(() => User, (user) => user.receivedFriendRequests)
  receiver: User;

  @Column({ default: 'pending' })
  status: 'pending' | 'accepted' | 'rejected';

  @CreateDateColumn()
  created_at: Date;
}
