import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import * as moment from 'moment-timezone';
import 'winston-daily-rotate-file';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      transports: [
        new winston.transports.DailyRotateFile({
          filename: 'logs/%DATE%/error.log',
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
        }),

        new winston.transports.DailyRotateFile({
          filename: 'logs/%DATE%/info.log',
          datePattern: 'YYYY-MM-DD',
          level: 'info',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
        }),

        new winston.transports.DailyRotateFile({
          filename: 'logs/%DATE%/warn.log',
          datePattern: 'YYYY-MM-DD',
          level: 'warn',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
        }),

        new winston.transports.Console(),
      ],
      format: winston.format.combine(
        winston.format.timestamp({
          format: () =>
            moment().tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss'),
        }),
        winston.format.printf(({ timestamp, level, message }) => {
          return `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
        }),
      ),
    }),
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Jika menggunakan cookie
  });

  const config = new DocumentBuilder()
    .setTitle('Ard Gadget BNSP API')
    .setDescription('The Ard Gadget BNSP API description')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        description: `[just text field] Please enter token in following format: Bearer <JWT>`,
        name: 'Authorization',
        bearerFormat: 'Bearer',
        scheme: 'Bearer',
        type: 'http', // I`ve attempted type: 'apiKey' too
        in: 'Header',
      },
      'Authorization',
    )
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, documentFactory, {
    jsonDocumentUrl: 'api-docs/json',
  });

  app.setGlobalPrefix('api');

  await app.listen(app.get(ConfigService).get('PORT') ?? 3001);
}

bootstrap();
