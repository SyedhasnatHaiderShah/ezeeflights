import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from '../dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async login(dto: LoginDto) {
    // TODO: replace with user repository lookup + bcrypt compare
    if (!dto.email || !dto.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: 'mock-user-id', email: dto.email, roles: ['customer'] };
    return {
      accessToken: await this.jwtService.signAsync(payload),
      tokenType: 'Bearer',
      expiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
    };
  }
}
