import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const token = request.headers.authorization.split(' ')[1];

    let user = null;
    try {
      user = jwt.verify(token, process.env.ACCESS_TOKEN_JWT_SECRET);
    } catch (err) {
      console.log(err);
    }

    return {
      id: user.sub,
      role: user.role,
    };
  },
);
