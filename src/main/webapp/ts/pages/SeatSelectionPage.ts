import { BasePage } from './BasePage.js';
import { SeatGrid } from '../components/SeatGrid.js';
import { BookingService } from '../services/BookingService.js';
import { Seat } from '../models/Seat.js';
import { Router } from '../services/Router.js';

export class SeatSelectionPage extends BasePage {
  private bookingService = BookingService.getInstance();
  private seatGrid!: SeatGrid;
  private selected: Seat[] = [];

  async render(): Promise<void> {
    const pending = this.bookingService.getPending();
    if (!pending) { Router.navigateTo('/index.html'); return; }

    const page = this.scaffold('seat-page');

    const main = document.createElement('main');
    main.className = 'seat-main';
    main.innerHTML = `
      <h1 class="seat-title">Select Seats</h1>
      <div id="seat-grid-container" class="seat-grid-container"></div>
    `;
    page.appendChild(main);

    const bar = document.createElement('footer');
    bar.className = 'seat-bar';
    bar.innerHTML = `
      <div class="seat-bar__row">
        <div class="seat-bar__info">
          <div class="seat-bar__block">
            <span class="seat-bar__label">TOTAL</span>
            <span class="seat-bar__value" id="bar-total">$0.00</span>
          </div>
          <div class="seat-bar__block">
            <span class="seat-bar__label">SEAT</span>
            <span class="seat-bar__value" id="bar-seats">—</span>
          </div>
        </div>
        <div class="seat-bar__actions">
          <button class="btn btn--ghost" id="btn-back">Back</button>
          <input class="seat-bar__card" id="card-input" type="text" inputmode="numeric"
                 maxlength="23" placeholder="Card number" autocomplete="cc-number" style="display:none">
          <button class="btn btn--primary" id="btn-payment" disabled>Proceed to Payment</button>
        </div>
      </div>
      <p class="seat-bar__error" id="bar-error"></p>
    `;
    page.appendChild(bar);

    const seats = await this.bookingService.fetchSeats(pending.showtimeId);
    const gridContainer = main.querySelector('#seat-grid-container') as HTMLElement;
    this.seatGrid = new SeatGrid(seats, (sel: Seat[]) => this.onSelectionChange(sel, pending.price));
    this.seatGrid.render(gridContainer);

    this.bindBarEvents(bar, main, page, pending.showtimeId, pending.price);
  }

  private onSelectionChange(selected: Seat[], pricePerSeat: number): void {
    this.selected = selected;
    const barTotal  = document.getElementById('bar-total');
    const barSeats  = document.getElementById('bar-seats');
    const cardInput = document.getElementById('card-input') as HTMLInputElement;

    if (barTotal) barTotal.textContent = `$${(selected.length * pricePerSeat).toFixed(2)}`;
    if (barSeats) barSeats.textContent  = selected.length ? selected.map(s => s.label).join(', ') : '—';
    if (cardInput) cardInput.style.display = selected.length > 0 ? '' : 'none';

    this.refreshPayButton();
  }

  private refreshPayButton(): void {
    const btn       = document.getElementById('btn-payment') as HTMLButtonElement;
    const cardInput = document.getElementById('card-input')  as HTMLInputElement;
    if (btn) btn.disabled = this.selected.length === 0 || !cardInput?.value.trim();
  }

  private bindBarEvents(
    bar: HTMLElement,
    main: HTMLElement,
    page: HTMLElement,
    showtimeId: string,
    pricePerSeat: number,
  ): void {
    bar.querySelector('#btn-back')?.addEventListener('click', () => Router.navigateTo('/movie.html'));

    const cardInput = bar.querySelector('#card-input') as HTMLInputElement;
    cardInput?.addEventListener('input', () => this.refreshPayButton());

    bar.querySelector('#btn-payment')?.addEventListener('click', async () => {
      const btn = bar.querySelector('#btn-payment') as HTMLButtonElement;
      const errEl = bar.querySelector('#bar-error') as HTMLElement;
      errEl.textContent = '';
      btn.disabled = true;
      btn.textContent = 'Processing…';

      const result = await this.bookingService.confirmBooking(
        showtimeId,
        this.selected,
        cardInput.value.trim(),
      );

      if (result.ok) {
        this.showConfirmation(main, bar, pricePerSeat, result.checkoutId ?? '');
      } else {
        errEl.textContent = result.message;
        btn.disabled = false;
        btn.textContent = 'Proceed to Payment';
      }
    });
  }

  private showConfirmation(
    main: HTMLElement,
    bar: HTMLElement,
    pricePerSeat: number,
    checkoutId: string,
  ): void {
    const pending = this.bookingService.getPending();
    const total   = (this.selected.length * pricePerSeat).toFixed(2);
    const seats   = this.selected.map(s => s.label).join(', ');

    this.bookingService.clearPending();
    bar.style.display = 'none';

    main.innerHTML = `
      <div class="confirm-card">
        <h1 class="confirm-card__title">Booking Confirmed</h1>
        <p  class="confirm-card__movie">${pending?.movieTitle ?? ''}</p>
        <div class="confirm-card__details">
          <div class="confirm-card__row">
            <span class="confirm-card__label">Theater</span>
            <span class="confirm-card__value">${pending?.theaterName ?? ''}</span>
          </div>
          <div class="confirm-card__row">
            <span class="confirm-card__label">Date</span>
            <span class="confirm-card__value">${pending?.date ?? ''}</span>
          </div>
          <div class="confirm-card__row">
            <span class="confirm-card__label">Time</span>
            <span class="confirm-card__value">${pending?.time ?? ''}</span>
          </div>
          <div class="confirm-card__row">
            <span class="confirm-card__label">Seats</span>
            <span class="confirm-card__value">${seats}</span>
          </div>
          <div class="confirm-card__row confirm-card__row--total">
            <span class="confirm-card__label">Total</span>
            <span class="confirm-card__value confirm-card__value--accent">$${total}</span>
          </div>
        </div>
        <p class="confirm-card__id">Order #${checkoutId}</p>
        <button class="btn btn--primary btn--full" id="btn-home">Back to Home</button>
      </div>
    `;
    main.querySelector('#btn-home')?.addEventListener('click', () => Router.navigateTo('/index.html'));
  }
}

document.addEventListener('DOMContentLoaded', () => new SeatSelectionPage().render());
