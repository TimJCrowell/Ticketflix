import { Movie } from '../models/Movie.js';
import { Theater } from '../models/Theater.js';
import { Showtime } from '../models/Showtime.js';

const PRICE_PER_SEAT = 14.99;

function formatTime(datetime: string): string {
  const [h, m] = datetime.split('T')[1].split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  const mm = m < 10 ? `0${m}` : `${m}`;
  return `${h12}:${mm} ${period}`;
}

export class MovieService {
  private static instance: MovieService;

  private _movies: Movie[] | null = null;
  private _theaters: Theater[] | null = null;
  private _showtimes: Map<string, Showtime[]> = new Map();
  private _roomToTheater: Map<string, Theater> = new Map();

  private constructor() {}

  static getInstance(): MovieService {
    if (!MovieService.instance) MovieService.instance = new MovieService();
    return MovieService.instance;
  }

  async getMovies(): Promise<Movie[]> {
    if (!this._movies) {
      const res  = await fetch('/api/movies');
      const data = await res.json() as any[];
      this._movies = data.map((m, i) => new Movie({
        id:          m.id,
        title:       m.name,
        genre:       m.genre        ?? '',
        duration:    m.runtime,
        rating:      m.rating       ?? '',
        description: m.shortDescription ?? '',
        posterUrl:   m.posterImage  ?? '',
      }, i));
    }
    return this._movies;
  }

  async getTheaters(): Promise<Theater[]> {
    if (!this._theaters) {
      const res  = await fetch('/api/theaters');
      const data = await res.json() as any[];
      this._theaters = data.map(t => {
        const theater = new Theater({ id: t.id, name: t.name });
        for (const room of (t.rooms ?? [])) {
          this._roomToTheater.set(room.id, theater);
        }
        return theater;
      });
    }
    return this._theaters;
  }

  async loadShowtimesForMovie(movieId: string): Promise<void> {
    if (this._showtimes.has(movieId)) return;
    await this.getTheaters(); // ensure room→theater map is populated

    const res  = await fetch(`/api/showtimes?movieId=${movieId}`);
    const data = await res.json() as any[];

    const showtimes: Showtime[] = [];
    for (const s of data) {
      const theater = this._roomToTheater.get(s.roomId);
      if (!theater) continue;
      showtimes.push(new Showtime({
        id:       s.id,
        movieId:  s.movieId,
        theater,
        roomId:   s.roomId,
        date:     (s.datetime as string).split('T')[0],
        time:     formatTime(s.datetime),
        price:    PRICE_PER_SEAT,
      }));
    }
    this._showtimes.set(movieId, showtimes);
  }

  getMovieById(id: string): Movie | undefined {
    return this._movies?.find(m => m.id === id);
  }

  getCachedShowtimes(movieId: string, theaterId?: string, date?: string): Showtime[] {
    const all = this._showtimes.get(movieId) ?? [];
    return all.filter(s =>
      (theaterId === undefined || s.theater.id === theaterId) &&
      (date      === undefined || s.date      === date)
    );
  }

  getAvailableDates(movieId: string, theaterId: string): string[] {
    const seen = new Set<string>();
    return this.getCachedShowtimes(movieId, theaterId)
      .map(s => s.date)
      .filter(d => !seen.has(d) && !!seen.add(d));
  }
}
