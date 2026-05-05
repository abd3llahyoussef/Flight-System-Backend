import { Controller, Get, Param, Query, ParseIntPipe, Post, Body, UseGuards } from '@nestjs/common';
import { FlightsService } from './flights.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('flights')
export class FlightsController {
  constructor(private flightsService: FlightsService) { }

  @Get()
  async findAll(@Query() query: any) {
    return this.flightsService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.flightsService.findMany(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(@Body() data: any) {
    return this.flightsService.create(data);
  }
}
