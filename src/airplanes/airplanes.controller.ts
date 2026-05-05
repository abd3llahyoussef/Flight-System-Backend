import { Controller, Get } from '@nestjs/common';
import { AirplanesService } from './airplanes.service';

@Controller('airplanes')
export class AirplanesController {
  constructor(private airplanesService: AirplanesService) {}

  @Get()
  async findAll() {
    return this.airplanesService.findAll();
  }
}
