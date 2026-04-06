// --- State ---
let loginEmail = '';
let loginRole = '';

// --- Utilities ---
function showSection(id: string): void {
    document.querySelectorAll<HTMLElement>('section').forEach(s => s.style.display = 'none');
    const target = document.getElementById(id);
    if (target) target.style.display = 'block';
}

function setStatus(msg: string, isError = false): void {
    const el = document.getElementById('status') as HTMLElement;
    el.textContent = msg;
    el.style.color = isError ? 'red' : 'black';
}

function clearStatus(): void {
    setStatus('');
}

// --- Register ---
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

        const data = await res.json() as { token: string; expiresAt: string };
        (document.getElementById('result-token')   as HTMLElement).textContent = data.token;
        (document.getElementById('result-expires') as HTMLElement).textContent = data.expiresAt;
        clearStatus();
        form.reset();
        showSection('section-success');
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

    showSection('section-register');
});