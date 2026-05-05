import { Module } from '@nestjs/common';
import { AirplanesController } from './airplanes.controller';
import { AirplanesService } from './airplanes.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AirplanesController],
  providers: [AirplanesService],
})
export class AirplanesModule {}

