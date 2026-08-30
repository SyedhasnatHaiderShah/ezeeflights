import { z } from 'zod';

export const modifyBookingSchema = z.union([
  z.object({
    changeType: z.literal('DATE_CHANGE'),
    flightId: z.string().uuid(),
    departureAt: z.string().datetime(),
    arrivalAt: z.string().datetime().optional(),
  }),
  z.object({
    changeType: z.literal('PASSENGER_UPDATE'),
    passengerId: z.string().uuid(),
    fullName: z.string().min(2).optional(),
    passportNumber: z.string().min(4).optional(),
    seatNumber: z.string().regex(/^[0-9]{1,2}[A-Z]$/).optional(),
  }).refine((data) => !!(data.fullName || data.passportNumber || data.seatNumber), {
    message: 'At least one passenger field must be provided',
  }),
]);

export const cancelBookingSchema = z.object({
  reason: z.string().min(3).max(300).optional(),
  refundAmount: z.number().nonnegative().optional(),
});

export const refundBookingSchema = z.object({
  amount: z.number().positive(),
  paymentId: z.string().uuid().optional(),
  note: z.string().max(200).optional(),
});

export type ModifyBookingDto = z.infer<typeof modifyBookingSchema>;
export type CancelBookingDto = z.infer<typeof cancelBookingSchema>;
export type RefundBookingDto = z.infer<typeof refundBookingSchema>;
