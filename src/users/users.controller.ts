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
import { BuyerGuard } from 'src/guards/buyer.guard';
import { IResultAuth, IResultUser } from 'src/interface/result.interface';

@Controller('/')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post('/signup')
  async signUp(
    @Body() signUpUserCred: SignupDto,
    @Res() res: Response,
  ): Promise<Response<any, Record<string, any>> | IAuth> {
    const result: IResultAuth = await this.userService.signup(signUpUserCred);
    if (result?.error) {
      return res.status(result?.status).json({ error: result?.error });
    }
    return res.status(result?.status).json(result?.data);
  }

  @Post('/login')
  async login(
    @Body() loginUserCred: LoginDTO,
    @Res() res: Response,
  ): Promise<Response<any, Record<string, any>> | IAuth> {
    const result: IResultAuth = await this.userService.login(loginUserCred);
    if (result?.error) {
      return res.status(result?.status).json({ error: result?.error });
    }
    return res.status(result?.status).json(result?.data);
  }

  @Post('/rf')
  async rf(
    @Body() body: { token: string },
    @Res() res: Response,
  ): Promise<Response<any, Record<string, any>> | IAuth> {
    const result: IResultAuth = await this.userService.rf(body.token);
    if (result?.error) {
      return res.status(result?.status).json({ error: result?.error });
    }
    return res.status(result?.status).json(result?.data);
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
    @Res() res: Response,
  ): Promise<Response<any, Record<string, any>>> {
    const updatedUser: IResultUser = await this.userService.update(
      id,
      username,
      user,
    );
    if (!updatedUser?.error) {
      return res
        .status(updatedUser?.status)
        .json({ error: updatedUser?.error });
    }
    return res.status(updatedUser?.status).json(updatedUser);
  }

  @UseGuards(BuyerGuard)
  @Post('/deposit')
  async deposit(
    @Body('amount') amount: number,
    @CurrentUser() user: IUser,
    @Res() res: Response,
  ): Promise<Response<any, Record<string, any>>> {
    const userData: IResultUser = await this.userService.deposit(amount, user);
    if (userData?.error) {
      return res.status(userData?.status).json({ error: userData?.error });
    }
    return res.status(userData?.status).json(userData);
  }

  @UseGuards(BuyerGuard)
  @Post('/reset')
  async reset(
    @CurrentUser() user: IUser,
    @Res() res: Response,
  ): Promise<Response<any, Record<string, any>>> {
    const userData: IResultUser = await this.userService.reset(user);
    if (userData?.error) {
      return res.status(userData?.status).json({ error: userData?.error });
    }
    return res.status(userData?.status).json(userData);
  }
}
