import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { scryptSync, randomBytes, timingSafeEqual } from 'crypto';
import { PostgresClient } from '../../../database/postgres.client';
import { AppEventBus } from '../../../common/events/app-event-bus.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';

interface UserRow {
  id: string;
  email: string;
  passwordHash: string | null;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly db: PostgresClient,
    private readonly events: AppEventBus,
  ) {}

  private hashPassword(password: string): string {
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
  }

  private verifyPassword(password: string, storedHash: string): boolean {
    const [salt, hash] = storedHash.split(':');
    const hashedBuffer = Buffer.from(hash, 'hex');
    const suppliedBuffer = scryptSync(password, salt, 64);
    return timingSafeEqual(hashedBuffer, suppliedBuffer);
  }

  async register(dto: RegisterDto) {
    const existing = await this.db.queryOne<{ id: string }>('SELECT id FROM users WHERE email = $1 LIMIT 1', [dto.email]);
    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const user = await this.db.queryOne<{ id: string; email: string }>(
      `INSERT INTO users (email, password_hash, first_name, last_name)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email`,
      [dto.email, this.hashPassword(dto.password), dto.firstName ?? null, dto.lastName ?? null],
    );

    if (!user) {
      throw new UnauthorizedException('Failed to create user');
    }

    const token = await this.issueToken(user.id, user.email);
    this.events.emit('user.registered', { userId: user.id, email: user.email });
    return token;
  }

  async login(dto: LoginDto) {
    const user = await this.db.queryOne<UserRow>(
      `SELECT id, email, password_hash as "passwordHash"
       FROM users
       WHERE email = $1
       LIMIT 1`,
      [dto.email],
    );

    if (!user?.passwordHash || !this.verifyPassword(dto.password, user.passwordHash)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = await this.issueToken(user.id, user.email);
    this.events.emit('user.registered', { userId: user.id, email: user.email });
    return token;
  }

  async oauthLogin(email: string) {
    let user = await this.db.queryOne<{ id: string; email: string }>('SELECT id, email FROM users WHERE email = $1 LIMIT 1', [email]);

    if (!user) {
      user = await this.db.queryOne<{ id: string; email: string }>(
        `INSERT INTO users (email, oauth_provider)
         VALUES ($1, 'google')
         RETURNING id, email`,
        [email],
      );
    }

    if (!user) {
      throw new UnauthorizedException('OAuth login failed');
    }

    const token = await this.issueToken(user.id, user.email);
    this.events.emit('user.registered', { userId: user.id, email: user.email });
    return token;
  }

  private async issueToken(userId: string, email: string) {
    const payload = { sub: userId, email, roles: ['customer'] };
    return {
      accessToken: await this.jwtService.signAsync(payload),
      tokenType: 'Bearer',
      expiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
    };
  }
}
