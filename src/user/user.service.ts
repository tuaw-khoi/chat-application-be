import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserWithGoogleDto } from './dtos/user.dto';
import { hash } from 'bcrypt';
import * as jwt from 'jsonwebtoken';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}
  async refreshLogin(token: string): Promise<any> {
    try {
      const jwtObject: any = jwt.verify(token, 'secret');
      const username = jwtObject.username;
      const user = await this.usersRepository.findOne({ where: { username } });
      if (!user) {
        throw new NotFoundException('User not found.');
      }
      const userReturn = { fullname: user.fullname, role: user.Role };

      return { userReturn };
    } catch (error) {
      throw new UnauthorizedException('Invalid token.');
    }
  }
  async create(createUserDto: CreateUserDto): Promise<any> {
    // Validate input
    if (!createUserDto.email || !createUserDto.password) {
      throw new ConflictException('Email and password are required');
    }

    // Check if email or username already exists
    const existingUser =
      (await this.findByEmail(createUserDto.email)) ||
      (await this.findByUsername(createUserDto.username));
    if (existingUser) {
      throw new ConflictException('Email or username is already in use');
    }

    const hashedPassword = await hash(createUserDto.password, 10);

    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    try {
      await this.usersRepository.save(user);
      return { success: true, message: 'Register success' };
    } catch (error) {
      throw new ConflictException('Register failed');
    }
  }

  async createWithGoogle(
    createUserWithGoogleDto: UserWithGoogleDto,
  ): Promise<User> {
    // Validate input
    if (!createUserWithGoogleDto.email) {
      throw new ConflictException('Email is required');
    }

    // Check if email already exists
    const existingUser = await this.findByEmail(createUserWithGoogleDto.email);
    if (existingUser) {
      throw new ConflictException('Email is already in use');
    }

    // Create and save user
    const user = this.usersRepository.create(createUserWithGoogleDto);
    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.usersRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }
  }

  async findByUsername(username: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { username } });
  }
}
