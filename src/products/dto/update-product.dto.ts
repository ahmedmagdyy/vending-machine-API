import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateProductDto {
  @IsNumber()
  @IsOptional()
  amountAvailable: number;
  @IsNumber()
  @IsOptional()
  cost: number;
  @IsString()
  @IsOptional()
  productName: string;
}
