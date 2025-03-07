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
  Query,
  Res,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { ResponseApiStatus, ResponseDto } from 'src/common/utils/response.dto';
import { JwtGuard } from 'src/common/guards/jwt.guard';

import { Response } from 'express';
import { GetTransactionsDto } from 'src/modules/transactions/dto/get-transaction.dto';
import { RedisService } from 'src/services/redis/redis.service';

@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly redisService: RedisService,
  ) {}

  @Post()
  @UseGuards(JwtGuard)
  async create(
    @Body() createTransactionDto: CreateTransactionDto,
    @Request() req,
  ) {
    try {
      const newTransaction = await this.transactionsService.create(
        createTransactionDto,
        req.user,
      );

      // Delete all cache about transactions
      await this.redisService.deleteByPattern(`transactions:${req.user.id}:*`);

      return new ResponseDto(
        ResponseApiStatus.SUCCESS,
        'Berhasil menambahkan transaksi baru!',
        newTransaction,
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
    @Query() query: GetTransactionsDto,
    @Res() res: Response,
    @Request() req,
  ) {
    try {
      // Generate unique cache key
      const keyCache = `transactions:${req.user.id}:${query.search}:${query.sortBy}:${query.sortOrder}:${query.dateFrom}:${query.dateTo}:${query.grandTotalMin}:${query.grandTotalMax}:${query.limit}:${query.page}`;

      // Check cache
      const cachedTransactions = await this.redisService.get(keyCache);
      if (cachedTransactions) {
        res.setHeader('X-Cache', 'HIT');
        const response = new ResponseDto(
          ResponseApiStatus.SUCCESS,
          'Berhasil mendapatkan list transaction!',
          JSON.parse(cachedTransactions),
        );
        return res.status(HttpStatus.OK).json(response);
      }

      // Fetch data from service
      const transactions = await this.transactionsService.findAll(
        query,
        req.user,
      );

      // Store response in Redis cache
      await this.redisService.set(keyCache, JSON.stringify(transactions));

      res.setHeader('X-Cache', 'MISS');
      const response = new ResponseDto(
        ResponseApiStatus.SUCCESS,
        'Berhasil mendapatkan list transaction!',
        transactions,
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
      const keyCache = `transactions:${req.user.id}:detail:${id}`;

      // Check cache
      const cachedTransaction = await this.redisService.get(keyCache);
      if (cachedTransaction) {
        res.setHeader('X-Cache', 'HIT');
        const response = new ResponseDto(
          ResponseApiStatus.SUCCESS,
          'Berhasil mendapatkan detail transaksi!',
          JSON.parse(cachedTransaction),
        );
        return res.status(HttpStatus.OK).json(response);
      }

      const transaction = await this.transactionsService.findOne(+id, req.user);

      // Set cache
      await this.redisService.set(keyCache, JSON.stringify(transaction));

      res.setHeader('X-Cache', 'MISS');
      const response = new ResponseDto(
        ResponseApiStatus.SUCCESS,
        'Berhasil mendapatkan detail transaksi!',
        transaction,
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
    @Body() updateTransactionDto: UpdateTransactionDto,
    @Request() req,
  ) {
    try {
      // validate params id
      if (isNaN(+id)) {
        throw new Error('id must be a number');
      }

      const transactionUpdated = await this.transactionsService.update(
        +id,
        updateTransactionDto,
        req.user,
      );

      // Delete all cache about transactions
      await this.redisService.deleteByPattern(`transactions:${req.user.id}:*`);

      return new ResponseDto(
        ResponseApiStatus.SUCCESS,
        'Berhasil update transaksi!',
        transactionUpdated,
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
      await this.transactionsService.remove(+id, req.user);

      // Delete all cache about transactions
      await this.redisService.deleteByPattern(`transactions:${req.user.id}:*`);

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
