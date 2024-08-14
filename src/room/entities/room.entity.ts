import { Message } from 'src/message/entities/message.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  OneToMany,
} from 'typeorm';



@Entity()
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: true })
  isPublic: boolean;

  @ManyToMany(() => User, (user) => user.rooms)
  users: User[];

  @OneToMany(() => Message, (message) => message.room)
  messages: Message[];
}
