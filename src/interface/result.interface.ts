import { Product } from 'src/products/entities/product.entity';
import { UserDTO } from 'src/users/dto/user.dto';
import { IAuth } from './auth.interface';

export interface IResultAuth extends IResult {
  data?: IAuth;
}

export interface IResultUser extends IResult {
  data?: UserDTO;
}
export interface IResultProduct extends IResult {
  data?: Product;
}
export interface IResultBuy extends IResult {
  data?: IBuyProduct;
}

interface IBuyProduct {
  totalSpent: number;
  product: Product;
  productsPurchased: number;
  change: ICoinsChange[];
}

interface ICoinsChange {
  coins: number;
  change: number;
}

interface IResult {
  status: number;
  error?: string;
}
