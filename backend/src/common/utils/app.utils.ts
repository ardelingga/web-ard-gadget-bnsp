import { randomBytes } from 'crypto';

export const AppUtils = {
  generateRandomToken(): string {
    return randomBytes(32).toString('hex');
  },
};
