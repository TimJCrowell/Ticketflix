import { Movie } from '../models/Movie.js';
import { Theater } from '../models/Theater.js';
import { Showtime } from '../models/Showtime.js';

export class MovieService {
  private static instance: MovieService;

  private readonly movies: Movie[] = [
    new Movie({
      id: 1, title: 'Kingdom of the Planet of the Apes', genre: 'Action', duration: 145, rating: 'PG-13',
      posterGradient: 'linear-gradient(170deg,#7c2d12 0%,#b45309 45%,#92400e 100%)',
      posterAccent: '#fbbf24',
      description: 'Many generations after the reign of Caesar, a new tyrannical ape leader builds his empire.',
      posterUrl: 'https://image.tmdb.org/t/p/w500/gKkl37BQuKTanygYQG1pyYgLVgf.jpg'
    }),
    new Movie({
      id: 2, title: 'IF', genre: 'Family', duration: 104, rating: 'PG',
      posterGradient: 'linear-gradient(170deg,#1c1917 0%,#d97706 55%,#f59e0b 100%)',
      posterAccent: '#fde68a',
      description: 'A girl who discovers she can see imaginary friends that have been abandoned by children.',
      posterUrl: 'https://image.tmdb.org/t/p/w500/xQLo3NG0uGGkbP3Mk2BhGwuW17mb.jpg'
    }),
    new Movie({
      id: 3, title: 'Civil War', genre: 'Action', duration: 109, rating: 'R',
      posterGradient: 'linear-gradient(170deg,#0f172a 0%,#1e3a5f 50%,#1e40af 100%)',
      posterAccent: '#93c5fd',
      description: 'Journalists travel across a war-torn America reporting on the second civil war.',
      posterUrl: 'https://image.tmdb.org/t/p/w500/sh7Rg8Er3tFcN9BpKIPOMvALgZd.jpg'
    }),
    new Movie({
      id: 4, title: 'Furiosa', genre: 'Action', duration: 148, rating: 'R',
      posterGradient: 'linear-gradient(170deg,#1a0000 0%,#7f1d1d 50%,#991b1b 100%)',
      posterAccent: '#fca5a5',
      description: 'The origin story of the legendary Mad Max character Furiosa.',
      posterUrl: 'https://image.tmdb.org/t/p/w500/iADOJ8Zymht2JPMoy3R7xceZprc.jpg'
    }),
    new Movie({
      id: 5, title: 'Wicked', genre: 'Musical', duration: 160, rating: 'PG',
      posterGradient: 'linear-gradient(170deg,#1e0840 0%,#4c1d95 50%,#6d28d9 100%)',
      posterAccent: '#c4b5fd',
      description: 'The untold story of the witches of the land of Oz.',
      posterUrl: 'https://image.tmdb.org/t/p/w500/xDGbZ0JJ3mYaGKy4Nzd9Kph5LYEX.jpg'
    }),
    new Movie({
      id: 6, title: 'The Beekeeper', genre: 'Action', duration: 105, rating: 'R',
      posterGradient: 'linear-gradient(170deg,#0c0a09 0%,#292524 50%,#44403c 100%)',
      posterAccent: '#d6d3d1',
      description: 'A man wages a relentless campaign against phishing scammers who stole from his friend.',
      posterUrl: 'https://image.tmdb.org/t/p/w500/2uOPx8s8pMZiRlcXS6s3B5qdAfn.jpg'
    }),
  ];

  private readonly theaters: Theater[] = [
    new Theater({ id: 1, name: 'Northridge', city: 'Northridge', address: '18600 Devonshire St, Northridge, CA' }),
    new Theater({ id: 2, name: 'Santa Ana',  city: 'Santa Ana',  address: '1601 W Sunflower Ave, Santa Ana, CA' }),
    new Theater({ id: 3, name: 'Los Angeles', city: 'Los Angeles', address: '555 W 5th St, Los Angeles, CA' }),
  ];

  private readonly showtimes: Showtime[] = [];

  private constructor() {
    this.generateShowtimes();
  }

  static getInstance(): MovieService {
    if (!MovieService.instance) {
      MovieService.instance = new MovieService();
    }
    return MovieService.instance;
  }

  private generateShowtimes(): void {
    const times = ['1:00 PM', '3:30 PM', '6:00 PM'];
    const today = new Date();
    let id = 1;

    this.movies.forEach(movie => {
      this.theaters.forEach(theater => {
        for (let d = 0; d < 7; d++) {
          const date = new Date(today);
          date.setDate(today.getDate() + d);
          const iso = date.toISOString().split('T')[0];
          times.forEach(time => {
            this.showtimes.push(new Showtime({
              id: id++, movieId: movie.id, theater, date: iso, time, price: 14.99
            }));
          });
        }
      });
    });
  }

  getAllMovies(): Movie[] { return [...this.movies]; }

  getMovieById(id: number): Movie | undefined {
    return this.movies.find(m => m.id === id);
  }

  getAllTheaters(): Theater[] { return [...this.theaters]; }

  getTheaterById(id: number): Theater | undefined {
    return this.theaters.find(t => t.id === id);
  }

  getShowtimesForMovie(movieId: number, theaterId?: number, date?: string): Showtime[] {
    return this.showtimes.filter(s =>
      s.movieId === movieId &&
      (theaterId === undefined || s.theater.id === theaterId) &&
      (date === undefined || s.date === date)
    );
  }

  getAvailableDates(movieId: number, theaterId: number): string[] {
    const seen = new Set<string>();
    return this.showtimes
      .filter(s => s.movieId === movieId && s.theater.id === theaterId)
      .map(s => s.date)
      .filter(d => { if (seen.has(d)) return false; seen.add(d); return true; });
  }
}
