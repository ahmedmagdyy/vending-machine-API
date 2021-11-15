import { IsNumber, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @IsNumber()
  amountAvailable: number;

  @IsNumber()
  @Min(1)
  cost: number;

  @IsString()
  productName: string;
}
