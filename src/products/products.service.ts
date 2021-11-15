import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IUser } from 'src/interface/user.interface';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async findAll(page): Promise<Product[]> {
    return this.productsRepository.find({
      take: 10,
      skip: page,
    });
  }

  async findOne(id: string): Promise<Product | { message }> {
    try {
      const product = await this.productsRepository.findOne(id);
      if (!product) {
        throw new Error('Product not found');
      }
      return product;
    } catch (error) {
      console.log(error);
      return { message: error.message };
    }
  }

  async create(productData: CreateProductDto, user: IUser): Promise<Product> {
    return this.productsRepository.save({ ...productData, sellerId: user.id });
  }

  async update(
    id: string,
    productUpdateData: UpdateProductDto,
    user: IUser,
  ): Promise<Product> {
    try {
      const product = await this.productsRepository.findOne(id);
      if (product.sellerId !== user.id) {
        throw new Error('You are not the owner of this product!');
      }
      return this.productsRepository.save({
        id,
        ...productUpdateData,
      });
    } catch (error) {
      console.log(error);
      return null;
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
    }
  }
}
