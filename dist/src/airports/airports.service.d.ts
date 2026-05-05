import { PrismaService } from '../prisma/prisma.service';
export declare class AirportsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        code: string;
        name: string;
        city: string;
        country: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }[]>;
    findOne(id: number): Promise<{
        code: string;
        name: string;
        city: string;
        country: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    } | null>;
}
