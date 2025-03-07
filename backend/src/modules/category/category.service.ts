import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import { appLogUtils } from 'src/common/utils/app-log.utils';
import { SyncBulkCategoryDto } from 'src/modules/category/dto/sync-bulk-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async create(createCategoryDto: CreateCategoryDto, user: User) {
    try {
      const category = await this.prismaService.category.create({
        data: {
          name: createCategoryDto.name,
          created_by: user.id,
        },
      });

      delete category.created_by;

      return category;
    } catch (error) {
      // add to log
      appLogUtils.error({
        title: '[CategoryService] Error create()',
        message: error.message,
        stack: error.stack,
      });
      throw new Error(error);
    }
  }

  async syncData(syncBulkCategoryDto: SyncBulkCategoryDto, user: User) {
    try {
      for (const category of syncBulkCategoryDto.categories) {
        // find category exist
        const categoryExist = await this.prismaService.category.findFirst({
          where: {
            created_by: user.id,
            uuid: category.uuid,
          },
        });

        if (categoryExist == null) {
          // insert data to category table
          await this.prismaService.category.create({
            data: {
              uuid: category.uuid,
              name: category.name,
              is_deleted:
                typeof category.is_deleted === 'string'
                  ? category.is_deleted === 'true'
                  : category.is_deleted,
              updated_at: new Date(category.updated_at),
              created_at: new Date(category.created_at),
              created_by: user.id,
            },
          });
        } else {
          // Update data in database
          await this.prismaService.category.update({
            where: {
              uuid: category.uuid,
            },
            data: {
              name: category.name,
              // convert to boolean type
              is_deleted:
                typeof category.is_deleted === 'string'
                  ? category.is_deleted === 'true'
                  : category.is_deleted,
              updated_at: new Date(category.updated_at),
              created_at: new Date(category.created_at),
              created_by: user.id,
            },
          });
        }

        console.log('PRINT CATEGORY EXIST ', categoryExist);
      }

      return syncBulkCategoryDto;
    } catch (error) {
      // add to log
      appLogUtils.error({
        title: '[CategoryService] Error create()',
        message: error.message,
        stack: error.stack,
      });
      throw new Error(error);
    }
  }

  async findAll(user: User) {
    try {
      const categories = await this.prismaService.category.findMany({
        where: {
          created_by: user.id,
          is_deleted: false,
        },
        select: {
          id: true,
          name: true,
          updated_at: true,
          created_at: true,
        },
        orderBy: {
          created_at: 'desc', // Descending order
        },
      });

      return categories;
    } catch (error) {
      // add to log
      appLogUtils.error({
        title: '[CategoryService] Error findAll()',
        message: error.message,
        stack: error.stack,
      });
      throw new Error(error);
    }
  }

  async findOne(id: number, user: User) {
    try {
      const category = await this.prismaService.category.findFirst({
        where: {
          id: id,
          created_by: user.id,
          is_deleted: false,
        },
      });

      delete category.created_by;
      return category;
    } catch (error) {
      // add to log
      appLogUtils.error({
        title: '[CategoryService] Error findOne()',
        message: error.message,
        stack: error.stack,
      });
      throw new Error(error);
    }
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto, user: User) {
    try {
      const updateCategory = await this.prismaService.category.update({
        where: {
          id: id,
          is_deleted: false,
          created_by: user.id,
        },
        data: {
          name: updateCategoryDto.name,
          updated_at: new Date(),
        },
      });

      delete updateCategory.created_by;
      return updateCategory;
    } catch (error) {
      // add to log
      appLogUtils.error({
        title: '[CategoryService] Error update()',
        message: error.message,
        stack: error.stack,
      });
      throw new Error(error);
    }
  }

  async remove(id: number, user: User) {
    try {
      const deleteCategory = await this.prismaService.category.update({
        where: {
          id: id,
          created_by: user.id,
        },
        data: {
          is_deleted: true,
          updated_at: new Date(),
        },
      });

      delete deleteCategory.created_by;
      return deleteCategory;
    } catch (error) {
      // add to log
      appLogUtils.error({
        title: '[CategoryService] Error create()',
        message: error.message,
        stack: error.stack,
      });
      throw new Error(error);
    }
  }
}
