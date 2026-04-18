import { Theater } from './Theater.js';

export interface ShowtimeData {
  id: number;
  movieId: number;
  theater: Theater;
  date: string;
  time: string;
  price: number;
}

export class Showtime {
  readonly id: number;
  readonly movieId: number;
  readonly theater: Theater;
  readonly date: string;
  readonly time: string;
  readonly price: number;

  constructor(data: ShowtimeData) {
    this.id       = data.id;
    this.movieId  = data.movieId;
    this.theater  = data.theater;
    this.date     = data.date;
    this.time     = data.time;
    this.price    = data.price;
  }

  get dateFormatted(): string {
    const [year, month, day] = this.date.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  get dayOfWeek(): string {
    const [year, month, day] = this.date.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  }
}
