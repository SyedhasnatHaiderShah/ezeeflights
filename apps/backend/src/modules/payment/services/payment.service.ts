import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { PaymentRepository } from '../repositories/payment.repository';
import { IdempotencyService } from '../../../common/idempotency/idempotency.service';
import { CircuitBreakerService } from '../../../common/circuit-breaker/circuit-breaker.service';
import { PaymentEntity } from '../entities/payment.entity';

@Injectable()
export class PaymentService {
  constructor(
    private readonly repository: PaymentRepository,
    private readonly idempotency: IdempotencyService,
    private readonly circuitBreaker: CircuitBreakerService,
  ) {}

  async createPayment(dto: CreatePaymentDto, idempotencyKey: string): Promise<PaymentEntity> {
    const cached = await this.idempotency.getCached<PaymentEntity>('payments', idempotencyKey);
    if (cached) {
      return cached;
    }

    const payment = await this.circuitBreaker.execute(
      'stripe',
      () => this.repository.create(dto),
      async () => ({
        id: 'unavailable',
        bookingId: dto.bookingId,
        amount: dto.amount,
        currency: dto.currency,
        provider: dto.provider,
        providerReference: null,
        status: 'FAILED',
        createdAt: new Date(),
      }),
    );

    await this.idempotency.setCached('payments', idempotencyKey, payment);
    return payment;
  }

  health() {
    return { module: 'payment', status: 'ok' };
  }
}
