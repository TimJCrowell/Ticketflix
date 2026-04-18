import { AuthService } from '../services/AuthService.js';
import { Router } from '../services/Router.js';

export class NavBar {
  private authService: AuthService;

  constructor() {
    this.authService = AuthService.getInstance();
  }

  render(parent: HTMLElement): void {
    const nav = document.createElement('nav');
    nav.className = 'navbar';
    nav.innerHTML = `
      <a class="navbar__logo" href="/home.html">TicketFlix</a>
      <div class="navbar__actions">${this.buildActions()}</div>
    `;
    parent.insertBefore(nav, parent.firstChild);
    this.bindEvents(nav);
  }

  private buildActions(): string {
    if (this.authService.isLoggedIn()) {
      return `
        <button class="btn btn--ghost" data-action="my-tickets">My Ticket</button>
        <button class="btn btn--primary" data-action="logout">Logout</button>
      `;
    }
    return `
      <button class="btn btn--ghost"   data-action="login">Login</button>
      <button class="btn btn--primary" data-action="register">Register</button>
    `;
  }

  private bindEvents(nav: HTMLElement): void {
    nav.querySelectorAll<HTMLButtonElement>('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        switch (btn.dataset['action']) {
          case 'login':      Router.navigateTo('/signin.html');   break;
          case 'register':   Router.navigateTo('/register.html'); break;
          case 'logout':
            this.authService.logout();
            Router.navigateTo('/home.html');
            break;
          case 'my-tickets': Router.navigateTo('/home.html');     break;
        }
      });
    });
  }
}
