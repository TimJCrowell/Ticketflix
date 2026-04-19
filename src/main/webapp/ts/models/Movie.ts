export interface MovieData {
  id: number;
  title: string;
  genre: string;
  duration: number;
  rating: string;
  posterGradient: string;
  posterAccent: string;
  description: string;
  posterUrl?: string;
}

export class Movie {
  readonly id: number;
  readonly title: string;
  readonly genre: string;
  readonly duration: number;
  readonly rating: string;
  readonly posterGradient: string;
  readonly posterAccent: string;
  readonly description: string;
  readonly posterUrl: string;

  constructor(data: MovieData) {
    this.id             = data.id;
    this.title          = data.title;
    this.genre          = data.genre;
    this.duration       = data.duration;
    this.rating         = data.rating;
    this.posterGradient = data.posterGradient;
    this.posterAccent   = data.posterAccent;
    this.description    = data.description;
    this.posterUrl      = data.posterUrl ?? '';
  }

  get durationFormatted(): string {
    const h = Math.floor(this.duration / 60);
    const m = this.duration % 60;
    return `${h}h ${m}m`;
  }
}
