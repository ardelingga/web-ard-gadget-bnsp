import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Put,
  Request,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiHeader,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignInDto, SignUpDto } from './dto';
import { LocalAuthGuard } from '../../common/guards/local.guard';
import { JwtGuard } from '../../common/guards/jwt.guard';
import {
  loginFailedResponse,
  loginSuccessResponse,
} from './swagger/login-swagger-response-docs';
import {
  ResponseApiStatus,
  ResponseDto,
} from '../../common/utils/response.dto';
import {
  signupFailedResponse,
  signupSuccessResponse,
} from './swagger/register-swagger-response-docs';
import {
  refreshTokenFailedResponse,
  refreshTokenRequestBody,
  refreshTokenSuccessResponse,
} from './swagger/refresh-swagger-response-docs';
import {
  profileAuthorizationHeader,
  profileFailedResponse,
  profileSuccessResponse,
} from './swagger/profile-swagger-response-docs';
import { UserCacheInterceptor } from '../../common/interceptors/user-cache.interceptor';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signIn')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: SignInDto })
  @ApiResponse(loginSuccessResponse())
  @ApiResponse(loginFailedResponse())
  async signIn(@Request() req) {
    try {
      const signIn = await this.authService.signInV2(req.user);
      return new ResponseDto(
        ResponseApiStatus.SUCCESS,
        'Berhasil signin!',
        signIn,
      );
    } catch (error) {
      throw new HttpException(
        new ResponseDto(ResponseApiStatus.SUCCESS, error.message, null),
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('signUp')
  @ApiBody({ type: SignUpDto })
  @ApiResponse(signupSuccessResponse())
  @ApiResponse(signupFailedResponse())
  async signUp(@Body() signUpDto: SignUpDto) {
    try {
      const signUp = await this.authService.signUp(signUpDto);
      return new ResponseDto(
        ResponseApiStatus.SUCCESS,
        'Berhasil signup!',
        signUp,
      );
    } catch (error) {
      throw new HttpException(
        new ResponseDto(ResponseApiStatus.FAILED, error.message, null),
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('profile')
  @UseGuards(JwtGuard)
  @UseInterceptors(UserCacheInterceptor)
  @ApiBearerAuth('Authorization')
  @ApiHeader(profileAuthorizationHeader())
  @ApiResponse(profileSuccessResponse())
  @ApiResponse(profileFailedResponse())
  getProfile(@Request() req) {
    return new ResponseDto(
      ResponseApiStatus.SUCCESS,
      'Profile berhasil diambil',
      req.user,
    );
  }

  @Put('refresh')
  @ApiBody(refreshTokenRequestBody())
  @ApiResponse(refreshTokenSuccessResponse())
  @ApiResponse(refreshTokenFailedResponse())
  async refreshToken(@Body() refreshTokenDto: { refreshToken: string }) {
    try {
      const tokens = await this.authService.refreshToken(
        refreshTokenDto.refreshToken,
      );
      return new ResponseDto(
        ResponseApiStatus.SUCCESS,
        'Token berhasil diperbarui',
        tokens,
      );
    } catch {
      throw new HttpException(
        new ResponseDto(
          ResponseApiStatus.FAILED,
          'Invalid refresh token',
          null,
        ),
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
