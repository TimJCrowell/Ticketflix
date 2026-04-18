import { BasePage } from './BasePage.js';
import { SeatGrid } from '../components/SeatGrid.js';
import { BookingService } from '../services/BookingService.js';
import { Seat } from '../models/Seat.js';
import { Router } from '../services/Router.js';

const ROWS = ['A','B','C','D','E','F','G','H'];
const COLS = 14;

export class SeatSelectionPage extends BasePage {
  private bookingService = BookingService.getInstance();
  private seatGrid!: SeatGrid;
  private selected: Seat[] = [];

  render(): void {
    const pending = this.bookingService.getPending();
    if (!pending) { Router.navigateTo('/home.html'); return; }

    const page = this.scaffold('seat-page');

    const main = document.createElement('main');
    main.className = 'seat-main';
    main.innerHTML = `
      <h1 class="seat-title">Seat</h1>
      <div id="seat-grid-container" class="seat-grid-container"></div>
    `;
    page.appendChild(main);

    // Bottom bar
    const bar = document.createElement('footer');
    bar.className = 'seat-bar';
    bar.innerHTML = `
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
        <button class="btn btn--primary" id="btn-payment" disabled>Proceed Payment</button>
      </div>
    `;
    page.appendChild(bar);

    // Render seat grid
    const gridContainer = main.querySelector('#seat-grid-container') as HTMLElement;
    const seats = this.bookingService.generateSeats(ROWS, COLS);
    this.seatGrid = new SeatGrid(seats, (sel: Seat[]) => this.onSelectionChange(sel, pending.price));
    this.seatGrid.render(gridContainer);

    this.bindBarEvents(bar, pending.price);
  }

  private onSelectionChange(selected: Seat[], pricePerSeat: number): void {
    this.selected = selected;
    const total   = (selected.length * pricePerSeat).toFixed(2);
    const labels  = selected.length ? selected.map(s => s.label).join(', ') : '—';

    const barTotal = document.getElementById('bar-total');
    const barSeats = document.getElementById('bar-seats');
    const btnPay   = document.getElementById('btn-payment') as HTMLButtonElement;

    if (barTotal) barTotal.textContent = `$${total}`;
    if (barSeats) barSeats.textContent = labels;
    if (btnPay)   btnPay.disabled = selected.length === 0;
  }

  private bindBarEvents(bar: HTMLElement, pricePerSeat: number): void {
    bar.querySelector('#btn-back')?.addEventListener('click', () => {
      Router.navigateTo('/movie.html');
    });

    bar.querySelector('#btn-payment')?.addEventListener('click', async () => {
      if (this.selected.length === 0) return;

      const btn = bar.querySelector('#btn-payment') as HTMLButtonElement;
      btn.disabled = true;
      btn.textContent = 'Processing…';

      // Stub confirm
      await new Promise(r => setTimeout(r, 700));

      this.bookingService.clearPending();
      alert(`Booking confirmed!\nSeats: ${this.selected.map(s => s.label).join(', ')}\nTotal: $${(this.selected.length * pricePerSeat).toFixed(2)}`);
      Router.navigateTo('/home.html');
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new SeatSelectionPage().render());
