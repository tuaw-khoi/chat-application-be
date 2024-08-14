import { User } from 'src/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';


@Entity()
export class Friend {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.friends)
  user1: User;

  @ManyToOne(() => User, (user) => user.friends)
  user2: User;

  @CreateDateColumn()
  created_at: Date;
}
