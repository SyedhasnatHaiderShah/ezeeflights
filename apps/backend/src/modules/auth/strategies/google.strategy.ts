import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { appLogger } from '../../../common/logging/winston';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    const clientID = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const callbackURL = process.env.GOOGLE_CALLBACK_URL;
    if (!clientID) {
      appLogger.warn('Google OAuth is not configured. Set GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET/GOOGLE_CALLBACK_URL.');
      super({ clientID: 'google-oauth-disabled', clientSecret: 'google-oauth-disabled', callbackURL: 'urn:ietf:wg:oauth:2.0:oob', scope: [] });
      return;
    }
    if (!clientSecret || !callbackURL) {
      appLogger.warn('Google OAuth is partially configured. Missing GOOGLE_CLIENT_SECRET or GOOGLE_CALLBACK_URL.');
      super({ clientID: 'google-oauth-disabled', clientSecret: 'google-oauth-disabled', callbackURL: 'urn:ietf:wg:oauth:2.0:oob', scope: [] });
      return;
    }
    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'profile'],
    });
  }

  validate(_: string, __: string, profile: Profile) {
    return {
      email: profile.emails?.[0]?.value ?? '',
      providerId: profile.id,
    };
  }
}
