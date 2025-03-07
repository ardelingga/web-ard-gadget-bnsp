import { ExecutionContext, Injectable } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Injectable()
export class UserCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest();

    const userID = request.user.id;
    if (userID) {
      return `profile:${userID}`;
    }

    // return default key
    return super.trackBy(context);
  }
}
