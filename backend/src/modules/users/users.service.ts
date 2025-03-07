import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(user: {
    name_business: string;
    email: string;
    phone_number: string;
    address: string;
    password: string;
  }): Promise<User> {
    return this.prisma.user.create({ data: user });
  }

  async findOne(email: string): Promise<User | undefined> {
    return this.prisma.user.findUnique({ where: { email: email } });
  }
}
