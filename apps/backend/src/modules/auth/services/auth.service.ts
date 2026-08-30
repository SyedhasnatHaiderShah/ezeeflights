import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes, randomInt } from 'crypto';
import { Request, Response } from 'express';
import axios from 'axios';
import { generatePlainBackupCodes, hashBackupCode } from '../../../common/crypto/backup-code';
import { decryptField, encryptField } from '../../../common/crypto/field-encryption';
import * as bcrypt from 'bcrypt';
import { hashPassword, isBcryptHash, verifyScryptPassword } from '../../../common/crypto/password';
import { generateRefreshTokenRaw, hashRefreshToken } from '../../../common/crypto/token-hash';
import { Disable2faDto } from '../dto/disable-2fa.dto';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { RegisterDto } from '../dto/register.dto';
import { Verify2faLoginDto } from '../dto/verify-2fa-login.dto';
import { Verify2faSetupDto } from '../dto/verify-2fa-setup.dto';
import { AuthRepository } from '../repositories/auth.repository';
import { TwoFactorService } from './two-factor.service';
// import { NotificationService } from '../../notification/services/notification.service';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { VerifyOtpDto } from '../dto/verify-otp.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';

const REFRESH_COOKIE = 'refresh_token';

function refreshTtlMs(): number {
  const days = Number(process.env.JWT_REFRESH_DAYS ?? '14');
  return (Number.isFinite(days) && days > 0 ? days : 14) * 86400000;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly repo: AuthRepository,
    private readonly twoFactor: TwoFactorService,
    // private readonly notificationService: NotificationService,
  ) {}

  private setRefreshCookie(res: Response | undefined, raw: string): void {
    if (!res) {
      return;
    }
    res.cookie(REFRESH_COOKIE, raw, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: refreshTtlMs(),
      path: '/',
    });
  }

  private clearRefreshCookie(res: Response | undefined): void {
    if (!res) {
      return;
    }
    res.clearCookie(REFRESH_COOKIE, { path: '/' });
  }

  private isAllowedRedirect(urlStr: string): boolean {
    if (!urlStr) return false;
    
    // Allow the mobile app custom URL scheme
    if (urlStr.startsWith('com.ezeeflights.app://')) {
      return true;
    }
    
    try {
      const parsed = new URL(urlStr);
      const hostname = parsed.hostname;
      const origin = parsed.origin;
      
      // In development mode, allow localhost and private network IPs
      if (process.env.NODE_ENV !== 'production') {
        if (
          hostname === 'localhost' ||
          hostname === '127.0.0.1' ||
          /^192\.168\./.test(hostname) ||
          /^10\./.test(hostname) ||
          /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname)
        ) {
          return true;
        }
      }
      
      const allowedOrigins = (process.env.FRONTEND_ORIGIN || '')
        .split(',')
        .map(o => o.trim().replace(/\/$/, ''))
        .filter(Boolean);
        
      if (allowedOrigins.includes('*')) {
        return true;
      }
        
      // Always allow localhost:3000 as a fallback
      allowedOrigins.push('http://localhost:3000');
      
      return allowedOrigins.includes(origin);
    } catch {
      return false;
    }
  }

  getRedirectBase(stateRedirectUri?: string): string {
    if (stateRedirectUri && this.isAllowedRedirect(stateRedirectUri)) {
      return stateRedirectUri;
    }
    
    if (process.env.FRONTEND_OAUTH_REDIRECT && this.isAllowedRedirect(process.env.FRONTEND_OAUTH_REDIRECT) && process.env.FRONTEND_OAUTH_REDIRECT !== '*') {
      return process.env.FRONTEND_OAUTH_REDIRECT;
    }
    
    const origins = (process.env.FRONTEND_ORIGIN || '')
      .split(',')
      .map(o => o.trim())
      .filter(Boolean);
      
    const validOrigins = origins.filter(o => o !== '*');
    if (validOrigins.length > 0) {
      return validOrigins[0];
    }
    
    return 'http://localhost:3000';
  }

  private async resolveOAuthUser(params: {
    email: string;
    provider: string;
    providerUserId: string;
  }): Promise<{ userId: string; email: string }> {
    if (!params.email?.trim()) {
      throw new UnauthorizedException('OAuth profile has no email');
    }

    const linked = await this.repo.findOAuthAccount(params.provider, params.providerUserId);
    if (linked) {
      const email = await this.repo.getUserEmailById(linked.userId);
      if (!email) {
        throw new UnauthorizedException('OAuth user not found');
      }
      await this.repo.updateOAuthProvider(linked.userId, params.provider);
      return { userId: linked.userId, email };
    }

    const byEmail = await this.repo.findUserByEmail(params.email);
    if (byEmail) {
      const inserted = await this.repo.tryInsertOAuthAccount(byEmail.id, params.provider, params.providerUserId);
      if (!inserted) {
        const again = await this.repo.findOAuthAccount(params.provider, params.providerUserId);
        if (!again || again.userId !== byEmail.id) {
          throw new ConflictException('This OAuth account is already linked to another user');
        }
      }
      await this.repo.updateOAuthProvider(byEmail.id, params.provider);
      return { userId: byEmail.id, email: byEmail.email };
    }

    const created = await this.repo.insertOAuthUser(params.email, params.provider);
    if (!created) {
      throw new UnauthorizedException('OAuth signup failed');
    }
    await this.repo.assignRoleBySlug(created.id, 'customer');
    const inserted = await this.repo.tryInsertOAuthAccount(created.id, params.provider, params.providerUserId);
    if (!inserted) {
      throw new ConflictException('OAuth account race condition');
    }
    
    return { userId: created.id, email: created.email };
  }

  /** Bcrypt verification, or scrypt with lazy migration to bcrypt on success. */
  private async verifyCredentialAndMaybeMigrate(
    userId: string,
    plain: string,
    storedHash: string,
  ): Promise<boolean> {
    if (isBcryptHash(storedHash)) {
      return bcrypt.compare(plain, storedHash);
    }
    if (!verifyScryptPassword(plain, storedHash)) {
      return false;
    }
    const newHash = await hashPassword(plain);
    await this.repo.updatePasswordHash(userId, newHash);
    return true;
  }

  private async issueTokenPair(
    userId: string,
    email: string,
    req: Request | undefined,
    res: Response | undefined,
  ) {
    const roles = await this.repo.getRoleSlugsForUser(userId);
    const accessToken = await this.jwtService.signAsync({ sub: userId, email, roles });
    const rawRefresh = generateRefreshTokenRaw();
    const tokenHash = hashRefreshToken(rawRefresh);
    const expiresAt = new Date(Date.now() + refreshTtlMs());
    const inserted = await this.repo.insertRefreshToken({
      userId,
      tokenHash,
      expiresAt,
      ipAddress: req?.ip ? String(req.ip) : null,
      userAgent: req?.headers['user-agent'] ? String(req.headers['user-agent']) : null,
    });
    if (!inserted) {
      throw new InternalServerErrorException('Could not persist session');
    }
    this.setRefreshCookie(res, rawRefresh);
    return {
      accessToken,
      tokenType: 'Bearer' as const,
      expiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
      refreshToken: rawRefresh,
    };
  }

  async register(dto: RegisterDto, req?: Request, res?: Response) {
    const existing = await this.repo.findUserWithPasswordByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const passwordHash = await hashPassword(dto.password);
    const user = await this.repo.insertUser({
      email: dto.email.trim().toLowerCase(),
      passwordHash,
      firstName: dto.firstName ?? null,
      lastName: dto.lastName ?? null,
      phone: dto.phone ?? null,
    });

    if (!user) {
      throw new UnauthorizedException('Failed to create user');
    }

    await this.repo.assignRoleBySlug(user.id, 'customer');

    // this.notificationService.triggerWelcome(user.id, user.email).catch((err) => {
    //   console.error('[AuthService] Welcome email failed to queue:', err);
    // });

    return this.issueTokenPair(user.id, user.email, req, res);
  }

  async login(dto: LoginDto, req?: Request, res?: Response) {
    const user = await this.repo.findUserWithPasswordByEmail(dto.email);
    if (!user?.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const valid = await this.verifyCredentialAndMaybeMigrate(user.id, dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const twoFa = await this.repo.isTwoFactorEnabled(user.id);
    if (twoFa) {
      const pendingToken = await this.jwtService.signAsync(
        { sub: user.id, email: user.email, purpose: '2fa_pending' },
        { expiresIn: '5m' },
      );
      return { requiresTwoFactor: true, pendingToken };
    }

    return this.issueTokenPair(user.id, user.email, req, res);
  }

  async verifyTwoFactorLogin(dto: Verify2faLoginDto, req?: Request, res?: Response) {
    let payload: { sub: string; email: string; purpose?: string };
    try {
      payload = await this.jwtService.verifyAsync(dto.pendingToken);
    } catch {
      throw new UnauthorizedException('Invalid or expired two-factor challenge');
    }
    if (payload.purpose !== '2fa_pending') {
      throw new UnauthorizedException('Invalid two-factor challenge');
    }

    const row = await this.repo.findTwoFactor(payload.sub);
    if (!row?.secretCiphertext) {
      throw new UnauthorizedException('Two-factor authentication is not active');
    }

    const secret = decryptField(row.secretCiphertext);
    const code = dto.code.trim();
    let valid = this.twoFactor.verifyTotp(secret, code);

    if (!valid) {
      const hash = hashBackupCode(code);
      const idx = row.backupCodesJson.findIndex((h) => h === hash);
      if (idx === -1) {
        throw new UnauthorizedException('Invalid two-factor code');
      }
      const remaining = row.backupCodesJson.filter((_, i) => i !== idx);
      await this.repo.removeBackupCode(payload.sub, remaining);
      valid = true;
    }

    if (!valid) {
      throw new UnauthorizedException('Invalid two-factor code');
    }

    return this.issueTokenPair(payload.sub, payload.email, req, res);
  }

  async oauthLogin(
    params: { email: string; provider: string; providerUserId: string },
    req?: Request,
    res?: Response,
  ) {
    const { userId, email } = await this.resolveOAuthUser(params);
    const twoFa = await this.repo.isTwoFactorEnabled(userId);
    if (twoFa) {
      const pendingToken = await this.jwtService.signAsync(
        { sub: userId, email, purpose: '2fa_pending' },
        { expiresIn: '5m' },
      );
      return { requiresTwoFactor: true, pendingToken };
    }
    return this.issueTokenPair(userId, email, req, res);
  }

  async completeGoogleOAuthForBrowserRedirect(params: {
    email: string;
    provider: string;
    providerUserId: string;
    customRedirectUri?: string;
  }): Promise<string> {
    const debugId = `oauth-redirect-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    console.log(`[${debugId}] [AuthService completeGoogleOAuthForBrowserRedirect] Start`, {
      provider: params.provider,
      hasEmail: Boolean(params.email),
      providerUserIdPreview: params.providerUserId?.slice(0, 8) ?? null,
      customRedirectUri: params.customRedirectUri ?? null,
    });
    const { userId } = await this.resolveOAuthUser(params);
    const code = randomBytes(24).toString('hex');
    await this.repo.insertOAuthExchangeCode({
      code,
      userId,
      expiresAt: new Date(Date.now() + 120_000),
    });
    const base = this.getRedirectBase(params.customRedirectUri).replace(/\/$/, '');
    const redirectUrl = base.includes('/auth/callback')
      ? `${base}?code=${encodeURIComponent(code)}`
      : `${base}/auth/callback?code=${encodeURIComponent(code)}`;
    console.log(`[${debugId}] [AuthService completeGoogleOAuthForBrowserRedirect] Redirect ready`, {
      userId,
      codePreview: code.slice(0, 10),
      redirectUrl,
    });
    return redirectUrl;
  }

  async exchangeOAuthCode(dto: { code: string }, req?: Request, res?: Response) {
    const debugId = `oauth-exchange-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    console.log(`[${debugId}] [AuthService exchangeOAuthCode] Incoming`, {
      hasCode: Boolean(dto.code),
      codeLength: dto.code?.length ?? 0,
      codePreview: dto.code?.slice(0, 10) ?? null,
      hasReq: Boolean(req),
      hasRes: Boolean(res),
    });
    const row = await this.repo.consumeOAuthExchangeCode(dto.code);
    if (!row) {
      console.warn(`[${debugId}] [AuthService exchangeOAuthCode] Code invalid/expired`);
      throw new UnauthorizedException('Invalid or expired exchange code');
    }
    console.log(`[${debugId}] [AuthService exchangeOAuthCode] Code consumed`, {
      userId: row.userId,
    });
    const email = await this.repo.getUserEmailById(row.userId);
    if (!email) {
      console.warn(`[${debugId}] [AuthService exchangeOAuthCode] User not found`, {
        userId: row.userId,
      });
      throw new UnauthorizedException('User not found');
    }

    if (await this.repo.isTwoFactorEnabled(row.userId)) {
      const pendingToken = await this.jwtService.signAsync(
        { sub: row.userId, email, purpose: '2fa_pending' },
        { expiresIn: '5m' },
      );
      console.log(`[${debugId}] [AuthService exchangeOAuthCode] Requires 2FA`, {
        userId: row.userId,
        pendingTokenLength: pendingToken.length,
      });
      return { requiresTwoFactor: true, pendingToken };
    }
    const tokenPair = await this.issueTokenPair(row.userId, email, req, res);
    console.log(`[${debugId}] [AuthService exchangeOAuthCode] Token pair issued`, {
      userId: row.userId,
      accessTokenLength: tokenPair.accessToken?.length ?? 0,
      refreshTokenLength: tokenPair.refreshToken?.length ?? 0,
      expiresIn: tokenPair.expiresIn,
    });
    return tokenPair;
  }

  async refresh(dto: RefreshTokenDto, req: Request, res: Response) {
    const raw = dto.refreshToken ?? (req.cookies?.[REFRESH_COOKIE] as string | undefined);
    if (!raw || typeof raw !== 'string') {
      throw new UnauthorizedException('Refresh token missing');
    }
    const tokenHash = hashRefreshToken(raw);
    const row = await this.repo.findActiveRefreshTokenByHash(tokenHash);
    if (!row) {
      this.clearRefreshCookie(res);
      throw new UnauthorizedException('Invalid refresh token');
    }

    const email = await this.repo.getUserEmailById(row.userId);
    if (!email) {
      throw new UnauthorizedException('User not found');
    }

    const newRaw = generateRefreshTokenRaw();
    const newHash = hashRefreshToken(newRaw);
    const expiresAt = new Date(Date.now() + refreshTtlMs());
    const inserted = await this.repo.insertRefreshToken({
      userId: row.userId,
      tokenHash: newHash,
      expiresAt,
      ipAddress: req.ip ? String(req.ip) : null,
      userAgent: req.headers['user-agent'] ? String(req.headers['user-agent']) : null,
    });

    if (!inserted) {
      throw new InternalServerErrorException('Could not rotate session');
    }

    await this.repo.revokeRefreshToken(row.id, inserted.id);

    this.setRefreshCookie(res, newRaw);

    const roles = await this.repo.getRoleSlugsForUser(row.userId);
    const accessToken = await this.jwtService.signAsync({ sub: row.userId, email, roles });

    return {
      accessToken,
      tokenType: 'Bearer' as const,
      expiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
      refreshToken: newRaw,
    };
  }

  async logout(dto: RefreshTokenDto, req: Request, res: Response) {
    const raw = dto.refreshToken ?? (req.cookies?.[REFRESH_COOKIE] as string | undefined);
    if (raw && typeof raw === 'string') {
      const row = await this.repo.findActiveRefreshTokenByHash(hashRefreshToken(raw));
      if (row) {
        await this.repo.revokeRefreshToken(row.id, null);
      }
    }
    this.clearRefreshCookie(res);
    return { success: true };
  }

  async logoutAll(userId: string, res: Response) {
    await this.repo.revokeAllRefreshTokensForUser(userId);
    this.clearRefreshCookie(res);
    return { success: true };
  }

  async getMe(userId: string) {
    const user = await this.repo.findUserById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const roles = await this.repo.getRoleSlugsForUser(userId);
    const permissions = await this.repo.getPermissionSlugsForUser(userId);
    const twoFactorEnabled = await this.repo.isTwoFactorEnabled(userId);
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      preferredCurrency: user.preferredCurrency,
      phone: (user as any).phone,
      legacyRole: user.role,
      roles,
      permissions,
      twoFactorEnabled,
    };
  }

  async setupTwoFactor(userId: string, email: string) {
    try {
      const secret = this.twoFactor.generateSecret();
      const cipher = encryptField(secret);
      await this.repo.upsertTwoFactorPending(userId, cipher);
      const qrDataUrl = await this.twoFactor.qrDataUrl(email, secret);
      return {
        otpauthUrl: this.twoFactor.otpauthUrl(email, secret),
        qrDataUrl,
        secret,
      };
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Encryption error';
      throw new BadRequestException(message);
    }
  }

  async verifyTwoFactorSetup(userId: string, dto: Verify2faSetupDto) {
    const row = await this.repo.findTwoFactor(userId);
    if (!row?.pendingSecretCiphertext) {
      throw new BadRequestException('Two-factor setup not started');
    }
    const pendingSecret = decryptField(row.pendingSecretCiphertext);
    if (!this.twoFactor.verifyTotp(pendingSecret, dto.code)) {
      throw new UnauthorizedException('Invalid authenticator code');
    }
    const plainCodes = generatePlainBackupCodes();
    const hashes = plainCodes.map((c) => hashBackupCode(c));
    const secretCipher = encryptField(pendingSecret);
    await this.repo.finalizeTwoFactor(userId, secretCipher, hashes);
    return { enabled: true, backupCodes: plainCodes };
  }

  async disableTwoFactor(userId: string, dto: Disable2faDto) {
    const profile = await this.repo.findUserById(userId);
    if (!profile) {
      throw new UnauthorizedException();
    }
    const cred = await this.repo.findUserWithPasswordByEmail(profile.email);
    if (cred?.passwordHash) {
      if (!dto.password) {
        throw new UnauthorizedException('Password required');
      }
      const ok = await this.verifyCredentialAndMaybeMigrate(cred.id, dto.password, cred.passwordHash);
      if (!ok) {
        throw new UnauthorizedException('Invalid password');
      }
    }
    const tf = await this.repo.findTwoFactor(userId);
    if (!tf?.enabled || !tf.secretCiphertext) {
      throw new BadRequestException('Two-factor is not enabled');
    }
    const secret = decryptField(tf.secretCiphertext);
    const hash = hashBackupCode(dto.code);
    const isBackup = tf.backupCodesJson.includes(hash);
    const isTotp = this.twoFactor.verifyTotp(secret, dto.code);
    if (!isTotp && !isBackup) {
      throw new UnauthorizedException('Invalid code');
    }
    if (isBackup) {
      const idx = tf.backupCodesJson.indexOf(hash);
      const remaining = tf.backupCodesJson.filter((_, i) => i !== idx);
      await this.repo.removeBackupCode(userId, remaining);
    }
    await this.repo.disableTwoFactor(userId);
    return { disabled: true };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.repo.findUserByEmail(dto.email);
    if (!user) {
      // Return success even if user not found for security
      return { ok: true };
    }

    const code = randomInt(100000, 1000000).toString();
    const otpHash = createHash('sha256').update(code).digest('hex');
    const expiresAt = new Date(Date.now() + 180_000); // 3 minutes

    await this.repo.insertPasswordResetOtp(user.id, otpHash, expiresAt);

    // await this.notificationService.send({
    //   userId: user.id,
    //   type: 'EMAIL',
    //   email: dto.email,
    //   templateName: 'password-reset-otp',
    //   payload: { code, email: dto.email },
    // });

    return { ok: true };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const user = await this.repo.findUserByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired verification code');
    }
    const otpHash = createHash('sha256').update(dto.code).digest('hex');
    const valid = await this.repo.findActivePasswordResetOtp(user.id, otpHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid or expired verification code');
    }
    return { ok: true };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.repo.findUserByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired verification code');
    }
    const otpHash = createHash('sha256').update(dto.code).digest('hex');
    const otpRecord = await this.repo.findActivePasswordResetOtp(user.id, otpHash);
    const consumed = otpRecord ? await this.repo.consumePasswordResetOtp(otpRecord.id) : false;
    if (!consumed) {
      throw new UnauthorizedException('Invalid or expired verification code');
    }

    const hash = await hashPassword(dto.newPassword);
    const updated = await this.repo.updatePasswordByEmail(dto.email, hash);

    if (!updated) {
      throw new InternalServerErrorException('Failed to update password');
    }

    return { ok: true };
  }

  async verifyNativeGoogleToken(idToken: string, res?: Response) {
    if (!idToken) {
      throw new UnauthorizedException('No ID token provided');
    }
    try {
      const response = await axios.get(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
      );
      const payload = response.data;

      if (payload.error_description) {
        throw new UnauthorizedException(payload.error_description);
      }

      if (payload.iss !== 'accounts.google.com' && payload.iss !== 'https://accounts.google.com') {
        throw new UnauthorizedException('Invalid token issuer');
      }

      const email = payload.email;
      const providerUserId = payload.sub;

      if (!email || !providerUserId) {
        throw new UnauthorizedException('Invalid token payload');
      }

      return this.oauthLogin(
        {
          email,
          provider: 'google',
          providerUserId,
        },
        undefined,
        res,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid ID token';
      throw new UnauthorizedException(`Failed to verify Google ID token: ${message}`);
    }
  }
}
