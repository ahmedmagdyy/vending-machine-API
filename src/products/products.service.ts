import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { IResultBuy, IResultProduct } from 'src/interface/result.interface';
import { IUser } from 'src/interface/user.interface';
import { User } from 'src/users/entities/user.entity';
import { Connection, Repository } from 'typeorm';
import { BuyProductDto } from './dto/buy-product.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectConnection()
    private readonly connection: Connection,
  ) {}

  async findAll(page): Promise<Product[]> {
    return this.productsRepository.find({
      take: 10,
      skip: page,
    });
  }

  async findOne(id: string): Promise<IResultProduct> {
    try {
      const product = await this.productsRepository.findOne(id);
      if (!product) {
        return {
          status: HttpStatus.NOT_FOUND,
          error: 'Product not found',
        };
      }
      return {
        status: HttpStatus.OK,
        data: product,
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.BAD_REQUEST,
        error: error.message,
      };
    }
  }

  async create(productData: CreateProductDto, user: IUser): Promise<Product> {
    return this.productsRepository.save({ ...productData, sellerId: user.id });
  }

  async update(
    id: string,
    productUpdateData: UpdateProductDto,
    user: IUser,
  ): Promise<IResultProduct> {
    try {
      const product = await this.productsRepository.findOne(id);
      if (product.sellerId !== user.id) {
        throw new Error('You are not the owner of this product!');
      }
      const result = await this.productsRepository.save({
        id,
        ...productUpdateData,
      });
      return {
        status: HttpStatus.OK,
        data: result,
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.BAD_REQUEST,
        error: error.message,
      };
    }
  }

  async delete(id: string, user: IUser): Promise<void> {
    try {
      const product = await this.productsRepository.findOne(id);
      if (!product) {
        return;
      }
      if (product?.sellerId !== user.id) {
        throw new Error('You are not authorized to delete this product');
      }
      await this.productsRepository.delete(id);
    } catch (error) {
      console.log(error);
      return error.message;
    }
  }

  async buy(input: BuyProductDto, user: IUser): Promise<IResultBuy> {
    const { productId, quantity } = input;

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const product = await queryRunner.manager.findOne(Product, productId);
      const buyerUser = await queryRunner.manager.findOne(User, user.id);

      if (!buyerUser) {
        return {
          error: 'User not found',
          status: HttpStatus.NOT_FOUND,
        };
      }

      if (!product) {
        return {
          error: 'Product not found',
          status: HttpStatus.NOT_FOUND,
        };
      }

      if (buyerUser.deposit < product.cost * quantity) {
        throw new Error(
          'You do not have enough money to buy this product or this quantity',
        );
      }

      if (product.amountAvailable < quantity) {
        throw new Error('Not enough quantity!');
      }

      buyerUser.deposit -= product.cost * quantity;

      product.amountAvailable -= quantity;

      await queryRunner.manager.save(buyerUser);
      await queryRunner.manager.save(product);

      await queryRunner.commitTransaction();

      return {
        status: HttpStatus.OK,
        data: {
          totalSpent: product.cost * quantity,
          product,
          productsPurchased: quantity,
          change: this.depositChange(buyerUser.deposit),
        },
      };
    } catch (err) {
      console.log(err);
      await queryRunner.rollbackTransaction();
      return {
        status: HttpStatus.BAD_REQUEST,
        error: err.message,
      };
    } finally {
      await queryRunner.release();
    }
  }

  private depositChange(deposit: number) {
    let copyOfDeposit = deposit;
    const coins = [100, 50, 20, 10, 5];
    const coinsChange = [];
    for (let i = 0; i < coins.length; i++) {
      const coin = coins[i];
      const amount = Math.floor(copyOfDeposit / coin);
      coinsChange.push({
        coin,
        amount,
      });
      copyOfDeposit -= coin * amount;
    }
    if (copyOfDeposit > 0) {
      coinsChange.push({
        coin: 1,
        amount: copyOfDeposit,
      });
    }
    return coinsChange;
  }
}
