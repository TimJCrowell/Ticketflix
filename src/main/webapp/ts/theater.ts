function theaterAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('tf_token');
    const rawKey = localStorage.getItem('tf_rawKey');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token && rawKey) {
        headers['Authorization'] = `Bearer ${token}`;
        headers['X-Session-Key'] = rawKey;
    }
    return headers;
}

function showTheaterOutput(data: unknown): void {
    const pre = document.getElementById('theater-output') as HTMLPreElement;
    pre.textContent = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
}

async function theaterFetch(url: string, options: RequestInit = {}): Promise<void> {
    try {
        const res = await fetch(url, options);
        const text = await res.text();
        let parsed: unknown;
        try { parsed = JSON.parse(text); } catch { parsed = text; }
        showTheaterOutput(`HTTP ${res.status}\n\n` + (typeof parsed === 'string' ? parsed : JSON.stringify(parsed, null, 2)));
    } catch (err) {
        showTheaterOutput('Network error: ' + err);
    }
}

document.getElementById('btn-list-theaters')!.addEventListener('click', () => {
    theaterFetch('/api/theaters');
});

document.getElementById('form-get-theater')!.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const id = (form.elements.namedItem('theaterId') as HTMLInputElement).value.trim();
    theaterFetch(`/api/theaters/${id}`);
});

document.getElementById('form-create-theater')!.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const name = (form.elements.namedItem('name') as HTMLInputElement).value.trim();
    theaterFetch('/api/theaters', {
        method: 'POST',
        headers: theaterAuthHeaders(),
        body: JSON.stringify({ name }),
    });
});

document.getElementById('form-delete-theater')!.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const id = (form.elements.namedItem('theaterId') as HTMLInputElement).value.trim();
    theaterFetch(`/api/theaters/${id}`, {
        method: 'DELETE',
        headers: theaterAuthHeaders(),
    });
});

document.getElementById('form-add-room')!.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const id = (form.elements.namedItem('theaterId') as HTMLInputElement).value.trim();
    const number = parseInt((form.elements.namedItem('roomNumber') as HTMLInputElement).value, 10);
    theaterFetch(`/api/theaters/${id}/rooms`, {
        method: 'POST',
        headers: theaterAuthHeaders(),
        body: JSON.stringify({ number }),
    });
});

document.getElementById('form-remove-room')!.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const theaterId = (form.elements.namedItem('theaterId') as HTMLInputElement).value.trim();
    const roomId = (form.elements.namedItem('roomId') as HTMLInputElement).value.trim();
    theaterFetch(`/api/theaters/${theaterId}/rooms/${roomId}`, {
        method: 'DELETE',
        headers: theaterAuthHeaders(),
    });
});