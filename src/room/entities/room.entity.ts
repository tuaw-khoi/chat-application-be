import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Message } from 'src/message/entities/message.entity';
import { RoomUser } from './roomUser.entity';
@Entity()
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ default: false })
  isPublic: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  img: string | null;

  @OneToMany(() => RoomUser, (roomUser) => roomUser.room)
  roomUsers: RoomUser[];

  @OneToMany(() => Message, (message) => message.room)
  messages: Message[];
}
