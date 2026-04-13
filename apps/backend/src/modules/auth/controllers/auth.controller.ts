import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { Disable2faDto } from '../dto/disable-2fa.dto';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { RegisterDto } from '../dto/register.dto';
import { Verify2faLoginDto } from '../dto/verify-2fa-login.dto';
import { OauthExchangeDto } from '../dto/oauth-exchange.dto';
import { Verify2faSetupDto } from '../dto/verify-2fa-setup.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { VerifyOtpDto } from '../dto/verify-otp.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { GoogleOauthGuard } from '../guards/google-oauth.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

interface OAuthUser {
  email: string;
  providerId: string;
}

interface JwtReq {
  user: { userId: string; email: string };
}

@ApiTags('auth')
@Controller({ path: 'auth', version: '1' })
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.register(dto, req, res);
  }

  @Post('login')
  login(@Body() dto: LoginDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(dto, req, res);
  }

  @Post('oauth/exchange')
  exchangeOAuth(
    @Body() dto: OauthExchangeDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.exchangeOAuthCode(dto, req, res);
  }

  @Post('2fa/verify-login')
  verify2faLogin(
    @Body() dto: Verify2faLoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.verifyTwoFactorLogin(dto, req, res);
  }

  @Post('refresh-token')
  refresh(@Body() dto: RefreshTokenDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.refresh(dto, req, res);
  }

  @Post('logout')
  logout(@Body() dto: RefreshTokenDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.logout(dto, req, res);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  logoutAll(@Req() req: JwtReq, @Res({ passthrough: true }) res: Response) {
    return this.authService.logoutAll(req.user.userId, res);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: JwtReq) {
    return this.authService.getMe(req.user.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('2fa/setup')
  setup2fa(@Req() req: JwtReq) {
    return this.authService.setupTwoFactor(req.user.userId, req.user.email);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('2fa/verify')
  verify2faSetup(@Req() req: JwtReq, @Body() dto: Verify2faSetupDto) {
    return this.authService.verifyTwoFactorSetup(req.user.userId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('2fa/disable')
  disable2fa(@Req() req: JwtReq, @Body() dto: Disable2faDto) {
    return this.authService.disableTwoFactor(req.user.userId, dto);
  }

  @Get('google')
  @UseGuards(GoogleOauthGuard)
  googleAuth() {
    return { message: 'Redirecting to Google OAuth' };
  }

  @Get('google/callback')
  @UseGuards(GoogleOauthGuard)
  async googleCallback(@Req() req: Request & { user: OAuthUser }, @Res() res: Response): Promise<void> {
    const base = (
      process.env.FRONTEND_OAUTH_REDIRECT ??
      process.env.FRONTEND_ORIGIN ??
      'http://localhost:3000'
    ).replace(/\/$/, '');
    try {
      const url = await this.authService.completeGoogleOAuthForBrowserRedirect({
        email: req.user?.email ?? '',
        provider: 'google',
        providerUserId: req.user?.providerId ?? '',
      });
      res.redirect(302, url);
    } catch {
      res.redirect(302, `${base}/auth/callback?error=oauth_failed`);
    }
  }

  @Post('password/forgot')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('password/verify-otp')
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  @Post('password/reset')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }
}
