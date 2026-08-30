import { Injectable } from '@nestjs/common';
import { generateSecret, generateURI, verifySync } from 'otplib';
import * as QRCode from 'qrcode';

@Injectable()
export class TwoFactorService {
  generateSecret(): string {
    return generateSecret();
  }

  otpauthUrl(email: string, secret: string): string {
    const issuer = process.env.TOTP_ISSUER ?? 'ezeeFlights';
    return generateURI({ issuer, label: email, secret });
  }

  async qrDataUrl(email: string, secret: string): Promise<string> {
    const url = this.otpauthUrl(email, secret);
    return QRCode.toDataURL(url);
  }

  verifyTotp(secret: string, code: string): boolean {
    const result = verifySync({ token: code.replace(/\s/g, ''), secret });
    return result.valid;
  }
}
