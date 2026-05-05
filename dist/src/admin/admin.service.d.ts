import { PrismaService } from '../prisma/prisma.service';
export declare class AdminService {
    private prisma;
    constructor(prisma: PrismaService);
    getStats(): Promise<{
        kpis: {
            bookingsToday: number;
            revenue24h: number;
            activeTravelers: number;
            cancellations: number;
        };
        flights: {
            code: string;
            route: string;
            dep: string;
            status: string;
            load: number;
        }[];
        bookings: {
            ref: string;
            name: string;
            route: string;
            amount: number;
            status: string;
        }[];
    }>;
}
