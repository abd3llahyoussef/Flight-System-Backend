import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { AirportsService } from './airports.service';

@Controller('airports')
export class AirportsController {
  constructor(private airportsService: AirportsService) {}

  @Get()
  async findAll() {
    return this.airportsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.airportsService.findOne(id);
  }
}
