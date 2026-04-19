import { Movie } from '../models/Movie.js';

export class MovieCard {
  private movie: Movie;
  private clickHandler: (movie: Movie) => void;

  constructor(movie: Movie, clickHandler: (movie: Movie) => void) {
    this.movie        = movie;
    this.clickHandler = clickHandler;
  }

  render(): HTMLElement {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');

    const hasPoster = this.movie.posterUrl.length > 0;

    card.innerHTML = `
      <div class="movie-card__poster" style="background:${this.movie.posterGradient};">
        ${hasPoster ? `
          <img
            class="movie-card__img"
            src="${this.movie.posterUrl}"
            alt="${this.movie.title} poster"
            loading="lazy"
          >
        ` : ''}
        <span class="movie-card__badge">${this.movie.rating}</span>
        <div class="movie-card__poster-text" style="color:${this.movie.posterAccent};">
          ${this.movie.title.toUpperCase()}
        </div>
        <div class="movie-card__hover-overlay">
          <span class="movie-card__cta">Book Now</span>
        </div>
      </div>
      <p class="movie-card__title">${this.movie.title}</p>
      <p class="movie-card__genre">${this.movie.genre} · ${this.movie.durationFormatted}</p>
    `;

    // If image fails to load, it hides itself so the gradient shows
    const img = card.querySelector<HTMLImageElement>('.movie-card__img');
    img?.addEventListener('error', () => {
      if (img) img.style.display = 'none';
    });

    const trigger = () => this.clickHandler(this.movie);
    card.addEventListener('click', trigger);
    card.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') trigger();
    });

    return card;
  }
}
