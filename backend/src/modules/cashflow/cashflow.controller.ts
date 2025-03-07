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
  Res,
  Request,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CashflowService } from './cashflow.service';
import { CreateCashflowDto } from './dto/create-cashflow.dto';
import { UpdateCashflowDto } from './dto/update-cashflow.dto';
import { ResponseApiStatus, ResponseDto } from 'src/common/utils/response.dto';
import { Response } from 'express';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { GetCashflowsDto } from 'src/modules/cashflow/dto/get-cashflow.dto';
import { RedisService } from 'src/services/redis/redis.service';

@Controller('cashflow')
export class CashflowController {
  constructor(
    private readonly cashflowService: CashflowService,
    private readonly redisService: RedisService,
  ) {}

  @Post()
  @UseGuards(JwtGuard)
  async create(@Body() createCashflowDto: CreateCashflowDto, @Request() req) {
    try {
      const newCashflow = await this.cashflowService.create(
        createCashflowDto,
        req.user,
      );

      // Delete all cache about transactions
      await this.redisService.deleteByPattern(`cashflows:${req.user.id}:*`);

      return new ResponseDto(
        ResponseApiStatus.SUCCESS,
        'Berhasil create transaksi!',
        newCashflow,
      );
    } catch (e) {
      throw new HttpException(
        new ResponseDto(ResponseApiStatus.FAILED, e.message, null),
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  @UseGuards(JwtGuard)
  async findAll(
    @Query() query: GetCashflowsDto,
    @Res() res: Response,
    @Request() req,
  ) {
    try {
      const keyCache = `cashflows:${req.user.id}:${query.search}:${query.sortBy}:${query.sortOrder}:${query.dateFrom}:${query.dateTo}:${query.month}:${query.type}:${query.limit}:${query.page}`;
      // Check cache
      const cachedCashflows = await this.redisService.get(keyCache);
      if (cachedCashflows) {
        res.setHeader('X-Cache', 'HIT');
        const response = new ResponseDto(
          ResponseApiStatus.SUCCESS,
          'Berhasil mendapatkan daftar cashflows!',
          JSON.parse(cachedCashflows),
        );
        return res.status(HttpStatus.OK).json(response);
      }

      const cashflows = await this.cashflowService.findAll(query, req.user);

      // Store response in Redis cache
      await this.redisService.set(keyCache, JSON.stringify(cashflows));

      res.setHeader('X-Cache', 'MISS');
      const response = new ResponseDto(
        ResponseApiStatus.SUCCESS,
        'Berhasil mendapatkan list transaction!',
        cashflows,
      );
      return res.status(HttpStatus.OK).json(response);
    } catch (e) {
      const response = new ResponseDto(
        ResponseApiStatus.FAILED,
        e.message,
        null,
      );
      return res.status(HttpStatus.BAD_REQUEST).json(response);
    }
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  async findOne(@Param('id') id: string, @Res() res: Response, @Request() req) {
    try {
      // validate params id
      if (isNaN(+id)) {
        throw new Error('id must be a number');
      }

      const keyCache = `cashflows:${req.user.id}:detail:${id}`;
      // Check cache
      const cachedCashflow = await this.redisService.get(keyCache);
      if (cachedCashflow) {
        res.setHeader('X-Cache', 'HIT');
        const response = new ResponseDto(
          ResponseApiStatus.SUCCESS,
          'Berhasil mendapatkan detail cashflow!',
          JSON.parse(cachedCashflow),
        );
        return res.status(HttpStatus.OK).json(response);
      }

      const cashflow = await this.cashflowService.findOne(+id, req.user);

      // Set cache
      await this.redisService.set(keyCache, JSON.stringify(cashflow));

      res.setHeader('X-Cache', 'MISS');
      const response = new ResponseDto(
        ResponseApiStatus.SUCCESS,
        'Berhasil mendapatkan list cashflows!',
        cashflow,
      );
      return res.status(HttpStatus.OK).json(response);
    } catch (e) {
      const response = new ResponseDto(
        ResponseApiStatus.FAILED,
        e.message,
        null,
      );
      return res.status(HttpStatus.BAD_REQUEST).json(response);
    }
  }

  @Patch(':id')
  @UseGuards(JwtGuard)
  async update(
    @Param('id') id: string,
    @Body() updateCashflowDto: UpdateCashflowDto,
    @Request() req,
  ) {
    try {
      // validate params id
      if (isNaN(+id)) {
        throw new Error('id must be a number');
      }

      const cashflow = await this.cashflowService.update(
        +id,
        updateCashflowDto,
        req.user,
      );

      // Delete all cache about transactions
      await this.redisService.deleteByPattern(`cashflows:${req.user.id}:*`);

      return new ResponseDto(
        ResponseApiStatus.SUCCESS,
        'Berhasil update transaksi!',
        cashflow,
      );
    } catch (e) {
      throw new HttpException(
        new ResponseDto(ResponseApiStatus.FAILED, e.message, null),
        HttpStatus.BAD_REQUEST,
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
      await this.cashflowService.remove(+id, req.user);

      // Delete all cache about transactions
      await this.redisService.deleteByPattern(`cashflows:${req.user.id}:*`);

      return new ResponseDto(
        ResponseApiStatus.SUCCESS,
        'Berhasil delete transaksi!',
        null,
      );
    } catch (e) {
      throw new HttpException(
        new ResponseDto(ResponseApiStatus.FAILED, e.message, null),
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
