import { Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { CashflowType, User } from '@prisma/client';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { appLogUtils } from 'src/common/utils/app-log.utils';
import { GetTransactionsDto } from 'src/modules/transactions/dto/get-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async create(createTransactionDto: CreateTransactionDto, user: User) {
    try {
      let grandTotal = 0; // Initialize grand total

      // Step 1: Process each detail transaction
      const detailTransactionsData = await Promise.all(
        createTransactionDto.detail_transactions.map(async (detail) => {
          // Fetch the product details
          const product = await this.prismaService.product.findUnique({
            where: { id: detail.product_id, is_deleted: false },
            select: { id: true, name: true, price: true, profit: true }, // Ensure price is selected
          });

          if (!product) {
            throw new Error(`Product with ID ${detail.product_id} not found`);
          }

          // Calculate total price for the transaction detail
          const totalPrice = product.price * detail.quantity;
          const totalProfit = product.profit * detail.quantity;

          // Accumulate to grand total & total profit
          grandTotal += totalPrice;

          return {
            product_id: product.id,
            quantity: detail.quantity,
            total_price: totalPrice,
            total_profit: totalProfit,
            product_json: JSON.stringify(product), // Save product details as JSON
          };
        }),
      );

      // Step 2: Calculate money changes
      const moneyChanges = createTransactionDto.total_payment - grandTotal;

      if (moneyChanges < 0) {
        throw new Error('Total payment is less than Grand Total');
      }

      // Step 3: Create the main transaction record
      const transaction = await this.prismaService.transactions.create({
        data: {
          code_transaction: `TRX-${Date.now()}`, // Generate transaction code dynamically
          customer_name: createTransactionDto.customer_name,
          grand_total: grandTotal,
          total_payment: createTransactionDto.total_payment,
          money_changes: moneyChanges,
          created_by: user.id,
        },
      });

      // Step 4: Create detail transactions in bulk
      await this.prismaService.detail_transactions.createMany({
        data: detailTransactionsData.map((detail) => ({
          ...detail,
          transaction_id: transaction.id,
        })),
      });

      // Step 5 (NEW): Automatically Add to Cashflow
      await this.prismaService.cashflow.create({
        data: {
          type: CashflowType.INCOME,
          value: grandTotal,
          description: `Income dari transaksi #${transaction.code_transaction}`, // Deskripsi transaksi
          date: new Date(),
          user_id: user.id,
        },
      });

      return transaction; // Return created transaction
    } catch (error) {
      // Log error
      appLogUtils.error({
        title: '[TransactionsService] Error in create()',
        message: error.message,
        stack: error.stack,
      });
      throw new Error(`Transaction creation failed: ${error.message}`);
    }
  }

  async findAll(paramsQuery: GetTransactionsDto, user: User) {
    try {
      const {
        search,
        sortBy,
        sortOrder,
        page = 1,
        limit = 10,
        dateFrom,
        dateTo,
        grandTotalMin,
        grandTotalMax,
      } = paramsQuery;

      const take = Number(limit);
      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {
        AND: [
          // Filter berdasarkan pencarian
          search
            ? {
                OR: [
                  {
                    code_transaction: { contains: search, mode: 'insensitive' },
                  },
                  { customer_name: { contains: search, mode: 'insensitive' } },
                ],
              }
            : {},
          {
            is_deleted: false, // Filter is_deleted = false
          },
          {
            created_by: user.id, // Filter berdasarkan user yang login
          },
          // Filter rentang tanggal
          dateFrom || dateTo
            ? {
                created_at: {
                  ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
                  ...(dateTo ? { lte: new Date(dateTo) } : {}),
                },
              }
            : {},
          // Filter rentang harga
          grandTotalMin || grandTotalMax
            ? {
                grand_total: {
                  ...(grandTotalMin ? { gte: Number(grandTotalMin) } : {}),
                  ...(grandTotalMax ? { lte: Number(grandTotalMax) } : {}),
                },
              }
            : {},
        ],
      };

      const orderBy = sortBy ? { [sortBy]: sortOrder || 'desc' } : undefined;

      const transactions = await this.prismaService.transactions.findMany({
        where,
        orderBy,
        skip,
        take,
        select: {
          id: true,
          code_transaction: true,
          customer_name: true,
          grand_total: true,
          total_payment: true,
          money_changes: true,
          updated_at: true,
          created_at: true,
        },
      });

      const total = await this.prismaService.transactions.count({
        where,
      });

      return {
        transactions,
        total,
        page: Number(page),
        limit: take,
        totalPages: Math.ceil(total / take),
      };
    } catch (e) {
      // add to log
      appLogUtils.error({
        title: '[TransactionsService] Error findAll()',
        message: e.message,
        stack: e.stack,
      });

      throw new Error(e.message);
    }
  }

  async findOne(id: number, user: User) {
    try {
      const transaction = await this.prismaService.transactions.findUnique({
        where: {
          id: id,
          is_deleted: false,
          created_by: user.id,
        },
        include: {
          detail_transactions: {
            include: {
              product: true,
            },
          },
        },
      });

      if (transaction == null) {
        throw new Error('Transaction not found');
      }

      return transaction;
    } catch (e) {
      // add to log
      appLogUtils.error({
        title: '[TransactionsService] Error findOne()',
        message: e.message,
        stack: e.stack,
      });

      throw new Error(e.message);
    }
  }

  async update(
    transactionId: number,
    updateTransactionDto: UpdateTransactionDto,
    user: User,
  ) {
    try {
      // Step 1: Validasi transaksi yang ada
      const existingTransaction =
        await this.prismaService.transactions.findFirst({
          where: {
            id: transactionId,
            is_deleted: false,
            created_by: user.id, // Pastikan dibuat oleh user yang sama
          },
        });

      if (!existingTransaction) {
        throw new Error(
          `Transaction with ID ${transactionId} not found or has been deleted`,
        );
      }

      // Step 2: Hapus detail transaksi lama
      await this.prismaService.detail_transactions.deleteMany({
        where: {
          transaction_id: transactionId,
        },
      });

      let grandTotal = 0; // Initialize grand total

      // Step 3: Proses detail transaksi baru
      const newDetailTransactions = await Promise.all(
        updateTransactionDto.detail_transactions.map(async (detail) => {
          // Fetch product details
          const product = await this.prismaService.product.findUnique({
            where: { id: detail.product_id, is_deleted: false },
            select: { id: true, name: true, price: true, profit: true }, // Ensure we select price
          });

          if (!product) {
            throw new Error(`Product with ID ${detail.product_id} not found`);
          }

          // Calculate total price
          const totalPrice = product.price * detail.quantity;
          const totalProfit = product.profit * detail.quantity;
          grandTotal += totalPrice; // Add to grand total

          return {
            product_id: product.id,
            quantity: detail.quantity,
            total_price: totalPrice,
            total_profit: totalProfit,
            product_json: JSON.stringify(product), // Serialize product details as JSON
          };
        }),
      );

      // Step 4: Kalkulasi uang kembali (money_changes)
      const moneyChanges = updateTransactionDto.total_payment - grandTotal;

      if (moneyChanges < 0) {
        throw new Error('Total payment is less than Grand Total');
      }

      // Step 5: Update data transaksi utama
      const updatedTransaction = await this.prismaService.transactions.update({
        where: { id: transactionId },
        data: {
          customer_name: updateTransactionDto.customer_name,
          total_payment: updateTransactionDto.total_payment,
          grand_total: grandTotal,
          money_changes: moneyChanges,
        },
      });

      // Step 6: Tambahkan ulang detail transaksi
      await this.prismaService.detail_transactions.createMany({
        data: newDetailTransactions.map((detail) => ({
          ...detail,
          transaction_id: updatedTransaction.id,
        })),
      });

      // Step 7 : Update data cashflow terkait transaksi
      const existingCashflow = await this.prismaService.cashflow.findFirst({
        where: {
          description: `Income dari transaksi #${existingTransaction.code_transaction}`, // Cari berdasarkan deskripsi
          user_id: user.id,
        },
      });

      if (existingCashflow) {
        // Perbarui arus kas
        await this.prismaService.cashflow.update({
          where: { id: existingCashflow.id },
          data: {
            value: grandTotal, // Perbarui jumlah nilai keuntungan
            updated_at: new Date(), // Timestamps update
          },
        });
      }

      return updatedTransaction;
    } catch (error) {
      // Log error
      appLogUtils.error({
        title: '[TransactionsService] Error in update()',
        message: error.message,
        stack: error.stack,
      });

      throw new Error(`Transaction update failed: ${error.message}`);
    }
  }

  async remove(id: number, user: User) {
    try {
      // Step 1: Ambil transaksi berdasarkan ID dan user
      const transaction = await this.prismaService.transactions.findFirst({
        where: {
          id: id,
          is_deleted: false,
          created_by: user.id,
        },
      });

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      // Step 2: Ambil cashflow berdasarkan tanggal transaksi
      const cashflow = await this.prismaService.cashflow.findFirst({
        where: {
          description: `Income dari transaksi #${transaction.code_transaction}`, // Cari berdasarkan deskripsi
          user_id: user.id,
        },
      });

      if (!cashflow) {
        throw new Error('Cashflow not found');
      }

      // Step 5: Tandai transaksi sebagai 'is_deleted: true'
      const deletedTransaction = await this.prismaService.transactions.update({
        where: {
          id: id,
        },
        data: {
          is_deleted: true,
        },
      });

      // Step 6: Tandai cashflow sebagai 'is_deleted: true'
      await this.prismaService.cashflow.update({
        where: {
          id: cashflow.id,
          user_id: user.id,
        },
        data: {
          is_deleted: true,
        },
      });

      // Bersihkan properti yang mungkin tidak perlu dikembalikan
      delete deletedTransaction.created_by;

      return deletedTransaction; // Kembalikan data transaksi yang dihapus
    } catch (e) {
      // add to log
      appLogUtils.error({
        title: '[TransactionsService] Error remove()',
        message: e.message,
        stack: e.stack,
      });

      throw new Error(e.message);
    }
  }
}
