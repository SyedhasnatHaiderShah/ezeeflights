import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { hashPassword, hashPasswordScryptSync } from '../src/common/crypto/password';
import { AuthRepository } from '../src/modules/auth/repositories/auth.repository';
import { AuthService } from '../src/modules/auth/services/auth.service';
import { TwoFactorService } from '../src/modules/auth/services/two-factor.service';

describe('AuthService', () => {
  let service: AuthService;

  const repo = {
    findUserWithPasswordByEmail: jest.fn(),
    findUserByEmail: jest.fn(),
    findUserById: jest.fn(),
    insertUser: jest.fn(),
    insertOAuthUser: jest.fn(),
    assignRoleBySlug: jest.fn(),
    getRoleSlugsForUser: jest.fn(),
    getPermissionSlugsForUser: jest.fn(),
    findOAuthAccount: jest.fn(),
    tryInsertOAuthAccount: jest.fn(),
    getUserEmailById: jest.fn(),
    insertRefreshToken: jest.fn(),
    findActiveRefreshTokenByHash: jest.fn(),
    revokeRefreshToken: jest.fn(),
    revokeAllRefreshTokensForUser: jest.fn(),
    findTwoFactor: jest.fn(),
    upsertTwoFactorPending: jest.fn(),
    finalizeTwoFactor: jest.fn(),
    disableTwoFactor: jest.fn(),
    removeBackupCode: jest.fn(),
    isTwoFactorEnabled: jest.fn(),
    updatePasswordHash: jest.fn(),
  };

  const jwt = {
    signAsync: jest.fn().mockResolvedValue('signed.jwt'),
    verifyAsync: jest.fn(),
  };

  const twoFactor = {
    generateSecret: jest.fn().mockReturnValue('SECRETBASE32'),
    otpauthUrl: jest.fn().mockReturnValue('otpauth://totp'),
    qrDataUrl: jest.fn().mockResolvedValue('data:image/png;base64,xx'),
    verifyTotp: jest.fn().mockReturnValue(true),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: AuthRepository, useValue: repo },
        { provide: JwtService, useValue: jwt },
        { provide: TwoFactorService, useValue: twoFactor },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
  });

  it('rejects login when password does not match', async () => {
    const goodHash = await hashPassword('correct-password');
    repo.findUserWithPasswordByEmail.mockResolvedValue({
      id: 'u1',
      email: 'a@b.com',
      passwordHash: goodHash,
    });

    await expect(service.login({ email: 'a@b.com', password: 'wrong' })).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('issues tokens when password matches and 2FA disabled', async () => {
    const goodHash = await hashPassword('correct-password');
    repo.findUserWithPasswordByEmail.mockResolvedValue({
      id: 'u1',
      email: 'a@b.com',
      passwordHash: goodHash,
    });
    repo.isTwoFactorEnabled.mockResolvedValue(false);
    repo.getRoleSlugsForUser.mockResolvedValue(['customer']);
    repo.insertRefreshToken.mockResolvedValue({ id: 'rt1' });

    const out = await service.login({ email: 'a@b.com', password: 'correct-password' });

    expect(out).toMatchObject({ accessToken: 'signed.jwt', tokenType: 'Bearer' });
    expect(repo.insertRefreshToken).toHaveBeenCalled();
    expect(repo.updatePasswordHash).not.toHaveBeenCalled();
    const accessCall = jwt.signAsync.mock.calls.find(
      (c) => (c[0] as { roles?: string[] }).roles?.includes('customer'),
    );
    expect(accessCall?.[0]).toEqual(
      expect.objectContaining({ sub: 'u1', email: 'a@b.com', roles: ['customer'] }),
    );
  });

  it('migrates legacy scrypt password to bcrypt on successful login', async () => {
    const scryptHash = hashPasswordScryptSync('legacy-pass');
    repo.findUserWithPasswordByEmail.mockResolvedValue({
      id: 'u1',
      email: 'a@b.com',
      passwordHash: scryptHash,
    });
    repo.isTwoFactorEnabled.mockResolvedValue(false);
    repo.getRoleSlugsForUser.mockResolvedValue(['customer']);
    repo.insertRefreshToken.mockResolvedValue({ id: 'rt1' });

    await service.login({ email: 'a@b.com', password: 'legacy-pass' });

    expect(repo.updatePasswordHash).toHaveBeenCalledWith(
      'u1',
      expect.stringMatching(/^\$2[aby]\$/),
    );
  });

  it('returns pending challenge when 2FA enabled', async () => {
    const goodHash = await hashPassword('correct-password');
    repo.findUserWithPasswordByEmail.mockResolvedValue({
      id: 'u1',
      email: 'a@b.com',
      passwordHash: goodHash,
    });
    repo.isTwoFactorEnabled.mockResolvedValue(true);

    const out = await service.login({ email: 'a@b.com', password: 'correct-password' });

    expect(out).toEqual(
      expect.objectContaining({ requiresTwoFactor: true, pendingToken: 'signed.jwt' }),
    );
    expect(jwt.signAsync).toHaveBeenCalledWith(
      expect.objectContaining({ purpose: '2fa_pending' }),
      { expiresIn: '5m' },
    );
  });
});
