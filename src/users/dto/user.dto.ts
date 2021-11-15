import { UserRoleEnum } from '../entities/user.entity';

export class UserDTO {
  id: string;

  username: string;

  deposit: number;

  role: UserRoleEnum;

  createdAt: Date;

  updatedAt: Date;
}
