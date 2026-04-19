import { Seat, SeatStatus } from '../models/Seat.js';
import { Showtime } from '../models/Showtime.js';

export interface PendingBookingData {
  movieId: number;
  theaterId: number;
  date: string;
  time: string;
  price: number;
  movieTitle: string;
  theaterName: string;
  theaterAddress: string;
}

export class BookingService {
  private static instance: BookingService;
  private static readonly PENDING_KEY = 'ticketflix_pending';

  private constructor() {}

  static getInstance(): BookingService {
    if (!BookingService.instance) {
      BookingService.instance = new BookingService();
    }
    return BookingService.instance;
  }

  /** Generate a seating chart with some seats pre-taken */
  generateSeats(rows: string[], cols: number): Seat[][] {
    // Deterministic taken pattern so it looks realistic
    const takenPattern: Record<string, boolean> = {};
    ['A3','A4','B7','B8','B9','C1','C2','D5','D6','E10','E11','F3','G6','G7','H2','H3','H4'].forEach(l => {
      takenPattern[l] = true;
    });

    return rows.map(row =>
      Array.from({ length: cols }, (_, i) => {
        const label = `${row}${i + 1}`;
        const status: SeatStatus = takenPattern[label] ? 'taken' : 'available';
        return new Seat({ row, col: i + 1, status });
      })
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

  async confirmBooking(_showtime: Showtime, _seats: Seat[]): Promise<{ ok: boolean }> {
    // Stub — wire to your backend here
    await new Promise(resolve => setTimeout(resolve, 600));
    return { ok: true };
  }
}
