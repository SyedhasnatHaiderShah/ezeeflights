import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { PaymentRepository } from '../repositories/payment.repository';

@Injectable()
export class PaymentService {
  constructor(private readonly repository: PaymentRepository) {}

  createPayment(dto: CreatePaymentDto) {
    return this.repository.create(dto);
  }

  health() {
    return { module: 'payment', status: 'ok' };
  }
}
