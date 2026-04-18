import { BasePage } from './BasePage.js';
import { MovieService } from '../services/MovieService.js';
import { BookingService } from '../services/BookingService.js';
import { Movie } from '../models/Movie.js';
import { Theater } from '../models/Theater.js';
import { Showtime } from '../models/Showtime.js';
import { Router } from '../services/Router.js';

export class MovieDetailPage extends BasePage {
  private movieService  = MovieService.getInstance();
  private bookingService = BookingService.getInstance();

  private movie!: Movie;
  private theaters: Theater[] = [];
  private selectedTheaterId   = 1;
  private selectedDate        = '';
  private selectedTime        = '';
  private availableDates: string[] = [];
  private availableTimes: string[] = [];

  render(): void {
    const movieId = Number(sessionStorage.getItem('tf_movie_id') ?? '1');
    const found   = this.movieService.getMovieById(movieId);
    if (!found) { Router.navigateTo('/home.html'); return; }
    this.movie   = found;
    this.theaters = this.movieService.getAllTheaters();

    // Default: first theater, first available date
    this.selectedTheaterId = this.theaters[0].id;
    this.availableDates    = this.movieService.getAvailableDates(this.movie.id, this.selectedTheaterId);
    this.selectedDate      = this.availableDates[0] ?? '';
    this.refreshTimes();

    const page = this.scaffold('detail-page');

    const main = document.createElement('main');
    main.className = 'detail-main';
    main.innerHTML = this.buildHTML();
    page.appendChild(main);

    this.bindEvents(main);
    this.refreshBookingCard(main);
  }

  private buildHTML(): string {
    return `
      <div class="detail-left">
        <!-- Theater tabs -->
        <section class="detail-section">
          <h2 class="detail-section__label">Theater</h2>
          <div class="theater-tabs" id="theater-tabs">
            ${this.theaters.map(t => `
              <button class="theater-tab${t.id === this.selectedTheaterId ? ' theater-tab--active' : ''}"
                      data-theater="${t.id}">${t.name}</button>
            `).join('')}
          </div>
        </section>

        <!-- Date picker -->
        <section class="detail-section">
          <h2 class="detail-section__label">Date</h2>
          <div class="date-pills" id="date-pills">
            ${this.buildDatePills()}
          </div>
        </section>

        <!-- Time picker -->
        <section class="detail-section">
          <h2 class="detail-section__label">Time</h2>
          <div class="time-pills" id="time-pills">
            ${this.buildTimePills()}
          </div>
        </section>
      </div>

      <div class="detail-right">
        <!-- Movie poster card -->
        <div class="detail-poster" style="background:${this.movie.posterGradient};">
          <div class="detail-poster__text" style="color:${this.movie.posterAccent};">
            ${this.movie.title.toUpperCase()}
          </div>
          <div class="detail-poster__meta">
            <span>${this.movie.rating}</span>
            <span>${this.movie.durationFormatted}</span>
            <span>${this.movie.genre}</span>
          </div>
        </div>

        <!-- Booking summary card -->
        <div class="booking-card" id="booking-card">
          <!-- filled by refreshBookingCard() -->
        </div>
      </div>
    `;
  }

  private buildDatePills(): string {
    return this.availableDates.map((date, i) => {
      const [y, m, d] = date.split('-').map(Number);
      const dt  = new Date(y, m - 1, d);
      const day = dt.toLocaleDateString('en-US', { weekday: 'short' });
      const num = dt.toLocaleDateString('en-US', { day: '2-digit' });
      const mon = dt.toLocaleDateString('en-US', { month: 'short' });
      const active = date === this.selectedDate ? ' date-pill--active' : '';
      return `<button class="date-pill${active}" data-date="${date}">
                <span class="date-pill__day">${day}</span>
                <span class="date-pill__num">${num}</span>
                <span class="date-pill__mon">${mon}</span>
              </button>`;
    }).join('');
  }

  private buildTimePills(): string {
    if (this.availableTimes.length === 0) {
      return '<p class="detail-empty">No showtimes available</p>';
    }
    return this.availableTimes.map(t => {
      const active = t === this.selectedTime ? ' time-pill--active' : '';
      return `<button class="time-pill${active}" data-time="${t}">${t}</button>`;
    }).join('');
  }

  private refreshTimes(): void {
    const shows = this.movieService.getShowtimesForMovie(
      this.movie.id, this.selectedTheaterId, this.selectedDate
    );
    this.availableTimes = shows.map(s => s.time);
    this.selectedTime   = this.availableTimes[0] ?? '';
  }

  private refreshDatePills(main: HTMLElement): void {
    const container = main.querySelector('#date-pills') as HTMLElement;
    if (container) container.innerHTML = this.buildDatePills();
  }

  private refreshTimePills(main: HTMLElement): void {
    const container = main.querySelector('#time-pills') as HTMLElement;
    if (container) container.innerHTML = this.buildTimePills();
  }

  private refreshBookingCard(main: HTMLElement): void {
    const card    = main.querySelector('#booking-card') as HTMLElement;
    const theater = this.theaters.find(t => t.id === this.selectedTheaterId);
    if (!card || !theater) return;

    if (!this.selectedTime) {
      card.innerHTML = '<p class="booking-card__empty">Select a date and time to continue.</p>';
      return;
    }

    const shows = this.movieService.getShowtimesForMovie(
      this.movie.id, this.selectedTheaterId, this.selectedDate
    );
    const show: Showtime | undefined = shows.find(s => s.time === this.selectedTime);
    if (!show) return;

    card.innerHTML = `
      <h3 class="booking-card__theater">${theater.name}</h3>
      <p  class="booking-card__date">${show.dateFormatted}</p>
      <p  class="booking-card__time">${show.time}</p>
      <p  class="booking-card__address">${theater.address}</p>
      <div class="booking-card__price-row">
        <span class="booking-card__price-label">Price per seat</span>
        <span class="booking-card__price">$${show.price.toFixed(2)}</span>
      </div>
      <button class="btn btn--primary btn--full" id="btn-proceed">Proceed</button>
    `;

    card.querySelector('#btn-proceed')?.addEventListener('click', () => {
      this.bookingService.savePending({
        movieId:       this.movie.id,
        theaterId:     theater.id,
        date:          this.selectedDate,
        time:          this.selectedTime,
        price:         show.price,
        movieTitle:    this.movie.title,
        theaterName:   theater.name,
        theaterAddress: theater.address,
      });
      Router.navigateTo('/seat.html');
    });
  }

  private bindEvents(main: HTMLElement): void {
    // Theater tabs
    main.querySelector('#theater-tabs')?.addEventListener('click', (e: Event) => {
      const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-theater]');
      if (!btn) return;
      this.selectedTheaterId = Number(btn.dataset['theater']);
      main.querySelectorAll('.theater-tab').forEach(b => b.classList.remove('theater-tab--active'));
      btn.classList.add('theater-tab--active');
      this.availableDates = this.movieService.getAvailableDates(this.movie.id, this.selectedTheaterId);
      this.selectedDate   = this.availableDates[0] ?? '';
      this.refreshTimes();
      this.refreshDatePills(main);
      this.refreshTimePills(main);
      this.refreshBookingCard(main);
    });

    // Date pills
    main.querySelector('#date-pills')?.addEventListener('click', (e: Event) => {
      const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-date]');
      if (!btn) return;
      this.selectedDate = btn.dataset['date'] ?? '';
      main.querySelectorAll('.date-pill').forEach(b => b.classList.remove('date-pill--active'));
      btn.classList.add('date-pill--active');
      this.refreshTimes();
      this.refreshTimePills(main);
      this.refreshBookingCard(main);
    });

    // Time pills
    main.addEventListener('click', (e: Event) => {
      const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-time]');
      if (!btn) return;
      this.selectedTime = btn.dataset['time'] ?? '';
      main.querySelectorAll('.time-pill').forEach(b => b.classList.remove('time-pill--active'));
      btn.classList.add('time-pill--active');
      this.refreshBookingCard(main);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new MovieDetailPage().render());
