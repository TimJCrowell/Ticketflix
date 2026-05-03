import { BasePage } from './BasePage.js';
import { BookingService } from '../services/BookingService.js';
import { Router } from '../services/Router.js';

export class OrderDetailPage extends BasePage {
  private bookingService = BookingService.getInstance();

  render(): void {
    const pending = this.bookingService.getPending();
    if (!pending) { Router.navigateTo('/home.html'); return; }

    const rawSeats = sessionStorage.getItem('ticketflix_seats');
    const seats: string[] = rawSeats ? JSON.parse(rawSeats) : [];
    const subtotal = pending.price * seats.length;
    const serviceCharge = subtotal * 0.05;
    const total = subtotal + serviceCharge;

    const page = this.scaffold('order-page');

    const main = document.createElement('main');
    main.className = 'order-main';
    main.innerHTML = `
      <div class="order-card">
        <h1 class="order-card__title">Order Detail</h1>
        <div class="order-rows">
          <div class="order-row">
            <span class="order-row__label">Movie</span>
            <span class="order-row__value">${pending.movieTitle}</span>
          </div>
          <div class="order-row">
            <span class="order-row__label">Date</span>
            <span class="order-row__value">${pending.date}</span>
          </div>
          <div class="order-row">
            <span class="order-row__label">Time</span>
            <span class="order-row__value">${pending.time}</span>
          </div>
          <div class="order-row">
            <span class="order-row__label">Theater</span>
            <span class="order-row__value">${pending.theaterName}</span>
          </div>
          <div class="order-row">
            <span class="order-row__label">Seats</span>
            <span class="order-row__value">${seats.length ? seats.join(', ') : '—'}</span>
          </div>
          <div class="order-row">
            <span class="order-row__label">Price / Seat</span>
            <span class="order-row__value">$${pending.price.toFixed(2)}</span>
          </div>
          <div class="order-row">
            <span class="order-row__label">Service Charge (5%)</span>
            <span class="order-row__value">$${serviceCharge.toFixed(2)}</span>
          </div>
          <div class="order-row order-row--total">
            <span class="order-row__label">Total</span>
            <span class="order-row__value">$${total.toFixed(2)}</span>
          </div>
        </div>
        <button class="btn btn--primary btn--full" id="btn-checkout">Checkout Ticket</button>
      </div>
    `;
    page.appendChild(main);

    main.querySelector('#btn-checkout')?.addEventListener('click', () => {
      Router.navigateTo('/payment.html');
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new OrderDetailPage().render());
