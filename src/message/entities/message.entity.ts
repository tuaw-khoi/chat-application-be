import { Room } from 'src/room/entities/room.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';


@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @CreateDateColumn()
  sent_at: Date;

  @ManyToOne(() => User, (user) => user.messages)
  sender: User;

  @ManyToOne(() => Room, (room) => room.messages, { nullable: true })
  room: Room;
}
