import { BasePage } from './BasePage.js';
import { MovieCard } from '../components/MovieCard.js';
import { MovieService } from '../services/MovieService.js';
import { Movie } from '../models/Movie.js';
import { Router } from '../services/Router.js';

export class HomePage extends BasePage {
  private movieService = MovieService.getInstance();

  render(): void {
    const page = this.scaffold('home-page');

    const content = document.createElement('main');
    content.className = 'home-content';
    content.innerHTML = `
      <h1 class="home-title">Now Showing</h1>
      <div class="movie-grid" id="movie-grid"></div>
    `;
    page.appendChild(content);

    const grid = content.querySelector('#movie-grid') as HTMLElement;
    this.movieService.getAllMovies().forEach(movie => {
      const card = new MovieCard(movie, (m: Movie) => this.onMovieClick(m));
      grid.appendChild(card.render());
    });
  }

  private onMovieClick(movie: Movie): void {
    sessionStorage.setItem('tf_movie_id', String(movie.id));
    Router.navigateTo('/movie.html');
  }
}

document.addEventListener('DOMContentLoaded', () => new HomePage().render());
