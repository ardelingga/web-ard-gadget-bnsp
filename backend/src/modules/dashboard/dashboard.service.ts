import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { appLogUtils } from 'src/common/utils/app-log.utils';
import { CashflowType, User } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAllDashboard(user: User, dateFrom?: string, dateTo?: string) {
    try {
      // Build dynamic date filter
      const dateFilter =
        dateFrom || dateTo
          ? `
        AND t.created_at ${dateFrom ? '>= $2' : ''} ${
          dateTo ? (dateFrom ? 'AND t.created_at <= $3' : '<= $2') : ''
        }
      `
          : '';

      // Query SQL
      const query = `
          WITH total_transaction AS (SELECT count(t.id) AS total_transaction
                                     FROM transactions t
                                     WHERE t.is_deleted = false
                                       AND t.created_by = $1
              ${dateFilter}
              )
             , total_profit AS (
          SELECT sum (dt.total_profit) AS total_profit
          FROM detail_transactions dt
              JOIN transactions t
          ON t.id = dt.transaction_id
          WHERE t.is_deleted = false
            AND t.created_by = $1 ${dateFilter}
              )
              , total_income AS (
          SELECT sum (c.value) AS total_income
          FROM cashflow c
          WHERE c.is_deleted = false
            AND c.type = 'INCOME'
            AND c.user_id = $1 ${
              dateFrom || dateTo
                ? `AND c.created_at ${dateFrom ? '>= $2' : ''} ${
                    dateTo
                      ? dateFrom
                        ? 'AND c.created_at <= $3'
                        : '<= $2'
                      : ''
                  }`
                : ''
            }
              )
              , total_expense AS (
          SELECT sum (c.value) AS total_expense
          FROM cashflow c
          WHERE c.is_deleted = false
            AND c.type = 'EXPENSE'
            AND c.user_id = $1 ${
              dateFrom || dateTo
                ? `AND c.created_at ${dateFrom ? '>= $2' : ''} ${
                    dateTo
                      ? dateFrom
                        ? 'AND c.created_at <= $3'
                        : '<= $2'
                      : ''
                  }`
                : ''
            }
              )
          SELECT t.total_transaction,
                 p.total_profit,
                 i.total_income,
                 e.total_expense
          FROM total_transaction t,
               total_profit p,
               total_income i,
               total_expense e;
      `;

      // Create prepared parameters dynamically
      const params: any[] = [user.id];
      if (dateFrom) params.push(new Date(dateFrom));
      if (dateTo) params.push(new Date(dateTo));

      // Execute query with raw Prisma query
      const result = await this.prismaService.$queryRawUnsafe(query, ...params);

      const formattedResult = {
        total_transaction: Number(result[0].total_transaction),
        total_profit: Number(result[0].total_profit),
        total_income: Number(result[0].total_income),
        total_expense: Number(result[0].total_expense),
      };

      return formattedResult;
    } catch (e) {
      // add to log
      appLogUtils.error({
        title: '[DashboardService] Error getAllDashboard()',
        message: e.message,
        stack: e.stack,
      });

      throw new Error(e.message);
    }
  }

  // 1. Get Total Transaksi
  async getTotalTransaction(
    dateFrom?: string,
    dateTo?: string,
  ): Promise<number> {
    try {
      const whereCondition: any = {
        AND: [
          {
            is_deleted: false,
          },
          dateFrom || dateTo
            ? {
                date: {
                  ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
                  ...(dateTo ? { lte: new Date(dateTo) } : {}),
                },
              }
            : {},
        ],
      };

      const totalTransaction = await this.prismaService.transactions.aggregate({
        _count: {
          id: true,
        },
        where: whereCondition,
      });

      return totalTransaction._count.id || 0;
    } catch (e) {
      // add to log
      appLogUtils.error({
        title: '[DashboardService] Error getTotalTransaction()',
        message: e.message,
        stack: e.stack,
      });

      throw new Error(e.message);
    }
  }

  async getTotalIncome(
    user: User,
    dateFrom?: string,
    dateTo?: string,
  ): Promise<number> {
    try {
      const whereCondition: any = {
        AND: [
          {
            is_deleted: false,
            user_id: user.id,
            type: CashflowType.INCOME,
          },
          dateFrom || dateTo
            ? {
                date: {
                  ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
                  ...(dateTo ? { lte: new Date(dateTo) } : {}),
                },
              }
            : {},
        ],
      };

      const totalCashflow = await this.prismaService.cashflow.aggregate({
        _sum: {
          value: true,
        },
        where: whereCondition,
      });

      return totalCashflow._sum.value || 0;
    } catch (e) {
      // add to log
      appLogUtils.error({
        title: '[DashboardService] Error getTotalIncome()',
        message: e.message,
        stack: e.stack,
      });

      throw new Error(e.message);
    }
  }

  async getTotalExpense(
    user: User,
    dateFrom?: string,
    dateTo?: string,
  ): Promise<number> {
    try {
      const whereCondition: any = {
        AND: [
          {
            is_deleted: false,
            user_id: user.id,
            type: CashflowType.EXPENSE,
          },
          dateFrom || dateTo
            ? {
                date: {
                  ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
                  ...(dateTo ? { lte: new Date(dateTo) } : {}),
                },
              }
            : {},
        ],
      };

      const totalCashflow = await this.prismaService.cashflow.aggregate({
        _sum: {
          value: true,
        },
        where: whereCondition,
      });

      return totalCashflow._sum.value || 0;
    } catch (e) {
      // add to log
      appLogUtils.error({
        title: '[DashboardService] Error getTotalIncome()',
        message: e.message,
        stack: e.stack,
      });

      throw new Error(e.message);
    }
  }

  // 2. Get Total Profit
  async getTotalProfit(
    user: User,
    dateFrom?: string,
    dateTo?: string,
  ): Promise<number> {
    try {
      // Buat query dasar
      let query = `
          SELECT SUM(dt.total_profit) AS total_profit
          FROM detail_transactions dt
                   LEFT JOIN transactions t ON t.id = dt.transaction_id
          WHERE t.is_deleted = false
            AND t.created_by = ${user.id}
      `;

      // Tambahkan kondisi secara dinamis
      if (dateFrom) query += ` AND t.created_at >= '${dateFrom}'`;
      if (dateTo) query += ` AND t.created_at <= '${dateTo}'`;

      // Eksekusi query dengan Prisma
      const result = await this.prismaService.$queryRawUnsafe(query);

      // Ambil hasilnya dan kembalikan total profit
      return result[0]?.total_profit || 0;
    } catch (e) {
      // Log jika ada error
      appLogUtils.error({
        title: '[DashboardService] Error in getTotalProfit()',
        message: e.message,
        stack: e.stack,
      });

      // Lempar error agar terproses di caller
      throw new Error(e.message);
    }
  }

  async calculateRevenueStream() {
    // Fetch transactions & cashflow data
    const transactions = await this.prismaService.transactions.groupBy({
      by: ['created_at'],
      _sum: { grand_total: true },
    });

    const cashflow = await this.prismaService.cashflow.groupBy({
      by: ['type', 'date'], // Group income/expenses
      _sum: { value: true },
    });

    // Initialize totals per quarter
    const quarters = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };
    const expenses = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };

    // Process transactions for revenue (grand_total)
    transactions.forEach((txn) => {
      const quarter = this.calculateQuarter(new Date(txn.created_at));
      quarters[quarter] += txn._sum.grand_total || 0;
    });

    // Process cashflow income/expense
    cashflow.forEach((cf) => {
      const quarter = this.calculateQuarter(new Date(cf.date));

      if (cf.type === 'INCOME') {
        quarters[quarter] += cf._sum.value || 0;
      } else if (cf.type === 'EXPENSE') {
        expenses[quarter] += cf._sum.value || 0;
      }
    });

    // Finalize response
    return {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'], // Quarters
      datasets: [
        {
          label: 'Revenue', // Total income
          data: [quarters.Q1, quarters.Q2, quarters.Q3, quarters.Q4],
          backgroundColor: '#42A5F5',
        },
        {
          label: 'Expenses', // Total expenses
          data: [expenses.Q1, expenses.Q2, expenses.Q3, expenses.Q4],
          backgroundColor: '#66BB6A',
        },
      ],
    };
  }

  async organizeByQuarters(cashflow, transactions) {
    console.log('PRINT CASHFLOW');
    console.log(cashflow);

    console.log('PRINT TRANSACTIONS');
    console.log(transactions);

    const result = {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'], // Kuartal
      datasets: [
        {
          label: 'Revenue', // Dari transaksi
          data: [1000, 2000, 3000, 4000], // Placeholder (isi dengan transaksi)
          backgroundColor: '#42A5F5',
        },
        {
          label: 'Expenses', // Dari pengeluaran arus kas
          data: [500, 800, 1000, 1500], // Placeholder
          backgroundColor: '#66BB6A',
        },
        // Tambahkan kategori lain jika diperlukan
      ],
    };
    return result;
  }

  calculateQuarter(date: Date): string {
    const month = date.getMonth() + 1; // getMonth returns 0-based index

    if (month <= 3) return 'Q1';
    if (month <= 6) return 'Q2';
    if (month <= 9) return 'Q3';
    return 'Q4';
  }

  // 3. Grafik Penjualan
  async getSalesGraphData(
    dateFrom?: string,
    dateTo?: string,
    interval = 'daily',
  ): Promise<any> {
    // const whereCondition: any = {
    //   AND: [
    //     {
    //       is_deleted: false,
    //     },
    //     dateFrom || dateTo
    //       ? {
    //           date: {
    //             ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
    //             ...(dateTo ? { lte: new Date(dateTo) } : {}),
    //           },
    //         }
    //       : {},
    //   ],
    // };
    //
    // const groupByCondition =
    //   interval === 'daily' ? 'day' : interval === 'monthly' ? 'month' : 'year';
    //
    // const salesGraph = await this.prismaService.transactions.groupBy({
    //   by: [groupByCondition],
    //   _sum: {
    //     total: true,
    //   },
    //   where: whereCondition,
    // });
    //
    // return salesGraph.map((record) => ({
    //   period: record[groupByCondition], // Bisa hari/bulan/tahun berdasarkan interval
    //   total: record._sum.total,
    // }));
  }

  // 4. Product Best Selling
  async getBestSellingProducts(
    dateFrom?: string,
    dateTo?: string,
    limit = 5,
  ): Promise<any> {
    // const whereCondition: any = {
    //   AND: [
    //     {
    //       is_deleted: false,
    //     },
    //     dateFrom || dateTo
    //       ? {
    //           date: {
    //             ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
    //             ...(dateTo ? { lte: new Date(dateTo) } : {}),
    //           },
    //         }
    //       : {},
    //   ],
    // };
    //
    // const bestSellingProducts = await this.prismaService.product.findMany({
    //   select: {
    //     id: true,
    //     name: true,
    //     total_sold: true, // Asumsi kolom stok berada di tabel produk
    //   },
    //   where: whereCondition,
    //   orderBy: {
    //     total_sold: 'desc',
    //   },
    //   take: limit,
    // });
    //
    // return bestSellingProducts;
  }
}
