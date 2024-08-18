import {
  Controller,
  Post,
  Body,
  Headers,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/user/dtos/create-user.dto';
import { UserService } from 'src/user/user.service';
import { LoginDto } from './dtos/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { RefreshTokenDto } from './dtos/refresh-token';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Post('refresh-login')
  async refreshLogin(@Headers('authorization') authorization: string) {
    const token = authorization?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException(' token not found');
    }
    return this.userService.refreshLogin(token);
  }

  @Post('firebase-login')
  async firebaseLogin(@Headers('authorization') authorization: string) {
    const token = authorization?.split(' ')[1];
    console.log(token);
    if (!token) {
      throw new UnauthorizedException('Firebase token not found');
    }
    const login = await this.authService.firebaseLogin(token);
    return login;
  }
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is missing');
    }

    return this.authService.refreshTokens(refreshToken);
  }
}
