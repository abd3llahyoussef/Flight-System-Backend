import { AdminService } from './admin.service';
export declare class AdminController {
    private adminService;
    constructor(adminService: AdminService);
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
