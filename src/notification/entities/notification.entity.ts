import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ default: false })
  isRead: boolean;

  @Column({ type: 'text' })
  type: string;

  @Column({ type: 'uuid', nullable: true })
  postId: string; 

  @ManyToOne(() => User, (user) => user.notifications, { onDelete: 'CASCADE' })
  recipient: User;

  @CreateDateColumn()
  createdAt: Date;
}
