import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  NotFoundException,
  Put,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { ChangePasswordDto } from './dtos/changepassword.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Post('info')
  async getUserWithoutPassword(@Body() body: { usernameOremail: string }) {
    const { usernameOremail } = body;
    if (!usernameOremail || usernameOremail.trim() === '') {
      throw new NotFoundException('Query parameter is missing or invalid');
    }
    console.log(usernameOremail);
    return this.userService.getUserWithoutPassword(usernameOremail);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  @Post('searchNewFriend')
  async searchUser(@Body() query: { query: string; userId: string }) {
    if (!query) {
      throw new NotFoundException('Query parameter is missing');
    }

    const result = await this.userService.searchUser(query.query, query.userId);

    return result;
  }

  @Put(':id/profile')
  async updateProfile(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.userService.updateProfile(id, updateUserDto);
  }

  @Put(':id/user')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.userService.updateUser(id, updateUserDto);
  }

  @Put(':id/change-password')
  async changePassword(
    @Param('id') id: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return await this.userService.changePassword(
      id,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    );
  }

  @Get(':id/info')
  async getUserInfo(@Param('id') id: string) {
    return await this.userService.getUserInfo(id);
  }

  @Get()
  async getManagerInfo() {
    return await this.userService.getStatistics();
  }
}
