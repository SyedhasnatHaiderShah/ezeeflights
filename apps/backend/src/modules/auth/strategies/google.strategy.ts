import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    const clientID = process.env.GOOGLE_CLIENT_ID;
    if (!clientID) {
      // Passport requires a non-empty clientID; use a placeholder when OAuth
      // is not configured — the google auth routes will be disabled at runtime.
      super({ clientID: 'disabled', clientSecret: 'disabled', callbackURL: 'http://localhost/disabled', scope: [] });
      return;
    }
    super({
      clientID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ?? 'http://localhost:4000/v1/auth/google/callback',
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
