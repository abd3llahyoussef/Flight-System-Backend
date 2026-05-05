import { FlightsService } from './flights.service';
export declare class FlightsController {
    private flightsService;
    constructor(flightsService: FlightsService);
    findAll(query: any): Promise<{
        id: any;
        airline: any;
        code: any;
        depart: any;
        arrive: any;
        departDate: any;
        arriveDate: any;
        duration: string;
        stops: any;
        price: any;
        aircraft: any;
        from: any;
        to: any;
    }[]>;
    findOne(id: number): Promise<({
        airplane: {
            createdAt: Date;
            updatedAt: Date;
            id: number;
            model: string;
            totalSeats: number;
            economySeats: number;
            businessSeats: number;
        };
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
        tickets: {
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
        }[];
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
    }) | null>;
    create(data: any): Promise<{
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
    }>;
}
