import { PrismaService } from '../prisma/prisma.service';
export declare class ReservationsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: number, data: any): Promise<{
        flight: {
            departureAirport: {
                code: string;
                name: string;
                city: string;
                country: string;
                createdAt: Date;
                updatedAt: Date;
                id: number;
            };
            arrivalAirport: {
                code: string;
                name: string;
                city: string;
                country: string;
                createdAt: Date;
                updatedAt: Date;
                id: number;
            };
        } & {
            createdAt: Date;
            updatedAt: Date;
            id: number;
            flightNumber: string;
            airline: string;
            stops: number;
            departureTime: Date;
            arrivalTime: Date;
            basePrice: number;
            status: import("@prisma/client").$Enums.FlightStatus;
            departureAirportId: number;
            arrivalAirportId: number;
            airplaneId: number;
        };
    } & {
        createdAt: Date;
        updatedAt: Date;
        id: number;
        status: string;
        seatClass: import("@prisma/client").$Enums.SeatClass;
        flightId: number;
        userId: number;
        reference: string;
        totalPrice: number;
        leadFirstName: string;
        leadLastName: string;
        leadEmail: string;
        leadPhone: string;
        passengers: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    getByUser(userId: number): Promise<{
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
        seat: string;
        gate: string;
        price: any;
        seatClass: any;
        dependants: any;
        isReservation: boolean;
    }[]>;
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
        seat: string;
        gate: string;
        price: any;
        seatClass: any;
        dependants: any;
        isReservation: boolean;
    }>;
    private formatReservation;
}
