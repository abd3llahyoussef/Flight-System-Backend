import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
export declare class AuthService {
    private usersService;
    private jwtService;
    private mailService;
    constructor(usersService: UsersService, jwtService: JwtService, mailService: MailService);
    validateUser(email: string, pass: string): Promise<any>;
    login(user: any): Promise<{
        access_token: string;
        user: any;
    }>;
    register(userData: any): Promise<{
        message: string;
        email: string;
    }>;
    verifyEmail(token: string): Promise<{
        message: string;
    }>;
    googleLogin(req: any): Promise<{
        access_token: string;
        user: any;
    }>;
}
