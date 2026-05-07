import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 1. KPIs
    const bookingsToday = await this.prisma.ticket.count({
      where: {
        createdAt: { gte: today, lt: tomorrow },
        status: { in: ['BOOKED', 'PENDING_PAYMENT'] }
      }
    });

    const revenueAggr = await this.prisma.ticket.aggregate({
      _sum: { price: true },
      where: {
        createdAt: { gte: today, lt: tomorrow },
        status: { in: ['BOOKED', 'PENDING_PAYMENT'] }
      }
    });
    const revenue24h = revenueAggr._sum.price || 0;

    // Active travelers (unique users with tickets)
    // Note: Prisma groupBy doesn't directly return count of distinct groups, so we count the results.
    const activeTravelersAggr = await this.prisma.ticket.groupBy({
      by: ['userId'],
      where: {
        status: { in: ['BOOKED', 'PENDING_PAYMENT'] }
      }
    });
    const activeTravelers = activeTravelersAggr.length;

    const cancellations = await this.prisma.ticket.count({
      where: {
        createdAt: { gte: today, lt: tomorrow },
        status: 'CANCELLED'
      }
    });

    // 2. Flights (today's flights)
    const flightsRaw = await this.prisma.flight.findMany({
      where: {
        departureTime: {
          gte: today,
          lt: tomorrow
        }
      },
      include: {
        departureAirport: true,
        arrivalAirport: true,
        airplane: true,
        tickets: {
          where: { status: { in: ['BOOKED', 'PENDING_PAYMENT'] } }
        }
      },
      take: 10,
      orderBy: { departureTime: 'asc' }
    });

    const flightStatusMap: Record<string, string> = {
      SCHEDULED: 'Scheduled',
      DELAYED: 'Delayed',
      DEPARTED: 'On time', // simplify for UI
      ARRIVED: 'Arrived',
      CANCELLED: 'Cancelled'
    };

    const flights = flightsRaw.map((f: any) => {
      const load = f.airplane && f.airplane.totalSeats > 0 
        ? Math.round((f.tickets.length / f.airplane.totalSeats) * 100) 
        : 0;
      return {
        code: f.flightNumber,
        route: `${f.departureAirport.code} → ${f.arrivalAirport.code}`,
        dep: f.departureTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        status: flightStatusMap[f.status] || 'Scheduled',
        load: load
      };
    });

    // 3. Recent Bookings
    const recentTickets = await this.prisma.ticket.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
        flight: {
          include: {
            departureAirport: true,
            arrivalAirport: true
          }
        }
      }
    });

    const bookings = recentTickets.map((t: any) => {
      const ref = t.paymentId || `AW-${t.id + 100000}`;
      return {
        ref,
        name: t.user.name,
        route: `${t.flight.departureAirport.code} → ${t.flight.arrivalAirport.code}`,
        amount: t.price,
        status: t.status === 'BOOKED' || t.status === 'PENDING_PAYMENT' ? 'Confirmed' : (t.status === 'CANCELLED' ? 'Refunded' : 'Pending')
      };
    });

    return {
      kpis: {
        bookingsToday,
        revenue24h,
        activeTravelers,
        cancellations
      },
      flights,
      bookings
    };
  }
}
