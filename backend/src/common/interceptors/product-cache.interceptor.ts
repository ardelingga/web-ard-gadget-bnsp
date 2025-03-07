import { ExecutionContext, Injectable } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Injectable()
export class ProductCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest();

    //get query
    const { search, sortBy, sortOrder, page, limit, category_id } =
      request.query;
    console.log(
      'QUERY PARAMETER PRODUCT',
      search,
      sortBy,
      sortOrder,
      page,
      limit,
      category_id,
    );

    const userID = request.user.id;
    if (userID) {
      console.log(
        `PRINT KEY SAVED`,
        `products:${search}:${sortBy}:${sortOrder}:${category_id}:${limit}:${page}:${userID}`,
      );
      return `products:${search}:${sortBy}:${sortOrder}:${category_id}:${limit}:${page}:${userID}`;
    }

    // return default key
    return super.trackBy(context);
  }
}
