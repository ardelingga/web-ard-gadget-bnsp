import {
  Controller,
  Get,
  HttpStatus,
  Query,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { RedisService } from 'src/services/redis/redis.service';
import { DateFilterDto } from 'src/modules/dashboard/dto/date-filter.dto';
import { BestSellingProductsDto } from 'src/modules/dashboard/dto/best-selling-product.dto';
import { SalesGraphDto } from 'src/modules/dashboard/dto/sales-graph.dto';
import { ResponseApiStatus, ResponseDto } from 'src/common/utils/response.dto';
import { Response } from 'express';
import { JwtGuard } from 'src/common/guards/jwt.guard';

@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly redisService: RedisService,
  ) {}

  @Get('all')
  @UseGuards(JwtGuard)
  async allDashboard(
    @Query() filters: DateFilterDto,
    @Res() res: Response,
    @Request() req,
  ) {
    try {
      const totalTransaction = await this.dashboardService.getAllDashboard(
        req.user,
        filters.dateFrom,
        filters.dateTo,
      );

      res.setHeader('X-Cache', 'MISS');
      const response = new ResponseDto(
        ResponseApiStatus.SUCCESS,
        'Berhasil mendapatkan all dashboard!',
        totalTransaction,
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

  @Get('total-transactions')
  @UseGuards(JwtGuard)
  async getTotalTransactions(
    @Query() filters: DateFilterDto,
    @Res() res: Response,
    @Request() req,
  ) {
    try {
      const totalTransaction = await this.dashboardService.getTotalTransaction(
        filters.dateFrom,
        filters.dateTo,
      );

      res.setHeader('X-Cache', 'MISS');
      const response = new ResponseDto(
        ResponseApiStatus.SUCCESS,
        'Berhasil mendapatkan total transaksi!',
        {
          total_transaction: totalTransaction,
        },
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

  @Get('total-profit')
  @UseGuards(JwtGuard)
  async getTotalProfit(
    @Query() filters: DateFilterDto,
    @Res() res: Response,
    @Request() req,
  ) {
    try {
      const totalProfit = await this.dashboardService.getTotalProfit(
        req.user,
        filters.dateFrom,
        filters.dateTo,
      );

      res.setHeader('X-Cache', 'MISS');
      const response = new ResponseDto(
        ResponseApiStatus.SUCCESS,
        'Berhasil mendapatkan total profit!',
        {
          total_profit: totalProfit,
        },
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

  @Get('total-income')
  @UseGuards(JwtGuard)
  async getTotalIncome(
    @Query() filters: DateFilterDto,
    @Res() res: Response,
    @Request() req,
  ) {
    try {
      const totalIncome = await this.dashboardService.getTotalIncome(
        req.user,
        filters.dateFrom,
        filters.dateTo,
      );

      res.setHeader('X-Cache', 'MISS');
      const response = new ResponseDto(
        ResponseApiStatus.SUCCESS,
        'Berhasil mendapatkan total income!',
        {
          total_income: totalIncome,
        },
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

  @Get('total-expense')
  @UseGuards(JwtGuard)
  async getTotalExpense(
    @Query() filters: DateFilterDto,
    @Res() res: Response,
    @Request() req,
  ) {
    try {
      const totalExpense = await this.dashboardService.getTotalExpense(
        req.user,
        filters.dateFrom,
        filters.dateTo,
      );

      res.setHeader('X-Cache', 'MISS');
      const response = new ResponseDto(
        ResponseApiStatus.SUCCESS,
        'Berhasil mendapatkan total expense!',
        {
          total_expense: totalExpense,
        },
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

  @Get('/revenue')
  async getRevenueStream(@Res() res: Response) {
    try {
      const revenueChart = await this.dashboardService.calculateRevenueStream();

      res.setHeader('X-Cache', 'MISS');
      const response = new ResponseDto(
        ResponseApiStatus.SUCCESS,
        'Berhasil mendapatkan revenue chart data!',
        revenueChart,
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

  @Get('sales-graph')
  @UseGuards(JwtGuard)
  async getSalesGraphData(@Query() query: SalesGraphDto) {
    return this.dashboardService.getSalesGraphData(
      query.dateFrom,
      query.dateTo,
      query.interval || 'daily', // Default interval di sini
    );
  }

  @Get('best-selling-products')
  @UseGuards(JwtGuard)
  async getBestSellingProducts(@Query() query: BestSellingProductsDto) {
    return this.dashboardService.getBestSellingProducts(
      query.dateFrom,
      query.dateTo,
      query.limit || 5, // Default limit di sini
    );
  }
}
