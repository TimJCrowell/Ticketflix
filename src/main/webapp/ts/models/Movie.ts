const FALLBACK_GRADIENTS = [
  { gradient: 'linear-gradient(170deg,#7c2d12 0%,#b45309 45%,#92400e 100%)', accent: '#fbbf24' },
  { gradient: 'linear-gradient(170deg,#1c1917 0%,#d97706 55%,#f59e0b 100%)', accent: '#fde68a' },
  { gradient: 'linear-gradient(170deg,#0f172a 0%,#1e3a5f 50%,#1e40af 100%)', accent: '#93c5fd' },
  { gradient: 'linear-gradient(170deg,#1a0000 0%,#7f1d1d 50%,#991b1b 100%)', accent: '#fca5a5' },
  { gradient: 'linear-gradient(170deg,#1e0840 0%,#4c1d95 50%,#6d28d9 100%)', accent: '#c4b5fd' },
  { gradient: 'linear-gradient(170deg,#0c0a09 0%,#292524 50%,#44403c 100%)', accent: '#d6d3d1' },
];

export interface MovieData {
  id: string;
  title: string;
  genre: string;
  duration: number;
  rating: string;
  description: string;
  posterUrl?: string;
  posterGradient?: string;
  posterAccent?: string;
}

export class Movie {
  readonly id: string;
  readonly title: string;
  readonly genre: string;
  readonly duration: number;
  readonly rating: string;
  readonly posterGradient: string;
  readonly posterAccent: string;
  readonly description: string;
  readonly posterUrl: string;

  constructor(data: MovieData, index = 0) {
    const fallback = FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length];
    this.id             = data.id;
    this.title          = data.title;
    this.genre          = data.genre;
    this.duration       = data.duration;
    this.rating         = data.rating;
    this.posterGradient = data.posterGradient ?? fallback.gradient;
    this.posterAccent   = data.posterAccent   ?? fallback.accent;
    this.description    = data.description;
    this.posterUrl      = data.posterUrl ?? '';
  }

  get durationFormatted(): string {
    const h = Math.floor(this.duration / 60);
    const m = this.duration % 60;
    return `${h}h ${m}m`;
  }
}
