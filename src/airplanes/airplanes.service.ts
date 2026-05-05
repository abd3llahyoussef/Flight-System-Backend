import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AirplanesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.airplane.findMany();
  }
}
