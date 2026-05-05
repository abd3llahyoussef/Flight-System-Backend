import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FlightsService {
  constructor(private prisma: PrismaService) { }

  private formatFlight(f: any) {
    const durationMs = f.arrivalTime.getTime() - f.departureTime.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

    return {
      id: f.id.toString(),
      airline: f.airline,
      code: f.flightNumber,
      depart: f.departureTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      arrive: f.arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      departDate: f.departureTime.toLocaleDateString([], { month: 'numeric', day: 'numeric' }),
      arriveDate: f.arrivalTime.toLocaleDateString([], { month: 'numeric', day: 'numeric' }),
      duration: `${hours}h ${minutes}m`,
      stops: f.stops,
      price: f.basePrice,
      aircraft: f.airplane.model,
      from: f.departureAirport.code,
      to: f.arrivalAirport.code,
    };
  }

  async findAll(query: any) {
    const { from, to, date } = query;
    const where: any = {};

    if (from) {
      where.departureAirport = { code: from };
    }
    if (to) {
      where.arrivalAirport = { code: to };
    }
    if (date) {
      const searchDate = new Date(date);
      where.departureTime = {
        gte: new Date(searchDate.setHours(0, 0, 0, 0)),
        //lt: new Date(searchDate.setHours(23, 59, 59, 999)),
      };
    }

    const flights = await this.prisma.flight.findMany({
      where,
      include: {
        departureAirport: true,
        arrivalAirport: true,
        airplane: true,
      },
    });

    return flights.map(f => this.formatFlight(f));
  }

  async findMany(id: number) {
    return this.prisma.flight.findFirst({
      where: { id },
      include: {
        departureAirport: true,
        arrivalAirport: true,
        airplane: true,
        tickets: {
          where: { status: { in: ['BOOKED', 'PENDING_PAYMENT'] } },
        },
      },
    });
  }

  async create(data: any) {
    try {
      const flight = await this.prisma.flight.create({
        data: {
          flightNumber: data.flightNumber,
          airline: data.airline,
          departureAirportId: parseInt(data.departureAirportId),
          arrivalAirportId: parseInt(data.arrivalAirportId),
          airplaneId: parseInt(data.airplaneId),
          departureTime: new Date(data.departureTime),
          arrivalTime: new Date(data.arrivalTime),
          basePrice: parseFloat(data.basePrice),
          stops: data.stops ? parseInt(data.stops) : 0,
        }
      });
      return flight;
    } catch (e) {
      console.error("Create flight error:", e);
      throw e;
    }
  }
}
