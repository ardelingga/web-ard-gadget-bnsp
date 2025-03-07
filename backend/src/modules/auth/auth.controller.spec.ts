import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto';
import { HttpException, HttpStatus, ValidationPipe } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { plainToInstance } from 'class-transformer';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  let validationPipe: ValidationPipe;

  const mockSignUpResponse = {
    access_token: 'Your access token',
    refresh_token: 'Your refresh token',
  };

  beforeEach(async () => {
    const authServiceMock = {
      signUp: jest.fn().mockResolvedValue(mockSignUpResponse),
    };

    validationPipe = new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    const app: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    }).compile();

    authController = app.get<AuthController>(AuthController);
    authService = app.get<AuthService>(AuthService);
  });

  describe('signUp', () => {
    it('should return success response on successful signup', async () => {
      const signUpDto: SignUpDto = {
        name_business: 'Toko Serba Ada',
        email: 'tokoserbaada@gmail.com',
        phone_number: '08123456789',
        address: 'Jl. Raya, No. 123',
        password: 'password123',
      };

      const mockResponse = {
        status: 'success',
        message: 'Berhasil signup!',
        data: {
          access_token: 'Your access token',
          refresh_token: 'Your refresh token',
        },
      };

      jest.spyOn(authService, 'signUp').mockResolvedValue(mockSignUpResponse);

      const result = await authController.signUp(signUpDto);

      expect(result).toEqual(mockResponse);
      expect(authService.signUp).toHaveBeenCalledWith(signUpDto);
    });

    it('should throw error on failed signup due to taken email', async () => {
      const signUpDto: SignUpDto = {
        name_business: 'Toko Serba Ada',
        email: 'tokoserbaada@gmail.com',
        phone_number: '08123456789',
        address: 'Jl. Raya, No. 123',
        password: 'password123',
      };

      const errorResponse = new HttpException(
        { status: 'FAILED', message: 'Credentials taken', data: null },
        HttpStatus.FORBIDDEN,
      );

      jest.spyOn(authService, 'signUp').mockRejectedValue(errorResponse);

      await expect(authController.signUp(signUpDto)).rejects.toThrowError(
        HttpException,
      );
    });

    it('should throw error if signup data is invalid', async () => {
      const invalidSignUpDto = {
        name_business: '',
        email: 'invalidemail',
        phone_number: '',
        address: '',
        password: '',
      };

      try {
        // Transform and validate DTO
        await validationPipe.transform(
          plainToInstance(SignUpDto, invalidSignUpDto),
          { type: 'body', metatype: SignUpDto },
        );
      } catch (error) {
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        expect(error.getResponse()).toEqual({
          statusCode: HttpStatus.BAD_REQUEST,
          message: [
            'name_business should not be empty',
            'email must be an email',
            'phone_number should not be empty',
            'address should not be empty',
            'password should not be empty',
          ],
          error: 'Bad Request',
        });
      }
    });
  });
});

// import { Test, TestingModule } from '@nestjs/testing';
// import { AuthController } from './auth.controller';
// import { AuthService } from './auth.service';
// import { PrismaService } from '../prisma/prisma.service'; // Path relatif sesuai struktur proyek
// import { SignUpDto } from './dto';
// import { HttpException, HttpStatus } from '@nestjs/common';
// import { CacheModule } from '@nestjs/cache-manager';
//
// // Mock PrismaService
// jest.mock('../prisma/prisma.service', () => ({
//   PrismaService: jest.fn().mockImplementation(() => ({
//     user: {
//       create: jest.fn().mockResolvedValue({
//         id: 1,
//         email: 'tokoserbaada@gmail.com',
//         name_business: 'Toko Serba Ada',
//         phone_number: '08123456789',
//         address: 'Jl. Raya, No. 123',
//       }),
//     },
//   })),
// }));
//
// describe('AuthController', () => {
//   let authController: AuthController;
//   let authService: AuthService;
//
//   beforeEach(async () => {
//     const authServiceMock = {
//       signUp: jest.fn(),
//     };
//
//     const app: TestingModule = await Test.createTestingModule({
//       controllers: [AuthController],
//       imports: [CacheModule.register()],
//       providers: [
//         {
//           provide: AuthService,
//           useValue: authServiceMock,
//         },
//         PrismaService, // PrismaService yang di-mock
//       ],
//     }).compile();
//
//     authController = app.get<AuthController>(AuthController);
//     authService = app.get<AuthService>(AuthService);
//   });
//
//   describe('signUp', () => {
//     it('should return success response on successful signup', async () => {
//       const signUpDto: SignUpDto = {
//         name_business: 'Toko Serba Ada',
//         email: 'tokoserbaada@gmail.com',
//         phone_number: '08123456789',
//         address: 'Jl. Raya, No. 123',
//         password: 'password123',
//       };
//
//       const mockResponse = {
//         access_token: 'some-access-token',
//         refresh_token: 'some-refresh-token',
//       };
//
//       jest.spyOn(authService, 'signUp').mockResolvedValue(mockResponse);
//
//       const result = await authController.signUp(signUpDto);
//
//       expect(result).toEqual(mockResponse);
//       expect(authService.signUp).toHaveBeenCalledWith(signUpDto);
//     });
//
//     it('should throw error on failed signup due to taken email', async () => {
//       const signUpDto: SignUpDto = {
//         name_business: 'Toko Serba Ada',
//         email: 'tokoserbaada@gmail.com',
//         phone_number: '08123456789',
//         address: 'Jl. Raya, No. 123',
//         password: 'password123',
//       };
//
//       const errorResponse = new HttpException(
//         { status: 'FAILED', message: 'Credentials taken', data: null },
//         HttpStatus.FORBIDDEN,
//       );
//
//       jest.spyOn(authService, 'signUp').mockRejectedValue(errorResponse);
//
//       await expect(authController.signUp(signUpDto)).rejects.toThrowError(
//         HttpException,
//       );
//     });
//   });
// });
