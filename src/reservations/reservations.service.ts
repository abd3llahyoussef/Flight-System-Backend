import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReservationsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, data: any) {
    const reference = `AW-${Math.floor(Math.random() * 900000) + 100000}`;
    
    return this.prisma.reservation.create({
      data: {
        reference,
        userId,
        flightId: Number(data.flightId),
        seatClass: data.seatClass || 'ECONOMY',
        totalPrice: Number(data.totalPrice),
        status: 'HELD',
        leadFirstName: data.leadFirstName,
        leadLastName: data.leadLastName,
        leadEmail: data.leadEmail,
        leadPhone: data.leadPhone,
        passengers: data.passengers || [],
      },
      include: {
        flight: {
          include: {
            departureAirport: true,
            arrivalAirport: true,
          }
        }
      }
    });
  }

  async getByUser(userId: number) {
    const reservations = await this.prisma.reservation.findMany({
      where: { userId },
      include: {
        flight: {
          include: {
            departureAirport: true,
            arrivalAirport: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
    return reservations.map(r => this.formatReservation(r));
  }

  async lookup(ref: string, lastName: string) {
    const reservation = await this.prisma.reservation.findFirst({
      where: {
        reference: ref,
        leadLastName: {
          equals: lastName,
          mode: 'insensitive',
        },
      },
      include: {
        flight: {
          include: {
            departureAirport: true,
            arrivalAirport: true,
          }
        }
      },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    return this.formatReservation(reservation);
  }

  private formatReservation(r: any) {
    return {
      id: r.id,
      ref: r.reference,
      status: 'Pending', // Show as Pending in UI
      airline: r.flight.airline,
      code: r.flight.flightNumber,
      from: r.flight.departureAirport.code,
      to: r.flight.arrivalAirport.code,
      date: r.flight.departureTime.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      depart: r.flight.departureTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      arrive: r.flight.arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      seat: 'Held',
      gate: '—',
      price: r.totalPrice,
      seatClass: r.seatClass,
      dependants: r.passengers || [],
      isReservation: true, // Flag to distinguish from Ticket
    };
  }
}
