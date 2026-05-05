import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from '../stripe/stripe.service';
export declare class TicketsService {
    private prisma;
    private stripeService;
    constructor(prisma: PrismaService, stripeService: StripeService);
    createBooking(userId: number, flightId: number, seatNumber: string, seatClass: string, passport?: string, nationality?: string, dependants?: any[]): Promise<{
        createdAt: Date;
        updatedAt: Date;
        id: number;
        status: import("@prisma/client").$Enums.TicketStatus;
        seatNumber: string;
        seatClass: import("@prisma/client").$Enums.SeatClass;
        price: number;
        paymentId: string | null;
        flightId: number;
        userId: number;
    }>;
    confirmPayment(paymentId: string): Promise<{
        createdAt: Date;
        updatedAt: Date;
        id: number;
        status: import("@prisma/client").$Enums.TicketStatus;
        seatNumber: string;
        seatClass: import("@prisma/client").$Enums.SeatClass;
        price: number;
        paymentId: string | null;
        flightId: number;
        userId: number;
    }>;
    cancelBooking(userId: number, ticketId: number): Promise<{
        createdAt: Date;
        updatedAt: Date;
        id: number;
        status: import("@prisma/client").$Enums.TicketStatus;
        seatNumber: string;
        seatClass: import("@prisma/client").$Enums.SeatClass;
        price: number;
        paymentId: string | null;
        flightId: number;
        userId: number;
    }>;
    private formatTicket;
    getUserTickets(userId: number): Promise<{
        id: any;
        ref: any;
        status: string;
        airline: any;
        code: any;
        from: any;
        to: any;
        date: any;
        depart: any;
        arrive: any;
        seat: any;
        gate: string;
        price: any;
        seatClass: any;
        dependants: any;
    }[]>;
    lookupByReference(ref: string, lastName: string): Promise<{
        id: any;
        ref: any;
        status: string;
        airline: any;
        code: any;
        from: any;
        to: any;
        date: any;
        depart: any;
        arrive: any;
        seat: any;
        gate: string;
        price: any;
        seatClass: any;
        dependants: any;
    }>;
    getReservedSeats(flightId: number): Promise<string[]>;
}
