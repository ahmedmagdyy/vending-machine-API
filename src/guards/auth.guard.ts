import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly userService: UsersService) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('Authorization header missing');
    }

    let user = null;
    try {
      user = jwt.verify(token, process.env.ACCESS_TOKEN_JWT_SECRET);
    } catch (err) {
      console.log(err);
    }

    if (!user) {
      throw new UnauthorizedException('Invalid or expired token!');
    }
    const userExists = await this.userService.findOne(user.sub);

    if (!userExists) throw new UnauthorizedException('User not found');

    return true;
  }
}
