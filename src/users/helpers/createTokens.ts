import * as jwt from 'jsonwebtoken';
import { TokenDTO } from '../dto/token.dto';

export function createAccessToken(data: TokenDTO): string {
  const { id, role } = data;

  const tokenContents = {
    sub: id,
    role,
  };

  return jwt.sign(tokenContents, process.env.ACCESS_TOKEN_JWT_SECRET, {
    expiresIn: process.env.NODE_ENV === 'development' ? '30d' : '15m',
    noTimestamp: process.env.NODE_ENV === 'development',
  });
}

export function createRefreshToken(data: TokenDTO) {
  const { id, role } = data;

  const payload = {
    userId: id,
    role,
  };

  return jwt.sign(payload, process.env.REFRESH_TOKEN_JWT_SECRET, {
    expiresIn: '30d',
    noTimestamp: process.env.NODE_ENV === 'development',
  });
}
