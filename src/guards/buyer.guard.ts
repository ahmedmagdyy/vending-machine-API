import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class BuyerGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = request?.headers?.authorization?.split(' ')[1];

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

    if (user.role !== 'buyer') {
      throw new UnauthorizedException('You are not a buyer!');
    }
    return true;
  }
}
