import { Injectable } from '@nestjs/common';
import { CreateCashflowDto } from './dto/create-cashflow.dto';
import { UpdateCashflowDto } from './dto/update-cashflow.dto';
import { CashflowType, Prisma, User } from '@prisma/client';
import { appLogUtils } from 'src/common/utils/app-log.utils';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { GetCashflowsDto } from 'src/modules/cashflow/dto/get-cashflow.dto';

@Injectable()
export class CashflowService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async create(createCashflowDto: CreateCashflowDto, user: User) {
    try {
      const newCashflow = await this.prismaService.cashflow.create({
        data: {
          type:
            createCashflowDto.type == 'income'
              ? CashflowType.INCOME
              : CashflowType.EXPENSE, // 'income' or 'expense'
          value: createCashflowDto.value, // Cash value
          description: createCashflowDto.description, // Optional description
          date: createCashflowDto.date
            ? new Date(createCashflowDto.date)
            : new Date(),
          user_id: user.id, // Logged-in user's ID
        },
      });

      return newCashflow;
    } catch (e) {
      // Log error
      appLogUtils.error({
        title: '[CashflowService] Error create()',
        message: e.message,
        stack: e.stack,
      });
      throw new Error(e.message);
    }
  }

  async findAll(paramsQuery: GetCashflowsDto, user: User) {
    try {
      const {
        search,
        sortBy,
        sortOrder,
        page = 1,
        limit = 10,
        dateFrom,
        dateTo,
        month,
        type, // Tambahkan filter type
      } = paramsQuery;

      const take = Number(limit);
      const skip = (Number(page) - 1) * Number(limit);

      // Bangun query 'where'
      const where: any = {
        AND: [
          // Filter berdasarkan pencarian
          search
            ? {
                OR: [
                  {
                    description: { contains: search, mode: 'insensitive' },
                  },
                ],
              }
            : {},
          {
            is_deleted: false, // Filter untuk hanya data yang tidak dihapus
          },
          {
            user_id: user.id, // Filter berdasarkan user yang login
          },
          // Filter berdasarkan range tanggal
          dateFrom || dateTo
            ? {
                date: {
                  ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
                  ...(dateTo ? { lte: new Date(dateTo) } : {}),
                },
              }
            : {},
          // Filter berdasarkan bulan tertentu
          month
            ? {
                date: {
                  gte: new Date(`${month}-01`), // Awal bulan
                  lt: new Date(
                    new Date(`${month}-01`).setMonth(
                      new Date(`${month}-01`).getMonth() + 1,
                    ),
                  ), // Awal bulan berikutnya
                },
              }
            : {},
          // Filter berdasarkan type (income/expense)
          type
            ? {
                type: type == 'income' ? CashflowType.INCOME : CashflowType.EXPENSE, // Prisma akan otomatis mencocokkan nilai 'income' atau 'expense'
              }
            : {},
        ],
      };

      const orderBy = sortBy
        ? { [sortBy]: sortOrder || Prisma.SortOrder.desc }
        : { date: Prisma.SortOrder.desc };

      // Mendapatkan daftar cashflow
      const cashflows = await this.prismaService.cashflow.findMany({
        where,
        orderBy,
        skip,
        take,
        select: {
          id: true,
          type: true,
          value: true,
          description: true,
          date: true,
          updated_at: true,
          created_at: true,
        },
      });

      // Mendapatkan total record
      const total = await this.prismaService.cashflow.count({
        where,
      });

      return {
        cashflows,
        total,
        page: Number(page),
        limit: take,
        totalPages: Math.ceil(total / take),
      };
    } catch (e) {
      // Log error
      appLogUtils.error({
        title: '[CashflowService] Error findAll()',
        message: e.message,
        stack: e.stack,
      });
      throw new Error(e.message);
    }
  }

  async findOne(id: number, user: User) {
    try {
      const cashflow = await this.prismaService.cashflow.findFirst({
        where: {
          id, // Match by cashflow ID
          user_id: user.id, // Ensure it belongs to the logged-in user
          is_deleted: false, // Only return if not deleted
        },
      });

      if (!cashflow) {
        throw new Error('Cashflow not found'); // Handle not found error
      }

      return cashflow;
    } catch (e) {
      // Log error
      appLogUtils.error({
        title: '[CashflowService] Error findOne()',
        message: e.message,
        stack: e.stack,
      });
      throw new Error(e.message);
    }
  }

  // UPDATE CASHFLOW
  async update(id: number, updateCashflowDto: UpdateCashflowDto, user: User) {
    try {
      // Check if the cashflow exists and belongs to the user
      const existingCashflow = await this.prismaService.cashflow.findFirst({
        where: {
          id,
          user_id: user.id,
          is_deleted: false, // Only update non-deleted cashflows
        },
      });

      if (!existingCashflow) {
        throw new Error('Cashflow not found');
      }

      const updatedCashflow = await this.prismaService.cashflow.update({
        where: { id },
        data: {
          type:
            updateCashflowDto.type == 'income'
              ? CashflowType.INCOME
              : CashflowType.EXPENSE,
          value: updateCashflowDto.value || existingCashflow.value, // Update value if provided
          description:
            updateCashflowDto.description || existingCashflow.description, // Update description if provided
          date: updateCashflowDto.date
            ? new Date(updateCashflowDto.date)
            : existingCashflow.date, // Update date if provided
          updated_at: new Date(), // Update the updated_at timestamp
        },
      });

      return updatedCashflow;
    } catch (e) {
      // Log error
      appLogUtils.error({
        title: '[CashflowService] Error update()',
        message: e.message,
        stack: e.stack,
      });
      throw new Error(e.message);
    }
  }

  // DELETE CASHFLOW (Soft Delete)
  async remove(id: number, user: User) {
    try {
      // Check if the cashflow exists and belongs to the user
      const existingCashflow = await this.prismaService.cashflow.findFirst({
        where: {
          id,
          user_id: user.id,
          is_deleted: false, // Only delete non-deleted cashflows
        },
      });

      if (!existingCashflow) {
        throw new Error('Cashflow not found');
      }

      // Perform a soft delete (mark as deleted)
      return await this.prismaService.cashflow.update({
        where: { id },
        data: {
          is_deleted: true, // Mark as deleted
          updated_at: new Date(), // Update the updated_at timestamp
        },
      });
    } catch (e) {
      // Log error
      appLogUtils.error({
        title: '[CashflowService] Error remove()',
        message: e.message,
        stack: e.stack,
      });
      throw new Error(e.message);
    }
  }
}
