import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AirportsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.airport.findMany();
  }

  async findOne(id: number) {
    return this.prisma.airport.findUnique({ where: { id } });
  }
}
