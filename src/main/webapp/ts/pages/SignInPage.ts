import { BasePage } from './BasePage.js';
import { AuthService } from '../services/AuthService.js';
import { Router } from '../services/Router.js';

export class SignInPage extends BasePage {
  private auth = AuthService.getInstance();

  render(): void {
    this.root.innerHTML = `
      <div class="auth-page">
        <header class="auth-header">
          <a class="auth-header__logo" href="/home.html">TicketFlix</a>
        </header>
        <main class="auth-center">
          <div class="auth-card">
            <h1 class="auth-card__heading">Sign In</h1>
            <form id="signin-form" class="auth-form" novalidate>
              <input class="auth-input" name="email"    type="email"    placeholder="Email address" required>
              <input class="auth-input" name="password" type="password" placeholder="Password"      required>
              <p id="signin-err" class="auth-error"></p>
              <button type="submit" class="btn btn--primary btn--full">Sign In</button>
            </form>
            <p class="auth-switch">Don't have an account? <a href="/register.html">Register</a></p>
          </div>
        </main>
      </div>
    `;
    this.bindForm();
  }

  private bindForm(): void {
    const form = document.getElementById('signin-form') as HTMLFormElement;
    const err  = document.getElementById('signin-err')  as HTMLElement;

    form.addEventListener('submit', async (e: Event) => {
      e.preventDefault();
      err.textContent = '';
      const f    = form.elements;
      const email    = (f.namedItem('email')    as HTMLInputElement).value;
      const password = (f.namedItem('password') as HTMLInputElement).value;

      const result = await this.auth.login(email, password);
      if (result.ok) {
        Router.navigateTo('/home.html');
      } else {
        err.textContent = result.message;
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new SignInPage().render());
