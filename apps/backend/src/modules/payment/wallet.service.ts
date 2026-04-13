import { BadRequestException, Injectable } from '@nestjs/common';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { PaymentRepository } from './repositories/payment.repository';
import { PaymentProviderDriver } from './providers/payment-provider.interface';
import { WalletEntity, WalletTransactionEntity, WalletTransactionType } from './entities/wallet.entity';

@Injectable()
export class WalletService {
  constructor(
    private readonly repository: PaymentRepository,
    private readonly providers: Map<string, PaymentProviderDriver>,
  ) {}

  async getWallet(userId: string): Promise<WalletEntity> {
    const wallet = await this.repository.getOrCreateWallet(userId);
    if (!wallet) throw new BadRequestException('Unable to create wallet');
    return wallet;
  }

  async getBalance(userId: string): Promise<number> {
    const wallet = await this.getWallet(userId);
    return wallet.balance;
  }

  async topUp(userId: string, amount: number, currency: string, paymentMethodId: string): Promise<WalletTransactionEntity> {
    const driver = this.providers.get('STRIPE');
    if (!driver) throw new BadRequestException('Stripe provider unavailable');

    await driver.createSession(
      {
        id: `wallet-${userId}`,
        bookingId: `wallet-${userId}`,
        userId,
        provider: 'STRIPE',
        amount,
        currency: currency as 'USD' | 'AED' | 'EUR' | 'GBP',
        status: 'PENDING',
        transactionId: null,
        metadata: { type: 'wallet_topup', paymentMethodId },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        bookingId: userId,
        provider: 'STRIPE',
        amount,
        currency: currency as 'USD' | 'AED' | 'EUR' | 'GBP',
        successUrl: '',
        failureUrl: '',
        paymentMethodId,
      } as InitiatePaymentDto,
    );

    return this.credit(userId, amount, 'topup', undefined, 'Wallet top up');
  }

  async deduct(userId: string, amount: number, bookingId: string): Promise<WalletTransactionEntity> {
    if (amount <= 0) throw new BadRequestException('Amount must be greater than zero');
    try {
      return await this.repository.deductWallet({ userId, amount, referenceId: bookingId, description: 'Booking payment from wallet' });
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }
  }

  async credit(
    userId: string,
    amount: number,
    type: WalletTransactionType,
    referenceId?: string,
    description?: string,
  ): Promise<WalletTransactionEntity> {
    if (amount <= 0) throw new BadRequestException('Amount must be greater than zero');
    return this.repository.creditWallet({ userId, amount, type, referenceId, description });
  }

  getTransactionHistory(userId: string, limit = 20, offset = 0): Promise<WalletTransactionEntity[]> {
    return this.repository.getWalletTransactions(userId, limit, offset);
  }
}
