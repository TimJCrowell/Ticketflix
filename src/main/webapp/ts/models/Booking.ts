import { Showtime } from './Showtime.js';
import { Seat } from './Seat.js';

export class Booking {
  readonly showtime: Showtime;
  readonly seats: Seat[];
  readonly userId: string;

  constructor(showtime: Showtime, seats: Seat[], userId: string) {
    this.showtime = showtime;
    this.seats    = seats;
    this.userId   = userId;
  }

  get total(): number {
    return this.seats.length * this.showtime.price;
  }

  get totalFormatted(): string {
    return `$${this.total.toFixed(2)}`;
  }

  get seatLabels(): string {
    return this.seats.map(s => s.label).join(', ');
  }
}
