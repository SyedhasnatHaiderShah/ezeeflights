import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
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

@ApiTags('Auth')
@Controller({ path: 'auth', version: '1' })
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  @Post('register')
  register(@Body() dto: RegisterDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.register(dto, req, res);
  }

  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful, returns tokens' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @Post('login')
  login(@Body() dto: LoginDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(dto, req, res);
  }

  @ApiOperation({ summary: 'Exchange OAuth code for session tokens' })
  @ApiResponse({ status: 200, description: 'OAuth exchange successful' })
  @ApiResponse({ status: 400, description: 'Invalid or expired code' })
  @Post('oauth/exchange')
  exchangeOAuth(
    @Body() dto: OauthExchangeDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.exchangeOAuthCode(dto, req, res);
  }

  @ApiOperation({ summary: 'Complete 2FA login with TOTP code' })
  @ApiResponse({ status: 200, description: '2FA verified, returns tokens' })
  @ApiResponse({ status: 401, description: 'Invalid or expired 2FA code' })
  @Post('2fa/verify-login')
  verify2faLogin(
    @Body() dto: Verify2faLoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.verifyTwoFactorLogin(dto, req, res);
  }

  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({ status: 200, description: 'New tokens issued' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  @Post('refresh-token')
  refresh(@Body() dto: RefreshTokenDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.refresh(dto, req, res);
  }

  @ApiOperation({ summary: 'Logout current session' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  @Post('logout')
  logout(@Body() dto: RefreshTokenDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.logout(dto, req, res);
  }

  @ApiOperation({ summary: 'Logout all active sessions for the authenticated user' })
  @ApiResponse({ status: 200, description: 'All sessions invalidated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  logoutAll(@Req() req: JwtReq, @Res({ passthrough: true }) res: Response) {
    return this.authService.logoutAll(req.user.userId, res);
  }

  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @ApiResponse({ status: 200, description: 'Authenticated user data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: JwtReq) {
    return this.authService.getMe(req.user.userId);
  }

  @ApiOperation({ summary: 'Initiate 2FA setup — returns QR code URI' })
  @ApiResponse({ status: 200, description: '2FA setup data (otpauth URI)' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('2fa/setup')
  setup2fa(@Req() req: JwtReq) {
    return this.authService.setupTwoFactor(req.user.userId, req.user.email);
  }

  @ApiOperation({ summary: 'Verify and activate 2FA setup with TOTP code' })
  @ApiResponse({ status: 200, description: '2FA enabled successfully' })
  @ApiResponse({ status: 400, description: 'Invalid TOTP code' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('2fa/verify')
  verify2faSetup(@Req() req: JwtReq, @Body() dto: Verify2faSetupDto) {
    return this.authService.verifyTwoFactorSetup(req.user.userId, dto);
  }

  @ApiOperation({ summary: 'Disable 2FA for the authenticated user' })
  @ApiResponse({ status: 200, description: '2FA disabled' })
  @ApiResponse({ status: 401, description: 'Unauthorized or wrong password/code' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('2fa/disable')
  disable2fa(@Req() req: JwtReq, @Body() dto: Disable2faDto) {
    return this.authService.disableTwoFactor(req.user.userId, dto);
  }

  @ApiOperation({ summary: 'Redirect to Google OAuth consent screen' })
  @ApiResponse({ status: 302, description: 'Redirect to Google' })
  @Get('google')
  @UseGuards(GoogleOauthGuard)
  googleAuth() {
    return { message: 'Redirecting to Google OAuth' };
  }

  @ApiOperation({ summary: 'Google OAuth callback handler' })
  @ApiResponse({ status: 302, description: 'Redirect to frontend with token or error' })
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

  @ApiOperation({ summary: 'Send password reset OTP to email' })
  @ApiResponse({ status: 200, description: 'OTP sent if email exists' })
  @Post('password/forgot')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @ApiOperation({ summary: 'Verify OTP code for password reset' })
  @ApiResponse({ status: 200, description: 'OTP verified' })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  @Post('password/verify-otp')
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  @ApiOperation({ summary: 'Reset password using verified OTP' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Invalid OTP or email' })
  @Post('password/reset')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }
}
