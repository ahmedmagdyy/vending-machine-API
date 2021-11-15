import { IsEnum, IsString } from 'class-validator';
import { UserRoleEnum } from '../entities/user.entity';

export class SignupDto {
  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsEnum(UserRoleEnum)
  role: UserRoleEnum;
}
