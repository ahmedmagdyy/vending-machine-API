import { UserDTO } from 'src/users/dto/user.dto';
import { IAuth } from './auth.interface';

export interface IResultAuth extends IResult {
  data?: IAuth;
}

export interface IResultUser extends IResult {
  data?: UserDTO;
}

interface IResult {
  status: number;
  error?: string;
}
