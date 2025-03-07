import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SignInDto, SignUpDto } from './dto';
import * as bcrypt from 'bcrypt';
import { Prisma, User } from '@prisma/client';
import { RefreshJwtStrategy } from './strategy/refresh.jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(signInDto: SignInDto): Promise<any> {
    const user = await this.usersService.findOne(signInDto.email);
    if (user && bcrypt.compareSync(signInDto.password, user.password)) {
      delete user.password;
      return user;
    }
    return null;
  }

  async signInV2(user: User) {
    const payload = { sub: user.id, email: user.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
      refresh_token: await this.jwtService.signAsync(payload, {
        secret: `${process.env.JWT_REFRESH_TOKEN_SECRET}`,
        expiresIn: '7d',
      }),
    };
  }

  async signUp(signUpDto: SignUpDto) {
    // Generate the password hash
    const hashPassword = await bcrypt.hash(signUpDto.password, 10);

    try {
      const user = await this.usersService.create({
        name_business: signUpDto.name_business,
        email: signUpDto.email,
        phone_number: signUpDto.phone_number,
        address: signUpDto.address,
        password: hashPassword,
      });

      const payload = { sub: user.id, email: user.email };
      return {
        access_token: await this.jwtService.signAsync(payload),
        refresh_token: await this.jwtService.signAsync(payload, {
          secret: `${process.env.JWT_REFRESH_TOKEN_SECRET}`,
          expiresIn: '7d',
        }),
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const target = error.meta?.target || []; // Mendapatkan field unik yang dilanggar
          if (Array.isArray(target)) {
            if (target.includes('email')) {
              throw new ForbiddenException(
                `Credential with email ${signUpDto.email} is taken`,
              );
            } else if (target.includes('phone_number')) {
              throw new ForbiddenException(
                `Credential with phone number ${signUpDto.phone_number} is taken`,
              );
            }
          }
          throw new ForbiddenException('Credentials taken');
        }
      }

      throw error;
    }
  }

  @UseGuards(RefreshJwtStrategy)
  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      });
      const newAccessToken = this.jwtService.sign({
        username: payload.username,
        sub: payload.sub,
      });
      return { access_token: newAccessToken };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async signInV1(loginDto: SignInDto): Promise<{ access_token: string }> {
    const user = await this.validateUser(loginDto);
    if (!user) {
      throw new ForbiddenException('Invalid email or password');
    }

    // create and sign token
    const payload = { sub: user.id, email: user.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
