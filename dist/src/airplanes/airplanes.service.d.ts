import { PrismaService } from '../prisma/prisma.service';
export declare class AirplanesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        createdAt: Date;
        updatedAt: Date;
        id: number;
        model: string;
        totalSeats: number;
        economySeats: number;
        businessSeats: number;
    }[]>;
}
