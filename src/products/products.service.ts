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
}
