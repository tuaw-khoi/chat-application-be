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
      // Tìm user theo email kèm password để kiểm tra
      user = await this.userService.findByEmailWithPassword(emailorusername);
    } else {
      // Tìm user theo username kèm password để kiểm tra
      user = await this.userService.findByUsernameWithPassword(emailorusername);
    }

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Loại bỏ password trước khi trả về user
    const { password: _password, ...userWithoutPassword } = user;

    return this.generateTokens(userWithoutPassword);
  }

  async firebaseLogin(token: string) {
    try {
      const decodedToken = await this.firebaseService.verifyIdToken(token);
      const { email, name, picture } = decodedToken;

      let user = await this.userService.findByEmail(email);
      if (!user) {
        // Nếu người dùng không tồn tại, tạo mới
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
      role: user.role,
      img: user.img,
      fullname: user.fullname,
    };

    const userReturn = {
      id: user.id,
      role: user.Role,
      img: user.img,
      fullname: user.fullname,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: 'secret',
      expiresIn: '1d',
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
