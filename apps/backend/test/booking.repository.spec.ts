import { BookingRepository } from '../src/modules/booking/repositories/booking.repository';

describe('BookingRepository', () => {
  it('rejects duplicate seats in same request', async () => {
    const repository = new BookingRepository({
      withTransaction: jest.fn(),
    } as any);

    await expect(
      repository.create('u1', {
        flightIds: ['f1'],
        passengers: [
          { fullName: 'A', passportNumber: 'P1', seatNumber: '10A', type: 'ADULT' },
          { fullName: 'B', passportNumber: 'P2', seatNumber: '10A', type: 'CHILD' },
        ],
      }),
    ).rejects.toThrow('Duplicate seat');
  });
});
