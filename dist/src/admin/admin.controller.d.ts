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
            code: any;
            route: string;
            dep: any;
            status: string;
            load: number;
        }[];
        bookings: {
            ref: any;
            name: any;
            route: string;
            amount: any;
            status: string;
        }[];
    }>;
}
