import { Logger } from '@nestjs/common';

const logger = new Logger();
export const appLogUtils = {
  error({
    title,
    message,
    stack,
  }: {
    title: string;
    message: string;
    stack: any;
  }) {
    logger.error(
      `${title}\n[MESSAGE ERROR] :\n${message}, \n\n[STACK ERROR]:\n${stack}`,
    );
  },
};
