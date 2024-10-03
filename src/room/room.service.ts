import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './entities/room.entity';
import { User } from 'src/user/entities/user.entity';
import { CreateRoomDto } from './dtos/create-room.dto';
import { Message } from 'src/message/entities/message.entity';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Message)
    private MessageRepository: Repository<Message>,
  ) {}

  async createRoom(createRoomDto: CreateRoomDto): Promise<Room> {
    const admins = await this.userRepository.findByIds(createRoomDto.admins);
    console.log(admins);
    if (admins.length !== createRoomDto.admins.length) {
      throw new NotFoundException('One or more admins not found');
    }

    const room = this.roomRepository.create({
      ...createRoomDto,
      admins,
    });

    return this.roomRepository.save(room);
  }

  async addUserToRoom(userId: string, roomId: number): Promise<void> {
    const room = await this.roomRepository.findOne({
      where: { id: roomId },
      relations: ['users'],
    });

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!room) {
      throw new NotFoundException('Room not found');
    }
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!room.users) {
      room.users = [];
    }

    room.users.push(user);

    const updatedRoom = await this.roomRepository.save(room);
    // throw `User ${userId} added to room ${roomId}`;
  }

  async removeUserFromRoom(roomId: number, userId: string): Promise<void> {
    const room = await this.roomRepository.findOne({
      where: { id: roomId },
      relations: ['users'],
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    room.users = room.users.filter((user) => user.id !== userId);
    await this.roomRepository.save(room);
  }

  async findAllRooms(): Promise<Room[]> {
    return this.roomRepository.find({ relations: ['users', 'admins'] });
  }

  async findOneRoom(id: number): Promise<Room> {
    try {
      return await this.roomRepository.findOneOrFail({
        where: { id },
        relations: ['users', 'admins'],
      });
    } catch (error) {
      throw new NotFoundException('Room not found');
    }
  }

  async getUserRooms(userId: string): Promise<Room[]> {
    return this.roomRepository.find({
      where: { users: { id: userId } },
      relations: ['users', 'messages'],
    });
  }

  async getRoomMessages(roomId: number): Promise<Message[]> {
    return this.MessageRepository.find({
      where: { room: { id: roomId } },
      relations: ['sender'],
      order: { sent_at: 'ASC' },
    });
  }

  async getRoomBetweenUsers(userId1: string, userId2: string) {
    if (!userId1 || !userId2) {
      throw new Error('User IDs must be provided');
    }

    const user1 = await this.userRepository.findOne({
      where: { id: userId1 },
      relations: ['rooms'],
    });

    const user2 = await this.userRepository.findOne({
      where: { id: userId2 },
      relations: ['rooms'],
    });
    if (!user1 || !user2) {
      throw new NotFoundException('One or both users not found');
    }

    const user1Rooms = user1.rooms;
    const user2Rooms = user2.rooms;

    const commonRoom = user1Rooms.find((room) =>
      user2Rooms.some((r) => r.id === room.id && !room.isPublic),
    );

    if (!commonRoom) {
      throw new NotFoundException(
        'No common private room found between these users',
      );
    }

    const latestMessage = this.MessageRepository.findOne({
      where: { room: { id: commonRoom.id } },
      order: { sent_at: 'DESC' },
    });

    if (!commonRoom) {
      throw new NotFoundException('No common room found between these users');
    }
    const room = { commonRoom, latestMessage };
    return room;
  }
}
