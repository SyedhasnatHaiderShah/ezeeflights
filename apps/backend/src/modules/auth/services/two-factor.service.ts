import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';

@Injectable()
export class TwoFactorService {
  generateSecret(): string {
    return authenticator.generateSecret();
  }

  otpauthUrl(email: string, secret: string): string {
    const issuer = process.env.TOTP_ISSUER ?? 'ezeeFlights';
    return authenticator.keyuri(email, issuer, secret);
  }

  async qrDataUrl(email: string, secret: string): Promise<string> {
    const url = this.otpauthUrl(email, secret);
    return QRCode.toDataURL(url);
  }

  verifyTotp(secret: string, code: string): boolean {
    return authenticator.verify({ token: code.replace(/\s/g, ''), secret });
  }
}
