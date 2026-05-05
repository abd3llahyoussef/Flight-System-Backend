import { AirplanesService } from './airplanes.service';
export declare class AirplanesController {
    private airplanesService;
    constructor(airplanesService: AirplanesService);
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
