import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: {
    id: number;
    email: string;
  };
}

@Controller('reservations')
export class ReservationsController {
  constructor(private reservationsService: ReservationsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(@Req() req: RequestWithUser, @Body() body: any) {
    return this.reservationsService.create(req.user.id, body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('my-reservations')
  async getMy(@Req() req: RequestWithUser) {
    return this.reservationsService.getByUser(req.user.id);
  }

  @Get('lookup')
  async lookup(@Query('ref') ref: string, @Query('lastName') lastName: string) {
    return this.reservationsService.lookup(ref, lastName);
  }
}
