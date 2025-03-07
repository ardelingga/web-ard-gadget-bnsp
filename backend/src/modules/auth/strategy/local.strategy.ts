import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { ResponseApiStatus, ResponseDto } from '../../../common/utils/response.dto';
import { SignInDto } from '../dto';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }

  async validate(email: string, password: string) {
    const signInDto: SignInDto = { email, password };
    const signInDtoInstance = plainToClass(SignInDto, signInDto);

    // validasi
    const errors = await validate(signInDtoInstance);
    if (errors.length > 0) {
      const errorMessages = errors.map((error) => {
        return Object.values(error.constraints)[0];
      });
      throw new HttpException(
        {
          status: ResponseApiStatus.FAILED,
          message: 'Validation failed',
          errors: errorMessages,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.authService.validateUser({ email, password });
    if (!user) {
      throw new HttpException(
        new ResponseDto(
          ResponseApiStatus.FAILED,
          'Invalid email or password',
          null,
        ),
        HttpStatus.BAD_REQUEST,
      );
    }
    return user;
  }
}
