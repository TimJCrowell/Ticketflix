import { Theater } from './Theater.js';

export interface ShowtimeData {
  id: string;
  movieId: string;
  theater: Theater;
  roomId: string;
  date: string;
  time: string;
  price: number;
}

export class Showtime {
  readonly id: string;
  readonly movieId: string;
  readonly theater: Theater;
  readonly roomId: string;
  readonly date: string;
  readonly time: string;
  readonly price: number;

  constructor(data: ShowtimeData) {
    this.id       = data.id;
    this.movieId  = data.movieId;
    this.theater  = data.theater;
    this.roomId   = data.roomId;
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
