import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from '../stripe/stripe.service';

@Injectable()
export class TicketsService {
  constructor(
    private prisma: PrismaService,
    private stripeService: StripeService,
  ) { }

  async createBooking(
    userId: number,
    flightId: number,
    seatNumber: string,
    seatClass: string,
    passport?: string,
    nationality?: string,
    dependants: any[] = [],
  ) {
    try {
      return await this.prisma.$transaction(async (tx: any) => {
        // 1. Check if flight exists
        const flight = await tx.flight.findUnique({
          where: { id: flightId },
          include: { airplane: true },
        });

        if (!flight) throw new NotFoundException('Flight not found');

        // 2. Validate seat classes and availability
        const allSeats = [seatNumber, ...dependants.map((d) => d.seatNumber)];

        // Seat class enforcement (Row based)
        // Row 1: FIRST, Row 2: BUSINESS, Row 3: PREMIUM, Row 4-14: ECONOMY
        for (const s of allSeats) {
          const row = parseInt(s);
          if (seatClass === 'FIRST' && row !== 1) throw new BadRequestException(`Seat ${s} is not in First Class`);
          if (seatClass === 'BUSINESS' && row > 2) throw new BadRequestException(`Seat ${s} is not in Business Class`);
          if (seatClass === 'PREMIUM' && row > 3) throw new BadRequestException(`Seat ${s} is not in Premium Class`);
          if (seatClass === 'ECONOMY' && row < 4) throw new BadRequestException(`Seat ${s} is not in Economy Class`);
        }

        // Check if any seat is already taken in Ticket table
        const existingTickets = await tx.ticket.findFirst({
          where: {
            flightId,
            seatNumber: { in: allSeats },
            status: { in: ['BOOKED', 'PENDING_PAYMENT'] },
          },
        });
        if (existingTickets) throw new BadRequestException('One or more seats are already taken');

        // Check if any seat is already taken in Dependant table
        const existingDependants = await tx.dependant.findFirst({
          where: {
            ticket: {
              flightId,
              status: { in: ['BOOKED', 'PENDING_PAYMENT'] }
            },
            seatNumber: { in: allSeats },
          },
        });
        if (existingDependants) throw new BadRequestException('One or more seats are already taken');

        // Update User passport and nationality
        if (passport || nationality) {
          await tx.user.update({
            where: { id: userId },
            data: {
              ...(passport && { passport }),
              ...(nationality && { nationality }),
            },
          });
        }

        // 3. Create ticket in PENDING_PAYMENT status
        const multiplier =
          seatClass === 'FIRST' ? 3.2 :
            seatClass === 'BUSINESS' ? 2.4 :
              seatClass === 'PREMIUM' ? 1.5 : 1;

        const unitPrice = flight.basePrice * multiplier;
        const totalPrice = unitPrice * (1 + dependants.length);

        const ticket = await tx.ticket.create({
          data: {
            userId,
            flightId,
            seatNumber,
            seatClass: seatClass as any,
            price: totalPrice,
            status: 'PENDING_PAYMENT',
          },
        });

        // 4. Create dependants
        if (dependants.length > 0) {
          await tx.dependant.createMany({
            data: dependants.map((d) => ({
              userId,
              ticketId: ticket.id,
              name: d.name,
              email: d.email,
              seatNumber: d.seatNumber,
              dob: d.dob,
              gender: d.gender,
              nationality: d.nationality,
              passport: d.passport,
            })),
          });
        }

        // 5. Create Stripe Payment Intent
        const paymentIntent = await this.stripeService.createPaymentIntent(totalPrice);

        // 6. Update ticket with payment intent ID
        return tx.ticket.update({
          where: { id: ticket.id },
          data: { paymentId: paymentIntent.id },
        });
      });
    } catch (error) {
      console.error('Booking service error:', error);
      throw error;
    }
  }

  async confirmPayment(paymentId: string) {
    const ticket = await this.prisma.ticket.findFirst({
      where: { paymentId },
    });

    if (!ticket) throw new NotFoundException('Ticket not found');

    return this.prisma.ticket.update({
      where: { id: ticket.id },
      data: { status: 'BOOKED' },
    });
  }

  async cancelBooking(userId: number, ticketId: number) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket || ticket.userId !== userId) {
      throw new NotFoundException('Ticket not found or unauthorized');
    }

    if (ticket.status === 'CANCELLED') {
      throw new BadRequestException('Ticket already cancelled');
    }

    return this.prisma.ticket.update({
      where: { id: ticketId },
      data: { status: 'CANCELLED' },
    });
  }

  private formatTicket(t: any) {
    return {
      id: t.id,
      ref: t.paymentId || `AW-${t.id + 100000}`,
      status: t.status === 'BOOKED' ? 'Upcoming' : t.status === 'PENDING_PAYMENT' ? 'Pending' : 'Past',
      airline: t.flight.airline,
      code: t.flight.flightNumber,
      from: t.flight.departureAirport.code,
      to: t.flight.arrivalAirport.code,
      date: t.flight.departureTime.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      depart: t.flight.departureTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      arrive: t.flight.arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      seat: t.seatNumber,
      gate: '—',
      price: t.price,
      seatClass: t.seatClass,
      dependants: t.dependants || [],
    };
  }

  async getUserTickets(userId: number) {
    const tickets = await this.prisma.ticket.findMany({
      where: { userId },
      include: {
        flight: {
          include: {
            departureAirport: true,
            arrivalAirport: true,
          },
        },
        dependants: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return tickets.map((t: any) => this.formatTicket(t));
  }

  async lookupByReference(ref: string, lastName: string) {
    // Try finding by paymentId first
    let ticket = await this.prisma.ticket.findFirst({
      where: { paymentId: ref },
      include: {
        user: true,
        flight: {
          include: {
            departureAirport: true,
            arrivalAirport: true,
            airplane: true,
          },
        },
        dependants: true,
      },
    });

    // If not found by paymentId, try computed ref format AW-{id+100000}
    if (!ticket && ref.startsWith('AW-')) {
      const idFromRef = parseInt(ref.replace('AW-', '')) - 100000;
      if (!isNaN(idFromRef) && idFromRef > 0) {
        ticket = await this.prisma.ticket.findFirst({
          where: { id: idFromRef, paymentId: null },
          include: {
            user: true,
            flight: {
              include: {
                departureAirport: true,
                arrivalAirport: true,
                airplane: true,
              },
            },
            dependants: true,
          },
        });
      }
    }

    if (!ticket) {
      throw new NotFoundException('Booking not found');
    }

    // Verify last name matches (case-insensitive, checks if full name contains it)
    const nameMatch = ticket.user.name
      .toLowerCase()
      .includes(lastName.toLowerCase());

    if (!nameMatch) {
      throw new NotFoundException('Booking not found');
    }

    return this.formatTicket(ticket);
  }

  async getReservedSeats(flightId: number) {
    const tickets = await this.prisma.ticket.findMany({
      where: {
        flightId,
        status: { in: ['BOOKED', 'PENDING_PAYMENT'] },
      },
      include: {
        dependants: {
          select: { seatNumber: true },
        },
      },
    });

    const mainSeats = tickets.map((t: any) => t.seatNumber);
    const dependantSeats = tickets.flatMap((t: any) =>
      t.dependants.map((d: any) => d.seatNumber),
    );

    return [...mainSeats, ...dependantSeats];
  }
}
