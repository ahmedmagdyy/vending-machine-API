import { UserRoleEnum } from 'src/users/entities/user.entity';

export interface IUser {
  id: string;
  role: UserRoleEnum;
}
