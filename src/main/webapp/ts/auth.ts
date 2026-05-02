// --- State ---
let loginEmail = '';
let loginRole = '';

// --- Session storage ---

/**
 * Persists a session to localStorage after a successful login.
 *
 * @param token     - Snowflake token string returned by the server.
 * @param rawKey    - Base64-encoded HMAC key returned by the server.
 * @param expiresAt - ISO-8601 expiry timestamp returned by the server.
 */
function saveSession(token: string, rawKey: string, expiresAt: string): void {
    localStorage.setItem('tf_token', token);
    localStorage.setItem('tf_rawKey', rawKey);
    localStorage.setItem('tf_expiresAt', expiresAt);
}

/**
 * Removes all session keys from localStorage, effectively logging the user out
 * on the client side.
 */
function clearSession(): void {
    localStorage.removeItem('tf_token');
    localStorage.removeItem('tf_rawKey');
    localStorage.removeItem('tf_expiresAt');
}

/**
 * Reads the stored session from localStorage and updates the session-box
 * display. Shows the box when a session is present; hides it otherwise.
 */
function renderStoredSession(): void {
    const token     = localStorage.getItem('tf_token');
    const rawKey    = localStorage.getItem('tf_rawKey');
    const expiresAt = localStorage.getItem('tf_expiresAt');
    const box = document.getElementById('session-box') as HTMLElement;
    if (token && rawKey) {
        (document.getElementById('stored-token')   as HTMLElement).textContent = token;
        (document.getElementById('stored-rawkey')  as HTMLElement).textContent = rawKey;
        (document.getElementById('stored-expires') as HTMLElement).textContent = expiresAt ?? '';
        box.style.display = 'block';
    } else {
        box.style.display = 'none';
    }
}

// --- Utilities ---

/**
 * Shows one named `<section>` and hides all others.
 *
 * @param id - The `id` attribute of the section element to display.
 */
function showSection(id: string): void {
    document.querySelectorAll<HTMLElement>('section').forEach(s => s.style.display = 'none');
    const target = document.getElementById(id);
    if (target) target.style.display = 'block';
}

/**
 * Displays a status message below the nav bar.
 *
 * @param msg     - The message text to display.
 * @param isError - When `true`, renders the message in red.
 */
function setStatus(msg: string, isError = false): void {
    const el = document.getElementById('status') as HTMLElement;
    el.textContent = msg;
    el.style.color = isError ? 'red' : 'black';
}

/** Clears the status message. */
function clearStatus(): void {
    setStatus('');
}

// --- Register ---

/**
 * Handles the register form submission.
 * POSTs to `POST /api/auth/register` and shows the server response as a
 * status message. Resets the form on success.
 *
 * @param e - The form submit event.
 */
async function handleRegister(e: Event): Promise<void> {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const body = {
        firstName:   (form.elements.namedItem('firstName')   as HTMLInputElement).value,
        lastName:    (form.elements.namedItem('lastName')    as HTMLInputElement).value,
        email:       (form.elements.namedItem('email')       as HTMLInputElement).value,
        password:    (form.elements.namedItem('password')    as HTMLInputElement).value,
        dateOfBirth: (form.elements.namedItem('dateOfBirth') as HTMLInputElement).value,
        role:        (form.elements.namedItem('role')        as HTMLSelectElement).value
    };

    try {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const text = await res.text();
        setStatus(text, !res.ok);
        if (res.ok) form.reset();
    } catch {
        setStatus('Could not reach the server. Please try again.', true);
    }
}

// --- Login step 1: email ---

/**
 * Handles login step 1: looks up the roles registered to the submitted email
 * via `POST /api/auth/login/email`.
 *
 * - If the account has exactly one role, skips the role-selection step and
 *   advances directly to the password screen.
 * - If multiple roles exist, renders radio buttons and advances to the
 *   role-selection screen.
 *
 * @param e - The form submit event.
 */
async function handleLoginEmail(e: Event): Promise<void> {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    loginEmail = (form.elements.namedItem('email') as HTMLInputElement).value;

    try {
        const res = await fetch('/api/auth/login/email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: loginEmail })
        });

        if (res.status === 404) {
            setStatus('No account found for that email.', true);
            return;
        }

        if (!res.ok) {
            setStatus('Unexpected server error. Please try again.', true);
            return;
        }

        const data = await res.json() as { roles: string[] };
        clearStatus();

        if (data.roles.length === 1) {
            loginRole = data.roles[0];
            showSection('section-login-password');
        } else {
            const container = document.getElementById('role-options') as HTMLElement;
            container.innerHTML = data.roles
                .map(r => `<label><input type="radio" name="role" value="${r}"> ${r}</label>`)
                .join('<br>');
            showSection('section-login-role');
        }
    } catch {
        setStatus('Could not reach the server. Please try again.', true);
    }
}

// --- Login step 2: role selection (only shown when multiple roles exist) ---

/**
 * Handles login step 2: captures the selected role and advances to the
 * password screen.
 *
 * @param e - The form submit event.
 */
function handleLoginRole(e: Event): void {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const selected = form.elements.namedItem('role') as RadioNodeList;
    if (!selected.value) {
        setStatus('Please select a role.', true);
        return;
    }
    loginRole = selected.value;
    clearStatus();
    showSection('section-login-password');
}

// --- Login step 3: password ---

/**
 * Handles login step 3: submits credentials to `POST /api/auth/login/password`
 * and, on success, saves the session to localStorage and shows the success
 * section with the token and raw key.
 *
 * @param e - The form submit event.
 */
async function handleLoginPassword(e: Event): Promise<void> {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    try {
        const res = await fetch('/api/auth/login/password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: loginEmail, role: loginRole, password })
        });

        if (!res.ok) {
            setStatus('Invalid credentials.', true);
            return;
        }

        const data = await res.json() as { token: string; rawKey: string; expiresAt: string };
        saveSession(data.token, data.rawKey, data.expiresAt);
        (document.getElementById('result-token')   as HTMLElement).textContent = data.token;
        (document.getElementById('result-rawkey')  as HTMLElement).textContent = data.rawKey;
        (document.getElementById('result-expires') as HTMLElement).textContent = data.expiresAt;
        clearStatus();
        form.reset();
        showSection('section-success');
        renderStoredSession();
    } catch {
        setStatus('Could not reach the server. Please try again.', true);
    }
}

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('nav-register')!.addEventListener('click', () => {
        clearStatus();
        showSection('section-register');
    });
    document.getElementById('nav-login')!.addEventListener('click', () => {
        clearStatus();
        loginEmail = '';
        loginRole = '';
        showSection('section-login-email');
    });

    document.getElementById('form-register')!      .addEventListener('submit', handleRegister);
    document.getElementById('form-login-email')!   .addEventListener('submit', handleLoginEmail);
    document.getElementById('form-login-role')!    .addEventListener('submit', handleLoginRole);
    document.getElementById('form-login-password')!.addEventListener('submit', handleLoginPassword);

    document.getElementById('btn-logout')!.addEventListener('click', async () => {
        const token  = localStorage.getItem('tf_token');
        const rawKey = localStorage.getItem('tf_rawKey');
        if (token && rawKey) {
            try {
                const res = await fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token, rawKey })
                });
                if (!res.ok) {
                    setStatus(await res.text(), true);
                    return;
                }
            } catch {
                setStatus('Could not reach the server. Please try again.', true);
                return;
            }
        }
        clearSession();
        renderStoredSession();
        setStatus('Logged out.');
        showSection('section-login-email');
    });

    renderStoredSession();
    showSection('section-register');
});