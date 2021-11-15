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
  async login(loginUserCred: LoginDTO): Promise<IAuth | { error; status }> {
    const { username, password } = loginUserCred;

    const users = await this.userRepository.find({
      username,
    });
    console.log({ users });

    if (!users.length) {
      return {
        error: 'user not found!',
        status: HttpStatus.NOT_FOUND,
      };
    }

    const user = users[0];
    const match = await comparePassword(password, user.password);
    if (!match) {
      return {
        error: 'Invalid credentials!',
        status: HttpStatus.NOT_FOUND,
      };
    }

    const tokenArg = {
      id: user.id,
      role: user.role,
    };

    const accessToken = createAccessToken(tokenArg);
    const refreshToken = createRefreshToken(tokenArg);

    return {
      accessToken,
      refreshToken,
    };
  }

  async rf(token: string): Promise<IAuth | { error; status }> {
    if (!token) {
      return null;
    }

    let payload = null;
    try {
      payload = jwt.verify(token, process.env.REFRESH_TOKEN_JWT_SECRET);
    } catch (err) {
      console.log(err);
      return {
        error: 'Invalid Token!',
        status: HttpStatus.BAD_REQUEST,
      };
    }

    let user = null;
    try {
      user = await this.userRepository.findOne(payload.userId);
    } catch (ex) {
      return {
        error: 'Failed Getting User Data!',
        status: HttpStatus.BAD_REQUEST,
      };
    }

    if (!user) {
      return {
        error: 'User Not Found!',
        status: HttpStatus.NOT_FOUND,
      };
    }

    const tokenArg = {
      id: user.id,
      role: user.role,
    };

    const accessToken = createAccessToken(tokenArg);
    const refreshToken = createRefreshToken(tokenArg);

    return {
      accessToken,
      refreshToken,
    };
  }

  findAll(): Promise<UserDTO[]> {
    return this.userRepository.find();
  }

  findOne(id: string): Promise<UserDTO> {
    return this.userRepository.findOne(id);
  }

  async remove(id: string, user: IUser): Promise<void> {
    try {
      await this.userRepository.findOne(id);
      if (id !== user.id) {
        throw new Error('You are not authorized to delete this user!');
      }
      await this.userRepository.delete(id);
    } catch (error) {
      console.log(error);
    }
  }

  async update(id: string, username: string, user: IUser): Promise<UserDTO> {
    try {
      const checkUsernameAvailability = await this.userRepository.find({
        where: {
          username,
          id: Not(id),
        },
      });

      if (checkUsernameAvailability.length) {
        throw new Error('Username is already taken!');
      }

      if (id !== user.id) {
        throw new Error('You are not authorized to update this user!');
      }

      await this.userRepository.update(id, {
        username,
      });

      return this.userRepository.findOne(id);
    } catch (error) {
      console.log(error);
    }
    return this.userRepository.save({ id, ...user });
  }
}
