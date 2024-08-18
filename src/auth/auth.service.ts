import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dtos/login.dto';
import { JwtPayload } from 'jsonwebtoken';
import { FirebaseService } from 'src/config/firebase/firebase.service';
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly firebaseService: FirebaseService,
  ) {}

  async login(loginDto: LoginDto) {
    const { emailorusername, password } = loginDto;

    let user;
    if (emailorusername?.includes('@')) {
      user = await this.userService.findByEmail(emailorusername);
    } else {
      user = await this.userService.findByUsername(emailorusername);
    }

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const test = this.generateTokens(user);

    return test;
  }

  async firebaseLogin(token: string) {
    try {
      const decodedToken = await this.firebaseService.verifyIdToken(token);
      const { email, name, picture } = decodedToken;

      let user = await this.userService.findByEmail(email);
      if (!user) {
        // If the user does not exist, create a new user
        const createUserDto = {
          fullname: name || email.split('@')[0],
          email,
          role: 'user',
          img: picture,
        };
        user = await this.userService.createWithGoogle(createUserDto);
      }

      return this.generateTokens(user);
    } catch (error) {
      console.error('Error in firebaseLogin:', error); // Ghi log lỗi chi tiết
      throw new UnauthorizedException('Invalid Firebase token');
    }
  }

  private generateTokens(user: any) {
    const payload = {
      username: user.username,
      sub: user.id,
      role: user?.role,
      img: user.img,
      fullname: user.fullname,
    };

    const userReturn = {
      role: user.role,
      img: user.img,
      fullname: user.fullname,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: 'secret',
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: 'secret',
      expiresIn: '7d',
    });

    return {
      userReturn,
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: 'secret',
      }) as JwtPayload;

      const user = await this.userService.findOne(payload.sub);
      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
