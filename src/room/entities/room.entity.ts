import { Message } from 'src/message/entities/message.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  OneToMany,
  JoinTable,
} from 'typeorm';

@Entity()
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: true })
  isPublic: boolean;

  @Column({ nullable: true })
  img: string; 

  @ManyToMany(() => User, (user) => user.rooms)
  @JoinTable()
  users: User[];

  @ManyToMany(() => User, (user) => user.rooms)
  @JoinTable()
  admins: User[];

  @OneToMany(() => Message, (message) => message.room)
  messages: Message[];
}
