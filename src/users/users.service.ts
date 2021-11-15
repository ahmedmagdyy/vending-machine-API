import * as jwt from 'jsonwebtoken';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';

import { LoginDTO } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { User, UserRoleEnum } from './entities/user.entity';
import { createAccessToken, createRefreshToken } from './helpers/createTokens';
import { hashPassword } from './helpers/getNewPasswordHash';
import { comparePassword } from './helpers/comparePassword';
import { IUser } from 'src/interface/user.interface';
import { UserDTO } from './dto/user.dto';
import { IAuth } from 'src/interface/auth.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async signup(signUpUserCred: SignupDto): Promise<IAuth | { error; status }> {
    const { password, role, username } = signUpUserCred;

    const userExists = await this.userRepository.find({
      username,
    });

    if (userExists && userExists.length) {
      return {
        error: 'username is already used!',
        status: HttpStatus.BAD_REQUEST,
      };
    }

    const hashedPassword = await hashPassword(password);

    try {
      console.log('test');
      const createdUser = await this.userRepository.create({
        username,
        password: hashedPassword,
        role:
          UserRoleEnum.BUYER === role
            ? UserRoleEnum.BUYER
            : UserRoleEnum.SELLER,
      });
      console.log(createdUser);
      const savedUser = await this.userRepository.save(createdUser);
      console.log({ savedUser });

      const tokenArg = {
        id: createdUser.id,
        role: createdUser.role,
      };
      const accessToken = createAccessToken(tokenArg);
      const refreshToken = createRefreshToken(tokenArg);

      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      return {
        error: 'Signup failed!',
        status: HttpStatus.BAD_REQUEST,
      };
    }
  }
}
