import { Seat } from '../models/Seat.js';

export interface PendingBookingData {
  showtimeId: string;
  movieId: string;
  theaterId: string;
  date: string;
  time: string;
  price: number;
  movieTitle: string;
  theaterName: string;
  theaterAddress: string;
}

const ROW_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export class BookingService {
  private static instance: BookingService;
  private static readonly PENDING_KEY = 'ticketflix_pending';

  private constructor() {}

  static getInstance(): BookingService {
    if (!BookingService.instance) BookingService.instance = new BookingService();
    return BookingService.instance;
  }

  async fetchSeats(showtimeId: string): Promise<Seat[][]> {
    const res  = await fetch(`/api/showtimes/${showtimeId}`);
    const data = await res.json() as { seatmap: (({ available: boolean; accessible: boolean } | null))[][] };
    return data.seatmap.map((row, rowIndex) =>
      row
        .map((cell, colIndex): Seat | null =>
          cell === null ? null : new Seat({
            row:    ROW_LETTERS[rowIndex],
            col:    colIndex + 1,
            status: cell.available ? 'available' : 'taken',
          })
        )
        .filter((s): s is Seat => s !== null)
    );
  }

  savePending(data: PendingBookingData): void {
    sessionStorage.setItem(BookingService.PENDING_KEY, JSON.stringify(data));
  }

  getPending(): PendingBookingData | null {
    const raw = sessionStorage.getItem(BookingService.PENDING_KEY);
    return raw ? (JSON.parse(raw) as PendingBookingData) : null;
  }

  clearPending(): void {
    sessionStorage.removeItem(BookingService.PENDING_KEY);
  }

  async confirmBooking(
    showtimeId: string,
    seats: Seat[],
    cardNumber: string,
  ): Promise<{ ok: boolean; message: string; checkoutId?: string }> {
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          showtimeId,
          seatLabels: seats.map(s => s.label),
          cardNumber,
        }),
      });
      if (res.status === 401) return { ok: false, message: 'You must be logged in to book tickets.' };
      if (!res.ok) {
        const body = await res.json().catch(() => null) as { message?: string } | null;
        return { ok: false, message: body?.message ?? 'Booking failed. Please try again.' };
      }
      const data = await res.json() as { checkoutId: string };
      return { ok: true, message: '', checkoutId: data.checkoutId };
    } catch {
      return { ok: false, message: 'Could not reach the server. Please try again.' };
    }
  }
}
