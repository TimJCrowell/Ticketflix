import { BasePage } from './BasePage.js';
import { AuthService } from '../services/AuthService.js';
import { Router } from '../services/Router.js';

export class RegisterPage extends BasePage {
  private auth = AuthService.getInstance();

  render(): void {
    this.root.innerHTML = `
      <div class="auth-page">
        <header class="auth-header">
          <a class="auth-header__logo" href="/home.html">TicketFlix</a>
        </header>
        <main class="auth-center">
          <div class="auth-card">
            <h1 class="auth-card__heading">Create an account</h1>
            <form id="reg-form" class="auth-form" novalidate>
              <input class="auth-input" name="firstName"   type="text"     placeholder="First name"       required>
              <input class="auth-input" name="lastName"    type="text"     placeholder="Last name"        required>
              <input class="auth-input" name="email"       type="email"    placeholder="Email address"    required>
              <input class="auth-input" name="password"    type="password" placeholder="Enter your password" required>
              <input class="auth-input" name="dateOfBirth" type="date"     required>
              <p id="reg-err" class="auth-error"></p>
              <button type="submit" class="btn btn--primary btn--full">Create account</button>
            </form>
            <p class="auth-switch">Already have an account? <a href="/signin.html">Sign In</a></p>
          </div>
        </main>
      </div>
    `;
    this.bindForm();
  }

  private bindForm(): void {
    const form = document.getElementById('reg-form') as HTMLFormElement;
    const err  = document.getElementById('reg-err')  as HTMLElement;

    form.addEventListener('submit', async (e: Event) => {
      e.preventDefault();
      err.textContent = '';
      const f = form.elements;
      const val = (n: string) => (f.namedItem(n) as HTMLInputElement).value;

      const result = await this.auth.register({
        firstName:   val('firstName'),
        lastName:    val('lastName'),
        email:       val('email'),
        password:    val('password'),
        dateOfBirth: val('dateOfBirth'),
      });

      if (result.ok) {
        Router.navigateTo('/signin.html');
      } else {
        err.textContent = result.message;
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new RegisterPage().render());
