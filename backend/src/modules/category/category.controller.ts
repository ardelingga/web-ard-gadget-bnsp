import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  HttpStatus,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ResponseApiStatus, ResponseDto } from 'src/common/utils/response.dto';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { SyncBulkCategoryDto } from 'src/modules/category/dto/sync-bulk-category.dto';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UseGuards(JwtGuard)
  async create(@Body() createCategoryDto: CreateCategoryDto, @Request() req) {
    try {
      const newCategory = await this.categoryService.create(
        createCategoryDto,
        req.user,
      );
      return new ResponseDto(
        ResponseApiStatus.SUCCESS,
        'Berhasil menambahkan category baru!',
        newCategory,
      );
    } catch (error) {
      throw new HttpException(
        new ResponseDto(ResponseApiStatus.FAILED, error.message, null),
        HttpStatus.BAD_REQUEST, // Set status code 400
      );
    }
  }

  @Post('/sync')
  @UseGuards(JwtGuard)
  async syncData(
    @Body() syncBulkCategoryDto: SyncBulkCategoryDto,
    @Request() req,
  ) {
    try {

      const newSyncDataCategory = await this.categoryService.syncData(
        syncBulkCategoryDto,
        req.user,
      );

      return new ResponseDto(
        ResponseApiStatus.SUCCESS,
        'Berhasil sinkronisasi data category!',
        newSyncDataCategory,
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
  async findAll(@Request() req) {
    try {
      const categories = await this.categoryService.findAll(req.user);
      return new ResponseDto(
        ResponseApiStatus.SUCCESS,
        'Berhasil mendapatkan semua categories!',
        categories,
      );
    } catch (error) {
      throw new HttpException(
        new ResponseDto(ResponseApiStatus.FAILED, error.message, null),
        HttpStatus.BAD_REQUEST, // Set status code 400
      );
    }
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  async findOne(@Param('id') id: string, @Request() req) {
    try {
      // validate params id
      if (isNaN(+id)) {
        throw new Error('id must be a number');
      }

      const category = await this.categoryService.findOne(+id, req.user);

      return new ResponseDto(
        ResponseApiStatus.SUCCESS,
        'Berhasil mendapatkan detail category!',
        category,
      );
    } catch (error) {
      throw new HttpException(
        new ResponseDto(ResponseApiStatus.FAILED, error.message, null),
        HttpStatus.BAD_REQUEST, // Set status code 400
      );
    }
  }

  @Patch(':id')
  @UseGuards(JwtGuard)
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Request() req,
  ) {
    try {
      // validate params id
      if (isNaN(+id)) {
        throw new Error('id must be a number');
      }

      const updatedCategory = await this.categoryService.update(
        +id,
        updateCategoryDto,
        req.user,
      );

      return new ResponseDto(
        ResponseApiStatus.SUCCESS,
        'Berhasil update category!',
        updatedCategory,
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

      await this.categoryService.remove(+id, req.user);

      return new ResponseDto(
        ResponseApiStatus.SUCCESS,
        'Berhasil delete category!',
        null,
      );
    } catch (error) {
      throw new HttpException(
        new ResponseDto(ResponseApiStatus.FAILED, error.message, null),
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
