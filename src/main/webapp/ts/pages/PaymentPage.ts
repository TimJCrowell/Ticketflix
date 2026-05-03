import { BasePage } from './BasePage.js';
import { BookingService } from '../services/BookingService.js';
import { Router } from '../services/Router.js';

export class PaymentPage extends BasePage {
  private bookingService = BookingService.getInstance();

  render(): void {
    const pending = this.bookingService.getPending();
    if (!pending) { Router.navigateTo('/home.html'); return; }

    const page = this.scaffold('payment-page');

    const main = document.createElement('main');
    main.className = 'payment-main';
    main.innerHTML = `
      <div class="payment-card">
        <h1 class="payment-card__title">Payment</h1>
        <div class="payment-form">
          <div class="payment-field">
            <label class="payment-label" for="card-number">Card Number</label>
            <input class="payment-input" type="text" id="card-number" placeholder="1234 5678 9012 3456" maxlength="19">
          </div>
          <div class="payment-row">
            <div class="payment-field">
              <label class="payment-label" for="card-expiry">Expiration</label>
              <input class="payment-input" type="text" id="card-expiry" placeholder="MM / YY" maxlength="7">
            </div>
            <div class="payment-field">
              <label class="payment-label" for="card-cvv">CVV</label>
              <input class="payment-input" type="text" id="card-cvv" placeholder="123" maxlength="4">
            </div>
          </div>
          <button class="btn btn--primary btn--full" id="btn-purchase">Purchase</button>
        </div>
      </div>
    `;
    page.appendChild(main);

    main.querySelector('#btn-purchase')?.addEventListener('click', () => {
      Router.navigateTo('/success.html');
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new PaymentPage().render());
