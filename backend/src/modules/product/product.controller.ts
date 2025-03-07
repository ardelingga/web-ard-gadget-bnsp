import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  Request,
  UseInterceptors,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ResponseApiStatus, ResponseDto } from 'src/common/utils/response.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { GetProductsDto } from './dto/get-product.dto';
import { RedisService } from 'src/services/redis/redis.service';

export const runtime = 'edge';

@Controller('products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly redisService: RedisService,
  ) {}

  @Post()
  @UseGuards(JwtGuard)
  @UseInterceptors(
    FileInterceptor('image_file', {
      storage: multer.memoryStorage(),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return callback(new Error('Only image files are allowed!'), false);
        }
        callback(null, true);
      },
    }),
  )
  async create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() image_file: Express.Multer.File,
    @Request() req,
  ) {
    try {
      if (!image_file) {
        throw new Error('No file uploaded');
      }

      createProductDto.image_file = image_file;

      const newProduct = await this.productService.create(
        createProductDto,
        req.user,
      );

      // Delete all cache about products
      await this.redisService.deleteByPattern(`products:${req.user.id}:*`);

      return new ResponseDto(
        ResponseApiStatus.SUCCESS,
        'Berhasil menambahkan product baru!',
        newProduct,
      );
    } catch (error) {
      throw new HttpException(
        new ResponseDto(ResponseApiStatus.FAILED, error.message, null),
        HttpStatus.BAD_REQUEST, // Set status code 400
      );
    }
  }

  @Get()
  @UseGuards(JwtGuard)
  async findAll(
    @Query() query: GetProductsDto,
    @Res() res: Response,
    @Request() req,
  ) {
    try {
      // Check cache
      const keyCache = `products:${req.user.id}:${query.search}:${query.sortBy}:${query.sortOrder}:${query.category_id}:${query.limit}:${query.page}`;
      const cachedProducts = await this.redisService.get(keyCache);
      if (cachedProducts) {
        res.setHeader('X-Cache', 'HIT');
        const response = new ResponseDto(
          ResponseApiStatus.SUCCESS,
          'Berhasil mendapatkan semua products!',
          JSON.parse(cachedProducts),
        );
        return res.status(HttpStatus.OK).json(response);
      }

      // Get data from database
      const products = await this.productService.findAll(query, req.user);

      // Set cache
      await this.redisService.set(keyCache, JSON.stringify(products));

      res.setHeader('X-Cache', 'MISS');
      const response = new ResponseDto(
        ResponseApiStatus.SUCCESS,
        'Berhasil mendapatkan semua produk!',
        products,
      );
      return res.status(HttpStatus.OK).json(response);
    } catch (error) {
      const response = new ResponseDto(
        ResponseApiStatus.FAILED,
        error.message,
        null,
      );
      return res.status(HttpStatus.BAD_REQUEST).json(response);
    }
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Res() res: Response, @Request() req) {
    try {
      // validate params id
      if (isNaN(+id)) {
        throw new Error('id must be a number');
      }

      // Check cache
      const keyCache = `products:${req.user.id}:detail:${id}`;
      const cachedProduct = await this.redisService.get(keyCache);
      if (cachedProduct) {
        res.setHeader('X-Cache', 'HIT');
        const response = new ResponseDto(
          ResponseApiStatus.SUCCESS,
          'Berhasil mendapatkan detail product!',
          JSON.parse(cachedProduct),
        );
        return res.status(HttpStatus.OK).json(response);
      }

      const product = await this.productService.findOne(+id, req.user);

      // Set cache
      await this.redisService.set(keyCache, JSON.stringify(product));

      res.setHeader('X-Cache', 'MISS');
      const response = new ResponseDto(
        ResponseApiStatus.SUCCESS,
        'Berhasil mendapatkan detail product!',
        product,
      );
      return res.status(HttpStatus.OK).json(response);
    } catch (error) {
      const response = new ResponseDto(
        ResponseApiStatus.FAILED,
        error.message,
        null,
      );
      return res.status(HttpStatus.BAD_REQUEST).json(response);
    }
  }

  @UseGuards(JwtGuard)
  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('image_file', {
      storage: multer.memoryStorage(),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return callback(new Error('Only image files are allowed!'), false);
        }
        callback(null, true);
      },
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile() image_file: Express.Multer.File,
    @Request() req,
  ) {
    try {
      // validate params id
      if (isNaN(+id)) {
        throw new Error('id must be a number');
      }

      // Check if file is null
      if (!image_file) {
        updateProductDto.image_file = null;
      } else {
        updateProductDto.image_file = image_file;
      }

      const productUpdated = await this.productService.update(
        +id,
        updateProductDto,
        req.user,
      );

      // Delete all cache about products
      await this.redisService.deleteByPattern(`products:${req.user.id}:*`);

      return new ResponseDto(
        ResponseApiStatus.SUCCESS,
        'Product updated successfully',
        productUpdated,
      );
    } catch (error) {
      throw new HttpException(
        new ResponseDto(ResponseApiStatus.FAILED, error.message, null),
        HttpStatus.BAD_REQUEST, // Set status code 400
      );
    }
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  async remove(@Param('id') id: string, @Request() req) {
    try {
      // validate params id
      if (isNaN(+id)) {
        throw new Error('id must be a number');
      }

      await this.productService.remove(+id, req.user);

      // Delete all cache about products
      await this.redisService.deleteByPattern(`products:${req.user.id}:*`);

      return new ResponseDto(
        ResponseApiStatus.SUCCESS,
        'Product deleted successfully',
        null,
      );
    } catch (error) {
      throw new HttpException(
        new ResponseDto(ResponseApiStatus.FAILED, error.message, null),
        HttpStatus.BAD_REQUEST, // Set status code 400
      );
    }
  }
}
