export interface User {
  email: string;
  firstName: string;
  role: string;
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

  async login(email: string, password: string): Promise<{ ok: boolean; message: string; role?: string }> {
    try {
      const emailRes = await fetch('/api/auth/login/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (emailRes.status === 404) return { ok: false, message: 'No account found for that email.' };
      if (!emailRes.ok)           return { ok: false, message: 'Unexpected server error.' };

      const { roles } = await emailRes.json() as { roles: string[] };
      const role = roles.indexOf('MANAGER') !== -1 ? 'MANAGER' : (roles[0] ?? 'CUSTOMER');

      const passRes = await fetch('/api/auth/login/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role, password })
      });
      if (!passRes.ok) return { ok: false, message: 'Invalid email or password.' };

      const user: User = { email, firstName: '', role };
      sessionStorage.setItem(AuthService.STORAGE_KEY, JSON.stringify(user));
      return { ok: true, message: '', role };
    } catch {
      return { ok: false, message: 'Could not reach the server. Please try again.' };
    }
  }

  getUser(): User | null {
    const raw = sessionStorage.getItem(AuthService.STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  }

  // tf_token is not HttpOnly, so it is readable here and is the authoritative
  // logged-in signal (survives page reloads and new tabs, unlike sessionStorage).
  isLoggedIn(): boolean {
    return document.cookie.split(';').some(c => c.trim().startsWith('tf_token='));
  }

  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // best-effort — clear local state regardless
    }
    sessionStorage.removeItem(AuthService.STORAGE_KEY);
  }
}
