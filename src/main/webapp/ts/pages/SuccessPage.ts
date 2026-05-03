import { BasePage } from './BasePage.js';
import { Router } from '../services/Router.js';

export class SuccessPage extends BasePage {
  render(): void {
    const page = this.scaffold('success-page');

    const main = document.createElement('main');
    main.className = 'success-main';
    main.innerHTML = `
      <div class="success-content">
        <div class="success-check">
          <svg viewBox="0 0 52 52" class="success-check__svg" aria-hidden="true">
            <circle class="success-check__circle" cx="26" cy="26" r="25" fill="none"/>
            <path class="success-check__tick" fill="none" d="M14 27 l8 8 l16-16"/>
          </svg>
        </div>
        <h1 class="success-heading">Payment Success</h1>
        <p class="success-sub">Your booking has been confirmed.</p>
        <div class="success-actions">
          <button class="btn btn--primary" id="btn-ticket">View Ticket</button>
          <button class="btn btn--ghost" id="btn-home">Back to Homepage</button>
        </div>
      </div>
    `;
    page.appendChild(main);

    main.querySelector('#btn-ticket')?.addEventListener('click', () => {
      Router.navigateTo('/ticket.html');
    });
    main.querySelector('#btn-home')?.addEventListener('click', () => {
      Router.navigateTo('/home.html');
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new SuccessPage().render());
