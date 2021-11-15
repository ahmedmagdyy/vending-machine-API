import { IsEnum, IsString } from 'class-validator';
import { UserRoleEnum } from '../entities/user.entity';

export class TokenDTO {
  @IsString()
  id: string;

  @IsEnum(UserRoleEnum)
  role: UserRoleEnum;
}
