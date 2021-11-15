import { UserRoleEnum } from '../entities/user.entity';

export class UserDTO {
  username: string;

  deposit: number;

  role: UserRoleEnum;
}
