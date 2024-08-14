import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Column,
} from 'typeorm';


@Entity()
export class FriendRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.sentFriendRequests)
  sender: User;

  @ManyToOne(() => User, (user) => user.receivedFriendRequests)
  receiver: User;

  @Column({ default: false })
  accepted: boolean;

  @CreateDateColumn()
  sent_at: Date;
}
