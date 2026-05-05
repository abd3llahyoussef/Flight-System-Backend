import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) { }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne({ email });
    if (!user) {
      return null;
    }
    if (!user.password) {
      return null;
    }

    const isMatch = await bcrypt.compare(pass, user.password);

    if (isMatch) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async register(userData: any) {
    const existingUser = await this.usersService.findOne({
      email: userData.email,
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = await this.usersService.create({
      ...userData,
      password: hashedPassword,
      isVerified: true,
    });

    return {
      message: 'Registration successful. You can now log in.',
      email: user.email,
    };
  }

  async verifyEmail(token: string) {
    const user = await this.usersService.findOneByVerificationToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired verification token');
    }

    await this.usersService.update(user.id, {
      isVerified: true,
      verificationToken: null,
    });

    return { message: 'Email verified successfully. You can now log in.' };
  }

  async googleLogin(req: any) {
    if (!req.user) {
      throw new UnauthorizedException('No user from google');
    }

    let user = await this.usersService.findOne({ email: req.user.email });

    if (!user) {
      user = await this.usersService.create({
        email: req.user.email,
        name: `${req.user.firstName} ${req.user.lastName}`,
        googleId: req.user.googleId,
        isVerified: true,
      });
    }

    return this.login(user);
  }
}
