export interface User {
  email: string;
  firstName: string;
  role: string;
  token?: string;
}

export class AuthService {
  private static instance: AuthService;
  private static readonly STORAGE_KEY = 'ticketflix_user';

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async register(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    dateOfBirth: string;
  }): Promise<{ ok: boolean; message: string }> {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, role: 'CUSTOMER' })
      });
      const text = await res.text();
      return { ok: res.ok, message: text };
    } catch {
      return { ok: false, message: 'Could not reach the server. Please try again.' };
    }
  }

  async login(email: string, password: string): Promise<{ ok: boolean; message: string }> {
    try {
      const emailRes = await fetch('/api/auth/login/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (emailRes.status === 404) return { ok: false, message: 'No account found for that email.' };
      if (!emailRes.ok)           return { ok: false, message: 'Unexpected server error.' };

      const passRes = await fetch('/api/auth/login/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role: 'CUSTOMER', password })
      });
      if (!passRes.ok) return { ok: false, message: 'Invalid email or password.' };

      const data = await passRes.json() as { token: string };
      const user: User = { email, firstName: '', role: 'CUSTOMER', token: data.token };
      sessionStorage.setItem(AuthService.STORAGE_KEY, JSON.stringify(user));
      return { ok: true, message: '' };
    } catch {
      return { ok: false, message: 'Could not reach the server. Please try again.' };
    }
  }

  getUser(): User | null {
    const raw = sessionStorage.getItem(AuthService.STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  }

  isLoggedIn(): boolean {
    return this.getUser() !== null;
  }

  logout(): void {
    sessionStorage.removeItem(AuthService.STORAGE_KEY);
  }
}
