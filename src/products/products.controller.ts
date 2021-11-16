import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { CurrentUser } from 'src/decorator/currentUser.decorator';
import { BuyerGuard } from 'src/guards/buyer.guard';
import { SellerGuard } from 'src/guards/seller.guard';
import { IResultBuy } from 'src/interface/result.interface';
import { IUser } from 'src/interface/user.interface';
import { BuyProductDto } from './dto/buy-product.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { ProductsService } from './products.service';

@Controller('/')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('/products')
  async getProducts(@Query('page') page: number): Promise<Product[]> {
    const skipPage = page > 0 ? (page - 1) * 10 : 0;
    return this.productsService.findAll(skipPage);
  }

  @Get('/products/:id')
  async getProductById(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<Response<any, Record<string, any>>> {
    const result = await this.productsService.findOne(id);
    if (Object.keys(result).length > 1) {
      return res.status(HttpStatus.OK).json(result);
    }
    return res.status(HttpStatus.NOT_FOUND).json(result);
  }

  @UseGuards(SellerGuard)
  @Post('/products')
  async createProduct(
    @Body() createProductData: CreateProductDto,
    @CurrentUser() user: IUser,
  ): Promise<Product> {
    return this.productsService.create(createProductData, user);
  }

  @UseGuards(SellerGuard)
  @Delete('/products/:id')
  async deleteProduct(
    @Param('id') id: string,
    @CurrentUser() user: IUser,
  ): Promise<void> {
    return this.productsService.delete(id, user);
  }

  @UseGuards(SellerGuard)
  @Patch('/products/:id')
  async updateProduct(
    @Param('id') id: string,
    @CurrentUser() user: IUser,
    @Body() updateProductData: UpdateProductDto,
    @Res() res: Response,
  ): Promise<Response<any, Record<string, any>>> {
    const updatedProduct = await this.productsService.update(
      id,
      updateProductData,
      user,
    );
    if (updatedProduct?.error) {
      return res
        .status(updatedProduct?.status)
        .json({ error: updatedProduct?.error });
    }
    return res.status(updatedProduct?.status).json(updatedProduct?.data);
  }

  @UseGuards(BuyerGuard)
  @Post('/buy')
  async buyProduct(
    @Body() buyProductInput: BuyProductDto,
    @CurrentUser() user: IUser,
    @Res() res: Response,
  ): Promise<Response<any, Record<string, any>>> {
    const buyResult: IResultBuy = await this.productsService.buy(
      buyProductInput,
      user,
    );
    if (buyResult?.error) {
      return res.status(buyResult?.status).json({ error: buyResult?.error });
    }
    return res.status(buyResult?.status).json(buyResult?.data);
  }
}
