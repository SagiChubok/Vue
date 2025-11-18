import { Controller, NotFoundException, Param, Post, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './users.entity';
import { UserStatus } from './user-status.enum';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/login/:username')
  async login(@Param('username') username: string): Promise<User> {
    const user = await this.usersService.findByUsername(username);

    if (!user) {
      throw new NotFoundException(`The user - ${username} - not found`);
    }

    if (user.status === UserStatus.DELETED) {
      throw new UnauthorizedException('User account has been deleted');
    }

    if (user.status === UserStatus.DISABLED) {
      throw new UnauthorizedException('User account has been disabled');
    }

    if (user.status !== UserStatus.ENABLED) {
      throw new UnauthorizedException('User account is not active');
    }

    return user;
  }
}
