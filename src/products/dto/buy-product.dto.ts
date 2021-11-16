import { IsNumber, IsString, Min } from 'class-validator';

export class BuyProductDto {
  @IsString()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}
