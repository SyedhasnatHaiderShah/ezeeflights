import { Module } from "@nestjs/common";
import { FlightModule } from "../flight/flight.module";
import { NotificationModule } from "../notification/notification.module";
import { UserModule } from "../user/user.module";
import { InquiryController } from "./controllers/inquiry.controller";
import { InquiryService } from "./services/inquiry.service";
import { InquiryPaymentService } from "./services/inquiry-payment.service";
import { InquiryRepository } from "./repositories/inquiry.repository";
import { InquiryPaymentRepository } from "./repositories/inquiry-payment.repository";
import { PublicModule } from "../public/public.module";

@Module({
  imports: [FlightModule, NotificationModule, UserModule, PublicModule],
  controllers: [InquiryController],
  providers: [
    InquiryService,
    InquiryPaymentService,
    InquiryRepository,
    InquiryPaymentRepository,
  ],
  exports: [InquiryService, InquiryPaymentService],
})
export class InquiriesModule {}
