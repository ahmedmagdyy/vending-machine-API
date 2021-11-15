import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { UsersService } from './users.service';
import { Response } from 'express';
import { LoginDTO } from './dto/login.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { CurrentUser } from '../decorator/currentUser.decorator';
import { IUser } from 'src/interface/user.interface';
import { UserDTO } from './dto/user.dto';
import { IAuth } from 'src/interface/auth.interface';

@Controller('/')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post('/signup')
  async signUp(
    @Body() signUpUserCred: SignupDto,
    @Res() res: Response,
  ): Promise<Response<any, Record<string, any>> | IAuth> {
    const result = await this.userService.signup(signUpUserCred);
    if (result) {
      return res.status(200).json(result);
    }
    return res.status(400).json({ message: 'Signup failed' });
  }

  @Post('/login')
  async login(
    @Body() loginUserCred: LoginDTO,
    @Res() res: Response,
  ): Promise<Response<any, Record<string, any>> | IAuth> {
    console.log({ loginUserCred });
    const result = await this.userService.login(loginUserCred);
    if (result) {
      return res.status(200).json(result);
    }
    return res.status(400).json({ message: 'Invalid username or password!' });
  }

  @Post('/rf')
  async rf(
    @Body() body: { token: string },
    @Res() res: Response,
  ): Promise<Response<any, Record<string, any>> | IAuth> {
    const result = await this.userService.rf(body.token);
    if (result) {
      return res.status(200).json(result);
    }
    return res.status(400).json({ message: 'Invalid token' });
  }

  @UseGuards(AuthGuard)
  @Get('/users')
  async getUsers(): Promise<UserDTO[]> {
    return this.userService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get('/users/:id')
  async getUserById(@Param('id') id: string): Promise<UserDTO> {
    return this.userService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Delete('/users/:id')
  async deleteUser(
    @Param('id') id: string,
    @CurrentUser() user: IUser,
  ): Promise<void> {
    return this.userService.remove(id, user);
  }

  @UseGuards(AuthGuard)
  @Patch('/users/:id')
  async updateUserUsername(
    @Param('id') id: string,
    @CurrentUser() user: IUser,
    @Body('username') username: string,
  ): Promise<UserDTO> {
    return this.userService.update(id, username, user);
  }
}
