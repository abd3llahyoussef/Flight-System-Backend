import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: {
    id: number;
    email: string;
  };
}

@Controller('tickets')
export class TicketsController {
  constructor(private ticketsService: TicketsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('book')
  async book(@Req() req: RequestWithUser, @Body() body: any) {
    return this.ticketsService.createBooking(
      req.user.id,
      Number(body.flightId),
      body.seatNumber,
      body.seatClass,
      body.passport,
      body.nationality,
      body.dependants,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('my-tickets')
  async getMyTickets(@Req() req: RequestWithUser) {
    return this.ticketsService.getUserTickets(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/cancel')
  async cancel(
    @Req() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.ticketsService.cancelBooking(req.user.id, id);
  }

  @Get('lookup')
  async lookup(@Query('ref') ref: string, @Query('lastName') lastName: string) {
    return this.ticketsService.lookupByReference(ref, lastName);
  }

  @Get('flight/:flightId/reserved-seats')
  async getReservedSeats(@Param('flightId', ParseIntPipe) flightId: number) {
    return this.ticketsService.getReservedSeats(flightId);
  }

  @Post('webhook')
  async handleWebhook(@Body() body: any) {
    // In a real app, you'd use StripeService.constructEvent here with the raw body
    // For simplicity, we'll assume the client confirms payment via a redirect/success callback
    if (body.type === 'payment_intent.succeeded') {
      return this.ticketsService.confirmPayment(body.data.object.id);
    }
  }
}
