import { Injectable, Logger } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/modules/prisma/prisma.service';

export const runtime = 'edge';
import { put, head, del } from '@vercel/blob';
import { ConfigService } from '@nestjs/config';
import * as path from 'node:path';
import { Prisma, User } from '@prisma/client';
import * as fs from 'fs';
import { GetProductsDto } from './dto/get-product.dto';
import { appLogUtils } from 'src/common/utils/app-log.utils';

@Injectable()
export class ProductService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  private readonly logger = new Logger(ProductService.name);

  async create(createProductDto: CreateProductDto, user: User) {
    try {
      let result;

      // Process the uploaded file ----------------------------
      const appEnv = this.configService.get('APP_ENV');
      if (appEnv === 'development') {
        // save file to local
        const directoryPath = path.join(__dirname, '../../../storage/products');
        const uniqueSuffixFileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const filename = `${uniqueSuffixFileName}${createProductDto.image_file.originalname}`;
        const filePath = path.join(directoryPath, filename);

        if (!fs.existsSync(directoryPath)) {
          fs.mkdirSync(directoryPath, { recursive: true });
        }

        // Membuat stream untuk menulis file ke disk
        const writeStream = fs.createWriteStream(filePath);

        // Menulis file ke disk menggunakan stream
        writeStream.write(createProductDto.image_file.buffer);
        writeStream.end();

        // Mengatur URL file
        result = {
          url: `${this.configService.get('PATH_FILE_ACCESABLE')}/products/${filename}`,
        };
      } else {
        const fileBuffer = createProductDto.image_file.buffer;
        const vercelFile = new File(
          [fileBuffer],
          createProductDto.image_file.originalname,
          {
            type: createProductDto.image_file.mimetype,
          },
        );

        // Unggah ke Vercel Blob menggunakan API Vercel
        const blobResponse = await put(
          `/products/${vercelFile.name}`,
          vercelFile,
          {
            access: 'public',
          },
        );
        result = { url: blobResponse.url };
      }

      const codeProduct = `PRD-${Date.now()}`;
      const product = await this.prismaService.product.create({
        data: {
          code: codeProduct,
          image_url: result.url,
          name: createProductDto.name,
          price: Number(createProductDto.price),
          profit: Number(createProductDto.profit),
          category_id: Number(createProductDto.category_id),
          stock: Number(createProductDto.stock),
          created_by: user.id,
        },
      });

      delete product.created_by;
      return product;
    } catch (error) {
      // add to log
      appLogUtils.error({
        title: '[ProductService] Error create()',
        message: error.message,
        stack: error.stack,
      });

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new Error(
            'Category not found. Please ensure the category exists before adding the product.',
          );
        }
      }
      // Log other errors
      throw new Error(
        'An error occurred while creating the product. Please try again.',
      );
    }
  }

  async findAll(query: GetProductsDto, user: User) {
    try {
      const {
        search,
        sortBy,
        sortOrder,
        page = 1,
        limit = 10,
        category_id,
      } = query;
      const take = Number(limit);
      const skip = (Number(page) - 1) * Number(limit);

      console.log('PRINT LIMIT ', limit);

      const where: any = {
        AND: [
          search
            ? {
                name: {
                  contains: search,
                  mode: 'insensitive', // insensitive untuk pencarian case-insensitive
                },
              }
            : {},
          category_id
            ? {
                category_id: category_id, // filter berdasarkan category_id
              }
            : {},
          {
            is_deleted: false, // filter berdasarkan is_deleted = false
          },
          {
            created_by: user.id, // filter berdasarkan user_id
          },
        ],
      };

      console.log('PRINT WHERE ', where);

      const orderBy = sortBy ? { [sortBy]: sortOrder || 'desc' } : undefined;
      console.log('PRINT ORDER BY ', orderBy);

      const products = await this.prismaService.product.findMany({
        where,
        orderBy,
        skip,
        take,
        select: {
          id: true,
          code: true,
          image_url: true,
          name: true,
          price: true,
          profit: true,
          category_id: false,
          stock: true,
          created_by: false,
          category: {
            select: {
              id: true, // memilih kolom id dari category
              name: true, // memilih kolom name dari category
            },
          },
          created_by_user: {
            // menggunakan include untuk melakukan join ke tabel user
            select: {
              id: true, // memilih kolom id dari user
              name_business: true, // memilih kolom name dari user
            },
          },
          updated_at: true,
          created_at: true,
        },
      });

      const total = await this.prismaService.product.count({
        where,
      });

      return {
        products,
        total,
        page: Number(page),
        limit: take,
        totalPages: Math.ceil(total / take),
      };
    } catch (error) {
      // add to log
      appLogUtils.error({
        title: '[ProductService] Error findAll()',
        message: error.message,
        stack: error.stack,
      });

      throw new Error(error.message);
    }
  }

  async findOne(id: number, user: User) {
    try {
      const product = await this.prismaService.product.findUnique({
        where: {
          id: id,
          is_deleted: false,
          created_by: user.id,
        },
        select: {
          id: true,
          code: true,
          image_url: true,
          name: true,
          price: true,
          profit: true,
          category_id: false,
          stock: true,
          created_by: false,
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          created_by_user: {
            select: {
              id: true,
              name_business: true,
            },
          },
          updated_at: true,
          created_at: true,
        },
      });

      // Check if the product exists
      if (product == null) {
        throw new Error('Product not found');
      }

      return product;
    } catch (error) {
      // add to log
      appLogUtils.error({
        title: '[ProductService] Error findOne()',
        message: error.message,
        stack: error.stack,
      });
      throw new Error(error.message);
    }
  }

  async update(id: number, updateProductDto: UpdateProductDto, user: User) {
    try {
      const product = await this.prismaService.product.findUnique({
        where: {
          id: id,
          is_deleted: false,
          created_by: user.id,
        },
      });

      // Check if the product exists
      if (product == null) {
        throw new Error('Product not found');
      }

      let updatedImageUrl = product.image_url;

      const appEnv = this.configService.get('APP_ENV');
      if (appEnv === 'development') {
        // Process the file ----------------------------
        // Delete image existing from local storage

        if (updateProductDto.image_file != null) {
          const oldFilePath = path.join(
            __dirname,
            '../../../storage/products',
            path.basename(product.image_url),
          );
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }

          // upload new images
          const directoryPath = path.join(
            __dirname,
            '../../../storage/products',
          );
          const uniqueSuffixFileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const filename = `${uniqueSuffixFileName}${updateProductDto.image_file.originalname}`;
          const filePath = path.join(directoryPath, filename);

          if (!fs.existsSync(directoryPath)) {
            fs.mkdirSync(directoryPath, { recursive: true });
          }

          // Save new file to disk
          fs.writeFileSync(filePath, updateProductDto.image_file.buffer);
          updatedImageUrl = `${this.configService.get('PATH_FILE_ACCESABLE')}/products/${filename}`;
        }
      } else {
        // Process the file ----------------------------
        // Delete image existing from vercel blob
        if (updateProductDto.image_file != null) {
          // Delete image existing from vercel blob
          const getImageBlob = await head(product.image_url);

          // Check if the image not exists
          if (getImageBlob == null) {
            throw new Error('Image not found');
          }

          // Delete image existing from vercel blob
          await del(product.image_url);

          // Upload image again to vercel blob
          // Membaca file dari sistem file lokal
          const fileBuffer = updateProductDto.image_file.buffer;
          // Konversi ke File
          const vercelFile = new File(
            [fileBuffer],
            updateProductDto.image_file.originalname,
            {
              type: updateProductDto.image_file.mimetype,
            },
          );

          // Unggah ke Vercel Blob
          const result = await put(`/products/${vercelFile.name}`, vercelFile, {
            access: 'public',
          });

          updatedImageUrl = result.url;
        }
      }

      const productUpdated = await this.prismaService.product.update({
        where: {
          id: id,
          is_deleted: false,
          created_by: user.id,
        },
        data: {
          code: product.code,
          name: updateProductDto.name,
          price: Number(updateProductDto.price),
          profit: Number(updateProductDto.profit),
          category_id: Number(updateProductDto.category_id),
          stock: Number(updateProductDto.stock),
          image_url: updatedImageUrl,
          updated_at: new Date(),
        },
      });

      delete productUpdated.created_by;
      return productUpdated;
    } catch (error) {
      // add to log
      appLogUtils.error({
        title: '[ProductService] Error update()',
        message: error.message,
        stack: error.stack,
      });
      throw new Error(error.message);
    }
  }

  async remove(id: number, user: User) {
    try {
      const product = await this.prismaService.product.findUnique({
        where: {
          id: id,
          is_deleted: false,
          created_by: user.id,
        },
      });

      // Check if the product exists
      if (product == null) {
        throw new Error('Product not found');
      }

      const appEnv = this.configService.get('APP_ENV');
      if (appEnv === 'development') {
        const imgFileProduct = path.join(
          __dirname,
          '../../../storage/products',
          path.basename(product.image_url),
        );
        if (fs.existsSync(imgFileProduct)) {
          fs.unlinkSync(imgFileProduct);
        }
      } else {
        // Delete image existing from vercel blob
        const getImageBlob = await head(product.image_url);
        // Check if the image not exists
        if (getImageBlob == null) {
          throw new Error('Image not found');
        }

        // Delete image existing from vercel blob
        await del(product.image_url);
      }

      const productDeleted = await this.prismaService.product.update({
        where: {
          id: id,
        },
        data: {
          is_deleted: true,
          image_url: null,
          updated_at: new Date(),
        },
      });

      return productDeleted;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
