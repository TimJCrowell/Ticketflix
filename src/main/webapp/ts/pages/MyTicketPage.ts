import { BasePage } from './BasePage.js';
import { BookingService } from '../services/BookingService.js';
import { Router } from '../services/Router.js';

export class MyTicketPage extends BasePage {
  private bookingService = BookingService.getInstance();

  render(): void {
    const pending = this.bookingService.getPending();
    if (!pending) { Router.navigateTo('/home.html'); return; }

    const rawSeats = sessionStorage.getItem('ticketflix_seats');
    const seats: string[] = rawSeats ? JSON.parse(rawSeats) : [];
    const total = pending.price * seats.length * 1.05;

    const page = this.scaffold('ticket-page');

    const main = document.createElement('main');
    main.className = 'ticket-main';
    main.innerHTML = `
      <div class="ticket-card">
        <div class="ticket-card__header">
          <span class="ticket-card__brand">TicketFlix</span>
          <span class="ticket-card__badge">CONFIRMED</span>
        </div>
        <div class="ticket-rows">
          <div class="ticket-row">
            <span class="ticket-row__label">Movie</span>
            <span class="ticket-row__value">${pending.movieTitle}</span>
          </div>
          <div class="ticket-row">
            <span class="ticket-row__label">Date</span>
            <span class="ticket-row__value">${pending.date}</span>
          </div>
          <div class="ticket-row">
            <span class="ticket-row__label">Time</span>
            <span class="ticket-row__value">${pending.time}</span>
          </div>
          <div class="ticket-row">
            <span class="ticket-row__label">Seats</span>
            <span class="ticket-row__value">${seats.length ? seats.join(', ') : '—'}</span>
          </div>
          <div class="ticket-row ticket-row--total">
            <span class="ticket-row__label">Total Paid</span>
            <span class="ticket-row__value">$${total.toFixed(2)}</span>
          </div>
        </div>
        <div class="ticket-actions">
          <button class="btn btn--ghost btn--full" id="btn-download">Download Ticket</button>
          <button class="btn btn--primary btn--full" id="btn-home">Back to Homepage</button>
        </div>
      </div>
    `;
    page.appendChild(main);

    main.querySelector('#btn-download')?.addEventListener('click', () => {
      alert('Downloading ticket...');
    });
    main.querySelector('#btn-home')?.addEventListener('click', () => {
      this.bookingService.clearPending();
      Router.navigateTo('/home.html');
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new MyTicketPage().render());
