import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { Room } from './room.entity';
import { User } from 'src/user/entities/user.entity';

@Entity()
export class RoomUser {
  @PrimaryGeneratedColumn()
  id: number; 

  @ManyToOne(() => Room, (room) => room.roomUsers)
  @JoinColumn({ name: 'roomId' })
  room: Room;

  @ManyToOne(() => User, (user) => user.roomUsers)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ default: false })
  isAdmin: boolean; 
}
