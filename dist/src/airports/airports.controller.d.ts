import { AirportsService } from './airports.service';
export declare class AirportsController {
    private airportsService;
    constructor(airportsService: AirportsService);
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
