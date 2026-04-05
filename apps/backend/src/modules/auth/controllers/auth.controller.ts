import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { GoogleOauthGuard } from '../guards/google-oauth.guard';

@ApiTags('auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('google')
  @UseGuards(GoogleOauthGuard)
  googleAuth() {
    return { message: 'Redirecting to Google OAuth' };
  }

  @Get('google/callback')
  @UseGuards(GoogleOauthGuard)
  googleCallback(@Req() req: { user: { email: string } }) {
    return this.authService.login({ email: req.user.email, password: 'oauth-placeholder' });
  }
}
