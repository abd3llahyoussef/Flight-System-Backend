import { TicketsService } from './tickets.service';
import { Request } from 'express';
interface RequestWithUser extends Request {
    user: {
        id: number;
        email: string;
    };
}
export declare class TicketsController {
    private ticketsService;
    constructor(ticketsService: TicketsService);
    book(req: RequestWithUser, body: any): Promise<any>;
    getMyTickets(req: RequestWithUser): Promise<{
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
    cancel(req: RequestWithUser, id: number): Promise<{
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
    lookup(ref: string, lastName: string): Promise<{
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
    getReservedSeats(flightId: number): Promise<any[]>;
    handleWebhook(body: any): Promise<{
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
    } | undefined>;
}
export {};
