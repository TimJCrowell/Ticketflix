/**
 * Builds request headers for manager-only theater API calls.
 *
 * Reads `tf_token` and `tf_rawKey` from localStorage and, when both are
 * present, appends `Authorization: Bearer <token>` and
 * `X-Session-Key: <rawKey>`. If either value is missing the headers are
 * returned without auth, which will result in a 401 from the server.
 *
 * @returns A headers object suitable for passing to `fetch`.
 */
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

/**
 * Writes a value to the `#theater-output` pre element.
 *
 * @param data - A string or any JSON-serializable value to display.
 */
function showTheaterOutput(data: unknown): void {
    const pre = document.getElementById('theater-output') as HTMLPreElement;
    pre.textContent = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
}

/**
 * Sends a fetch request and renders the HTTP status and response body in
 * `#theater-output`. Attempts to pretty-print JSON responses; falls back to
 * raw text when the body is not valid JSON.
 *
 * @param url     - The API endpoint URL.
 * @param options - Optional fetch init options (method, headers, body, etc.).
 */
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

/** GET /api/theaters — lists all theaters with their rooms. */
document.getElementById('btn-list-theaters')!.addEventListener('click', () => {
    theaterFetch('/api/theaters');
});

/** GET /api/theaters/:id — fetches a single theater by Snowflake ID. */
document.getElementById('form-get-theater')!.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const id = (form.elements.namedItem('theaterId') as HTMLInputElement).value.trim();
    theaterFetch(`/api/theaters/${id}`);
});

/**
 * POST /api/theaters — creates a new theater (manager only).
 * Sends `{ name }` in the request body.
 */
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

/** DELETE /api/theaters/:id — deletes a theater and all its rooms (manager only). */
document.getElementById('form-delete-theater')!.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const id = (form.elements.namedItem('theaterId') as HTMLInputElement).value.trim();
    theaterFetch(`/api/theaters/${id}`, {
        method: 'DELETE',
        headers: theaterAuthHeaders(),
    });
});

/**
 * POST /api/theaters/:id/rooms — adds a room to a theater (manager only).
 * Sends `{ number }` with no seatmap, so the server assigns the default
 * 8-row × 14-column grid.
 */
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

/** DELETE /api/theaters/:theaterId/rooms/:roomId — removes a room (manager only). */
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