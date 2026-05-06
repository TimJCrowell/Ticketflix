import * as React from "react";
import { useState, useEffect, useRef } from "react";

/**
 * Module Name: ManagerDashboard
 * Date: May 1, 2026
 * Programmer's Name: Benjamin Martinez
 * * Brief description of the class/module:
 * This component serves as the primary administrative dashboard for the TicketFLIX web application.
 * It provides a user interface for managers to view, create, edit, and delete movie records, manage viewing screens, track customer orders, view reports, and manage their account settings.
 * * * Phase 4 Refactoring Notes:
 * - Extracted `getDynamicStatus` out of the component lifecycle.
 * - Refactored `getDynamicStatus` to accept a `referenceDate` dependency injection to allow for deterministic Unit Testing and Independent Path Validation.
 * * * Brief explanation of important functions in each class, including input values and output values:
 * - getDynamicStatus(startDateStr: string, endDateStr: string, referenceDate?: Date): string -> Inputs: start/end date strings, optional reference date. Output: "Active" or "Not Active".
 * - handleDelete(id: string): void -> Inputs: movie ID (string). Output: none. Prompts for confirmation and removes a movie from the state.
 * - openCreateModal(): void -> Inputs: none. Output: none. Clears the form state and opens the modal for a new movie entry.
 * - openEditModal(movie: Movie): void -> Inputs: Movie object. Output: none. Populates the form state with the selected movie's data.
 * - handleScreenSubmit(e: React.FormEvent): void -> Inputs: Event object. Output: none. Evaluates if a screen is being edited or created.
 * - handleSubmit(e: React.FormEvent): void -> Inputs: Event object. Output: none. Evaluates if a movie is being edited or created, updates the state, and closes the modal.
 * * * Any important data structure in class/methods:
 * - Movie (Interface): Defines the exact schema for a movie object.
 * - TheaterScreen (Interface): Defines the schema for screen data.
 * - Order (Interface): Defines the schema for customer checkout transactions.
 * - Tab (Type): A union type enforcing valid string literals for the active tab state.
 */

// --- Data Interfaces ---

export interface Movie {
  id: string;
  title: string;
  description: string;
  durationHrs: string;
  durationMins: string;
  rating: string;
  genre: string;
  imageUrl: string;
  showingSchedule: string;
  endDate: string;
}

export interface TheaterScreen {
  id: string;
  name: string;
  location: string;
  capacity: number;
  status: "Open" | "Maintenance" | "Closed";
}

export interface Order {
  id: string;
  userId: string;
  showtimeId: string;
  checkoutDate: string;
  tickets: number;
  seatLabels: string[];
  total: string;
  status: string;
}

// --- API Types ---

interface ApiMovie {
  id: string;
  name: string;
  runtime: number;
  description: string;
  posterImage: string;
  rating: string;
  genre: string;
}

interface ApiRoom {
  id: string;
  number: number;
}

interface ApiTheater {
  id: string;
  name: string;
  rooms?: ApiRoom[];
}

interface ApiCheckout {
  checkoutId: string;
  userId: string;
  showtimeId: string;
  seatLabels: string[];
  total: number;
  status: string;
  createdAt: string;
}

interface ApiShowtime {
  id: string;
  datetime: string;
  movieId: string;
  roomId: string;
}

// --- Mapping helpers ---

function apiMovieToMovie(m: ApiMovie): Movie {
  return {
    id: m.id,
    title: m.name ?? '',
    description: m.description ?? '',
    durationHrs: String(Math.floor((m.runtime ?? 0) / 60)),
    durationMins: String((m.runtime ?? 0) % 60),
    rating: m.rating ?? '',
    genre: m.genre ?? '',
    imageUrl: m.posterImage ?? '',
    showingSchedule: '',
    endDate: '',
  };
}

function apiTheaterToScreen(t: ApiTheater): TheaterScreen {
  return { id: t.id, name: t.name, location: '', capacity: 0, status: 'Open' };
}

function apiCheckoutToOrder(c: ApiCheckout): Order {
  const date = c.createdAt ? new Date(c.createdAt).toLocaleString() : '';
  const statusMap: Record<string, string> = {
    COMPLETED: 'Completed', PENDING: 'Pending', CANCELLED: 'Cancelled', CANCELED: 'Cancelled',
  };
  return {
    id: c.checkoutId,
    userId: c.userId,
    showtimeId: c.showtimeId,
    checkoutDate: date,
    tickets: c.seatLabels?.length ?? 0,
    seatLabels: c.seatLabels ?? [],
    total: c.total != null ? String(c.total) : '0.00',
    status: statusMap[c.status?.toUpperCase()] ?? c.status ?? 'Pending',
  };
}

const EMPTY_MOVIE_FORM: Omit<Movie, 'id'> = {
  title: "", description: "", durationHrs: "", durationMins: "", rating: "", genre: "", imageUrl: "", showingSchedule: "", endDate: ""
};

const EMPTY_SCREEN_FORM: Omit<TheaterScreen, 'id'> = {
  name: "", location: "", capacity: 0, status: "Open"
};

type Tab = "Movies" | "Theaters" | "Screens" | "Showtimes" | "Orders" | "Report" | "Account Settings";

// --- REFACTORED UTILITY FUNCTION FOR PHASE 4 TESTING ---
// Extracted out of the component and added a referenceDate parameter.
// This allows testing frameworks (like Jest) to inject mock dates to test independent paths without failing.
export function getDynamicStatus(startDateStr: string, endDateStr: string, referenceDate: Date = new Date()): string {
  if (!startDateStr || !endDateStr) return "Not Active";

  // Clone the reference date so we don't accidentally mutate the original object
  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);

  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  // Independent Path 1: Date is within range -> returns Active
  // Independent Path 2: Date is outside range -> returns Not Active
  if (today >= startDate && today <= endDate) {
    return "Active";
  }
  return "Not Active";
}

export default function ManagerDashboard() {
  // Navigation and Primary Data State
  const [activeTab, setActiveTab] = useState<Tab>("Movies");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [screens, setScreens] = useState<TheaterScreen[]>([]);
  const [theaterData, setTheaterData] = useState<ApiTheater[]>([]);
  const [showtimes, setShowtimes] = useState<ApiShowtime[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [managerEmail, setManagerEmail] = useState<string>('');

  // Dropdown UI State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Movie Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_MOVIE_FORM);

  // Screen Modal State
  const [isScreenModalOpen, setIsScreenModalOpen] = useState(false);
  const [editingScreenId, setEditingScreenId] = useState<string | null>(null);
  const [screenForm, setScreenForm] = useState(EMPTY_SCREEN_FORM);

  // Add Room Modal State
  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
  const [addRoomForm, setAddRoomForm] = useState({ theaterId: '', roomNumber: '' });

  // Showtime Modal State
  const [isShowtimeModalOpen, setIsShowtimeModalOpen] = useState(false);
  const [editingShowtimeId, setEditingShowtimeId] = useState<string | null>(null);
  const [showtimeForm, setShowtimeForm] = useState({ movieId: '', roomId: '', datetime: '' });

  // Poster upload state
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Change-password form state
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [pwMessage, setPwMessage] = useState<{ text: string; ok: boolean } | null>(null);

  // Auth guard: redirect if not logged in as manager
  useEffect(() => {
    const hasToken = document.cookie.split(';').some(c => c.trim().startsWith('tf_token='));
    if (!hasToken) { window.location.href = '/signin.html'; return; }
    const raw = sessionStorage.getItem('ticketflix_user');
    if (raw) {
      try {
        const user = JSON.parse(raw) as { email: string; role: string };
        if (user.role !== 'MANAGER') { window.location.href = '/index.html'; return; }
        setManagerEmail(user.email);
      } catch {}
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    fetch('/api/movies')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((data: ApiMovie[]) => setMovies(data.map(apiMovieToMovie)))
      .catch(() => {});
    fetch('/api/checkout')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((data: ApiCheckout[]) => setOrders(data.map(apiCheckoutToOrder)))
      .catch(() => {});
    fetch('/api/theaters')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((data: ApiTheater[]) => { setScreens(data.map(apiTheaterToScreen)); setTheaterData(data); })
      .catch(() => {});
    fetch('/api/showtimes')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((data: ApiShowtime[]) => setShowtimes(data))
      .catch(() => {});
  }, []);

  // Hook to close the admin dropdown if the user clicks outside of it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    try { await fetch('/api/auth/logout', { method: 'POST' }); } catch {}
    sessionStorage.removeItem('ticketflix_user');
    window.location.href = '/signin.html';
  }

  // --- Movie Handlers ---

  async function handleDelete(id: string) {
    if (confirm("Are you sure you want to delete this movie?")) {
      const res = await fetch(`/api/movies/${id}`, { method: 'DELETE' });
      if (res.ok) setMovies((prev) => prev.filter((m) => m.id !== id));
      else alert('Failed to delete movie.');
    }
  }

  function openCreateModal() {
    setForm(EMPTY_MOVIE_FORM);
    setEditingId(null);
    setPosterFile(null);
    setIsModalOpen(true);
  }

  function openEditModal(movie: Movie) {
    setForm({ ...movie });
    setEditingId(movie.id);
    setPosterFile(null);
    setIsModalOpen(true);
  }

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = {
      name: form.title,
      runtime: (parseInt(form.durationHrs || '0', 10) * 60) + parseInt(form.durationMins || '0', 10),
      description: form.description,
      posterImage: form.imageUrl || null,
      rating: form.rating,
      genre: form.genre,
    };

    let savedMovie: ApiMovie | null = null;
    const isEdit = editingId !== null;

    if (isEdit) {
      const res = await fetch(`/api/movies/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) { savedMovie = await res.json() as ApiMovie; }
      else { alert('Failed to update movie.'); return; }
    } else {
      const res = await fetch('/api/movies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) { savedMovie = await res.json() as ApiMovie; }
      else { alert('Failed to create movie.'); return; }
    }

    if (savedMovie && posterFile) {
      const fd = new FormData();
      fd.append('file', posterFile);
      const uploadRes = await fetch(`/api/movies/${savedMovie.id}/poster`, { method: 'POST', body: fd });
      if (uploadRes.ok) { savedMovie = await uploadRes.json() as ApiMovie; }
    }

    if (savedMovie) {
      if (isEdit) {
        setMovies(prev => prev.map(m => m.id === editingId ? apiMovieToMovie(savedMovie!) : m));
      } else {
        setMovies(prev => [...prev, apiMovieToMovie(savedMovie!)]);
      }
    }

    setPosterFile(null);
    setIsModalOpen(false);
  }

  // --- Screen Handlers ---

  async function handleDeleteScreen(id: string) {
    if (confirm("Are you sure you want to delete this theater?")) {
      const res = await fetch(`/api/theaters/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setScreens((prev) => prev.filter((s) => s.id !== id));
        setTheaterData((prev) => prev.filter((t) => t.id !== id));
      } else alert('Failed to delete theater.');
    }
  }

  function openCreateScreenModal() {
    setScreenForm(EMPTY_SCREEN_FORM);
    setEditingScreenId(null);
    setIsScreenModalOpen(true);
  }

  function openEditScreenModal(screen: TheaterScreen) {
    setScreenForm({ ...screen });
    setEditingScreenId(screen.id);
    setIsScreenModalOpen(true);
  }

  function handleScreenFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setScreenForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleScreenSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingScreenId !== null) {
      // No PUT endpoint for theaters; update local state only
      setScreens(prev => prev.map(s => s.id === editingScreenId ? { ...screenForm, id: editingScreenId } as TheaterScreen : s));
    } else {
      const res = await fetch('/api/theaters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: screenForm.name }),
      });
      if (res.ok) {
        const created: ApiTheater = await res.json();
        setScreens(prev => [...prev, { ...screenForm, id: created.id }]);
        setTheaterData(prev => [...prev, created]);
      } else {
        alert('Failed to create theater.');
      }
    }
    setIsScreenModalOpen(false);
  }

  // --- Showtime Handlers ---

  async function handleDeleteShowtime(id: string) {
    if (confirm("Are you sure you want to delete this showtime?")) {
      const res = await fetch(`/api/showtimes/${id}`, { method: 'DELETE' });
      if (res.ok) setShowtimes(prev => prev.filter(s => s.id !== id));
      else alert('Failed to delete showtime.');
    }
  }

  function openCreateShowtimeModal() {
    setShowtimeForm({ movieId: movies[0]?.id ?? '', roomId: '', datetime: '' });
    setEditingShowtimeId(null);
    setIsShowtimeModalOpen(true);
  }

  function openEditShowtimeModal(st: ApiShowtime) {
    setShowtimeForm({ movieId: st.movieId, roomId: st.roomId, datetime: st.datetime.slice(0, 16) });
    setEditingShowtimeId(st.id);
    setIsShowtimeModalOpen(true);
  }

  async function handleShowtimeSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = { movieId: showtimeForm.movieId, roomId: showtimeForm.roomId, datetime: showtimeForm.datetime };
    if (editingShowtimeId !== null) {
      const res = await fetch(`/api/showtimes/${editingShowtimeId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      if (res.ok) {
        const updated: ApiShowtime = await res.json();
        setShowtimes(prev => prev.map(s => s.id === editingShowtimeId ? updated : s));
      } else alert('Failed to update showtime.');
    } else {
      const res = await fetch('/api/showtimes', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      if (res.ok) {
        const created: ApiShowtime = await res.json();
        setShowtimes(prev => [...prev, created]);
      } else alert('Failed to create showtime.');
    }
    setIsShowtimeModalOpen(false);
  }

  async function handleDeleteRoom(theaterId: string, roomId: string) {
    if (!confirm("Delete this room?")) return;
    const res = await fetch(`/api/theaters/${theaterId}/rooms/${roomId}`, { method: 'DELETE' });
    if (res.ok) {
      setTheaterData(prev => prev.map(t =>
        t.id === theaterId ? { ...t, rooms: (t.rooms ?? []).filter(r => r.id !== roomId) } : t
      ));
    } else {
      alert('Failed to delete room.');
    }
  }

  async function handleAddRoomSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`/api/theaters/${addRoomForm.theaterId}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ number: parseInt(addRoomForm.roomNumber, 10) }),
    });
    if (res.ok) {
      const updated: ApiTheater = await res.json();
      setTheaterData(prev => prev.map(t => t.id === updated.id ? updated : t));
    } else {
      alert('Failed to add room.');
    }
    setIsAddRoomModalOpen(false);
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwMessage(null);
    if (pwForm.newPw !== pwForm.confirm) {
      setPwMessage({ text: 'New passwords do not match.', ok: false });
      return;
    }
    if (!pwForm.newPw) {
      setPwMessage({ text: 'New password must not be empty.', ok: false });
      return;
    }
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.newPw }),
      });
      const text = await res.text();
      if (res.ok) {
        setPwForm({ current: '', newPw: '', confirm: '' });
        setPwMessage({ text: 'Password changed successfully.', ok: true });
      } else {
        setPwMessage({ text: text || 'Failed to change password.', ok: false });
      }
    } catch {
      setPwMessage({ text: 'Could not reach the server.', ok: false });
    }
  }

  return (
    <div className="h-full w-full flex-1 bg-white text-gray-900 font-sans flex flex-col">

      {/* --- Header Section --- */}
      <header className="border-b border-gray-300 flex items-center justify-between px-6 py-4">
        <div className="text-xl font-bold text-gray-800 tracking-wide">TicketFLIX</div>

        {/* Admin Dropdown Container */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1.5 hover:text-gray-600 transition-colors focus:outline-none"
          >
            <span className="font-semibold text-lg">admin panel</span>
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown Menu Items */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 shadow-lg z-50">
              <div className="px-4 py-3 bg-gray-50">
                <p className="text-sm font-semibold text-gray-800">Manager</p>
                <p className="text-xs text-gray-500 truncate">{managerEmail}</p>
              </div>
              <hr className="border-gray-200" />
              <div className="py-1">
                <button
                  onClick={() => { setActiveTab("Account Settings" as Tab); setIsDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Account Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* --- Main Layout Section --- */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left Sidebar Navigation */}
        <aside className="w-48 border-r border-gray-300 bg-white flex flex-col pt-2 shrink-0">
          {(["Movies", "Theaters", "Screens", "Showtimes", "Orders", "Report"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-left px-6 py-3 font-semibold text-lg transition-colors ${
                activeTab === tab ? "bg-[#8b5cf6] text-white" : "hover:bg-gray-100 text-black"
              }`}
            >
              {tab}
            </button>
          ))}
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-8 overflow-y-auto bg-gray-50/30">

          {/* --- Movies View --- */}
          {activeTab === "Movies" && (
            <div className="max-w-6xl">
              <div className="flex justify-between items-end mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Admin Movies</h2>
                <button
                  onClick={openCreateModal}
                  className="bg-[#5b21b6] hover:bg-[#4c1d95] text-white px-4 py-2 text-sm font-medium rounded-sm shadow-sm transition-colors"
                >
                  + Create new
                </button>
              </div>

              <div className="border border-gray-300 bg-white overflow-x-auto">
                <table className="w-full min-w-[500px] text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-300">
                      <th className="p-3 border-r border-gray-300 w-24 font-medium">Cover</th>
                      <th className="p-3 border-r border-gray-300 font-medium">Title</th>
                      <th className="p-3 font-medium text-center w-40">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movies.map((movie) => {
                      return (
                        <tr key={movie.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                          <td className="p-3 border-r border-gray-300">
                            <img
                              src={movie.imageUrl || "https://via.placeholder.com/150x200?text=No+Cover"}
                              alt="cover"
                              className="w-12 h-16 object-cover mx-auto shadow-sm"
                            />
                          </td>
                          <td className="p-3 border-r border-gray-300 font-medium">{movie.title}</td>
                          <td className="p-3">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => openEditModal(movie)}
                                className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 text-xs font-bold rounded shadow-sm transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(movie.id)}
                                className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded shadow-sm transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {movies.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-500 italic">No movies found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* --- Theaters View --- */}
          {activeTab === "Theaters" && (
            <div className="max-w-6xl">
              <div className="flex justify-between items-end mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Theaters</h2>
                <button
                  onClick={openCreateScreenModal}
                  className="bg-[#5b21b6] hover:bg-[#4c1d95] text-white px-4 py-2 text-sm font-medium rounded-sm shadow-sm transition-colors"
                >
                  + Add Theater
                </button>
              </div>

              <div className="border border-gray-300 bg-white overflow-x-auto">
                <table className="w-full min-w-[400px] text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-300">
                      <th className="p-3 border-r border-gray-300 font-medium">Theater Name</th>
                      <th className="p-3 font-medium text-center w-40">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {screens.map((screen) => (
                      <tr key={screen.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                        <td className="p-3 border-r border-gray-300 font-bold text-gray-800">{screen.name}</td>
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openEditScreenModal(screen)}
                              className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 text-xs font-bold rounded shadow-sm transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteScreen(screen.id)}
                              className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded shadow-sm transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {screens.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-500 italic">No screens configured.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* --- Screens View --- */}
          {activeTab === "Screens" && (
            <div className="max-w-6xl">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Screens</h2>
                  <p className="text-sm text-gray-500">Rooms configured under each theater.</p>
                </div>
                <button
                  onClick={() => {
                    setAddRoomForm({ theaterId: theaterData[0]?.id ?? '', roomNumber: '' });
                    setIsAddRoomModalOpen(true);
                  }}
                  className="bg-[#5b21b6] hover:bg-[#4c1d95] text-white px-4 py-2 text-sm font-medium rounded-sm shadow-sm transition-colors"
                >
                  + Add Screen
                </button>
              </div>

              <div className="border border-gray-300 bg-white overflow-x-auto">
                <table className="w-full min-w-[600px] text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-300">
                      <th className="p-3 border-r border-gray-300 font-medium">Theater</th>
                      <th className="p-3 font-medium">Rooms</th>
                    </tr>
                  </thead>
                  <tbody>
                    {theaterData.map((theater) => (
                      <tr key={theater.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                        <td className="p-3 border-r border-gray-300 font-bold text-gray-800 align-top">{theater.name}</td>
                        <td className="p-3">
                          {theater.rooms && theater.rooms.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {theater.rooms
                                .slice()
                                .sort((a, b) => a.number - b.number)
                                .map(room => (
                                  <span key={room.id} className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium bg-gray-100 text-gray-700">
                                    Room {room.number}
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteRoom(theater.id, room.id)}
                                      className="ml-0.5 text-gray-400 hover:text-red-500 leading-none focus:outline-none"
                                      title="Delete room"
                                    >
                                      &times;
                                    </button>
                                  </span>
                                ))}
                            </div>
                          ) : (
                            <span className="text-gray-400 italic text-xs">No rooms</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {theaterData.length === 0 && (
                      <tr>
                        <td colSpan={2} className="p-8 text-center text-gray-500 italic">No theaters found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* --- Showtimes View --- */}
          {activeTab === "Showtimes" && (
            <div className="max-w-6xl">
              <div className="flex justify-between items-end mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Showtimes</h2>
                <button
                  onClick={openCreateShowtimeModal}
                  className="bg-[#5b21b6] hover:bg-[#4c1d95] text-white px-4 py-2 text-sm font-medium rounded-sm shadow-sm transition-colors"
                >
                  + Add Showtime
                </button>
              </div>

              <div className="border border-gray-300 bg-white overflow-x-auto">
                <table className="w-full min-w-[700px] text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-300">
                      <th className="p-3 border-r border-gray-300 font-medium">Date &amp; Time</th>
                      <th className="p-3 border-r border-gray-300 font-medium">Movie</th>
                      <th className="p-3 border-r border-gray-300 font-medium">Theater / Room</th>
                      <th className="p-3 font-medium text-center w-40">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {showtimes
                      .slice()
                      .sort((a, b) => a.datetime.localeCompare(b.datetime))
                      .map(st => {
                        const movie = movies.find(m => m.id === st.movieId);
                        const theater = theaterData.find(t => t.rooms && t.rooms.some(r => r.id === st.roomId));
                        const room = theater?.rooms?.find(r => r.id === st.roomId);
                        const dt = new Date(st.datetime);
                        const dateStr = dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
                        const timeStr = dt.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
                        return (
                          <tr key={st.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                            <td className="p-3 border-r border-gray-300">
                              <div className="font-medium">{dateStr}</div>
                              <div className="text-xs text-gray-500">{timeStr}</div>
                            </td>
                            <td className="p-3 border-r border-gray-300 font-medium">
                              {movie ? movie.title : <span className="text-gray-400 text-xs">{st.movieId.slice(0, 10)}…</span>}
                            </td>
                            <td className="p-3 border-r border-gray-300">
                              {theater
                                ? <span>{theater.name}{room ? ` — Room ${room.number}` : ''}</span>
                                : <span className="text-gray-400 text-xs">{st.roomId.slice(0, 10)}…</span>}
                            </td>
                            <td className="p-3">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => openEditShowtimeModal(st)}
                                  className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 text-xs font-bold rounded shadow-sm transition-colors"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteShowtime(st.id)}
                                  className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded shadow-sm transition-colors"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    {showtimes.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-gray-500 italic">No showtimes scheduled.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* --- Orders View --- */}
          {activeTab === "Orders" && (
            <div className="max-w-6xl">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Recent Orders</h2>
                <p className="text-sm text-gray-500">View customer checkouts and booking information.</p>
              </div>

              <div className="border border-gray-300 bg-white overflow-x-auto">
                <table className="w-full min-w-[800px] text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-300">
                      <th className="p-3 border-r border-gray-300 font-medium w-24">Order ID</th>
                      <th className="p-3 border-r border-gray-300 font-medium">User ID</th>
                      <th className="p-3 border-r border-gray-300 font-medium">Showtime</th>
                      <th className="p-3 border-r border-gray-300 font-medium">Seats</th>
                      <th className="p-3 border-r border-gray-300 font-medium text-center w-16">Tickets</th>
                      <th className="p-3 font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => {
                      const st = showtimes.find(s => s.id === order.showtimeId);
                      const movie = st ? movies.find(m => m.id === st.movieId) : undefined;
                      const theater = st ? theaterData.find(t => t.rooms && t.rooms.some(r => r.id === st.roomId)) : undefined;
                      const room = theater?.rooms?.find(r => r.id === st?.roomId);
                      const dt = st ? new Date(st.datetime) : null;
                      const dateStr = dt ? dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : null;
                      const timeStr = dt ? dt.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : null;
                      return (
                      <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                        <td className="p-3 border-r border-gray-300 font-mono text-gray-600 text-xs">#{order.id}</td>
                        <td className="p-3 border-r border-gray-300 font-mono text-gray-600 text-xs">#{order.userId}</td>
                        <td className="p-3 border-r border-gray-300">
                          {movie && <div className="font-medium text-gray-800">{movie.title}</div>}
                          {theater && <div className="text-xs text-gray-600">{theater.name}{room ? ` — Room ${room.number}` : ''}</div>}
                          {dateStr && <div className="text-xs text-gray-500">{dateStr} {timeStr}</div>}
                          <div className="font-mono text-xs text-gray-400">#{order.showtimeId}</div>
                        </td>
                        <td className="p-3 border-r border-gray-300 text-xs font-mono text-gray-700">{order.seatLabels.join(', ')}</td>
                        <td className="p-3 border-r border-gray-300 text-center font-bold">{order.tickets}</td>
                        <td className="p-3 font-medium">${order.total}</td>
                      </tr>
                      );
                    })}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-500 italic">No orders found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* --- Report View --- */}
          {activeTab === "Report" && (
            <div className="max-w-6xl">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Dashboard Reports</h2>
                <p className="text-sm text-gray-500">High-level summary of system performance and sales.</p>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white border border-gray-300 p-6 shadow-sm rounded-sm">
                  <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Total Revenue</div>
                  <div className="text-3xl font-bold text-gray-800">
                    ${orders.reduce((sum, o) => sum + parseFloat(o.total || '0'), 0).toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500 font-medium mt-2">Across all orders</div>
                </div>

                <div className="bg-white border border-gray-300 p-6 shadow-sm rounded-sm">
                  <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Tickets Sold</div>
                  <div className="text-3xl font-bold text-gray-800">
                    {orders.reduce((sum, o) => sum + o.tickets, 0)}
                  </div>
                  <div className="text-xs text-gray-500 font-medium mt-2">Across {orders.length} orders</div>
                </div>

                <div className="bg-white border border-gray-300 p-6 shadow-sm rounded-sm">
                  <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Active Movies</div>
                  <div className="text-3xl font-bold text-gray-800">{movies.length}</div>
                  <div className="text-xs text-gray-500 font-medium mt-2">In catalog</div>
                </div>
              </div>

              {/* Placeholder for future charting component */}
              <div className="bg-white border border-gray-300 p-8 shadow-sm rounded-sm flex items-center justify-center min-h-[300px]">
                <div className="text-center">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <h3 className="text-lg font-bold text-gray-700">Sales Chart Visualization</h3>
                  <p className="text-sm text-gray-500 mt-1">Pending implementation of charting library (e.g., Chart.js or Recharts).</p>
                </div>
              </div>
            </div>
          )}

          {/* --- Account Settings View --- */}
          {activeTab === "Account Settings" && (
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Account Settings</h2>

              <div className="bg-white border border-gray-300 shadow-sm p-6">
                <form className="space-y-5" onSubmit={handleChangePassword}>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Email Address</label>
                    <input
                      type="email"
                      defaultValue={managerEmail}
                      readOnly
                      className="w-full border border-gray-300 p-2 text-sm focus:outline-none bg-gray-50 text-gray-500"
                    />
                  </div>

                  <hr className="border-gray-200 my-6" />

                  <h3 className="text-sm font-bold text-gray-800">Change Password</h3>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Current Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={pwForm.current}
                      onChange={e => setPwForm(prev => ({ ...prev, current: e.target.value }))}
                      className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:border-[#8b5cf6] transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">New Password</label>
                      <input
                        type="password"
                        placeholder="Enter new password"
                        value={pwForm.newPw}
                        onChange={e => setPwForm(prev => ({ ...prev, newPw: e.target.value }))}
                        className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:border-[#8b5cf6] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        placeholder="Confirm new password"
                        value={pwForm.confirm}
                        onChange={e => setPwForm(prev => ({ ...prev, confirm: e.target.value }))}
                        className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:border-[#8b5cf6] transition-colors"
                      />
                    </div>
                  </div>

                  {pwMessage && (
                    <p className={`text-sm font-medium ${pwMessage.ok ? 'text-green-600' : 'text-red-600'}`}>
                      {pwMessage.text}
                    </p>
                  )}

                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      className="bg-[#5b21b6] hover:bg-[#4c1d95] text-white px-6 py-2 text-sm font-medium rounded-sm shadow-sm transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* --- Add/Edit Movie Modal --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-[450px] shadow-2xl border border-gray-200">

            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-gray-800 font-bold">
                {editingId ? "Edit Movie" : "Add Movie"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-black font-bold text-xl leading-none focus:outline-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Movie Title</label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleFormChange}
                    required
                    className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleFormChange}
                    rows={3}
                    className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="flex gap-8">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Duration</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        name="durationHrs"
                        value={form.durationHrs}
                        onChange={handleFormChange}
                        placeholder="h"
                        className="w-12 border border-gray-300 p-1.5 text-sm text-center focus:outline-none focus:border-blue-500"
                      />
                      <span className="text-gray-500">:</span>
                      <input
                        type="number"
                        name="durationMins"
                        value={form.durationMins}
                        onChange={handleFormChange}
                        placeholder="m"
                        className="w-12 border border-gray-300 p-1.5 text-sm text-center focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Rating</label>
                    <input
                      type="text"
                      name="rating"
                      value={form.rating}
                      onChange={handleFormChange}
                      placeholder="e.g. PG-13"
                      className="w-full border border-gray-300 p-1.5 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Genre</label>
                  <input
                    type="text"
                    name="genre"
                    value={form.genre}
                    onChange={handleFormChange}
                    placeholder="e.g. Action, Comedy"
                    className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Cover Image</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => setPosterFile(e.target.files?.[0] ?? null)}
                  />
                  <div className="flex items-center gap-3 text-sm">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-gray-100 border border-gray-300 px-3 py-1.5 text-gray-600 rounded-sm hover:bg-gray-200 transition-colors shrink-0"
                    >
                      Upload
                    </button>
                    <span className="text-xs text-gray-500 truncate">
                      {posterFile ? posterFile.name : (form.imageUrl ? 'Current poster set' : 'No file chosen')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-2 border-t border-gray-200 pt-4">
                <button
                  type="submit"
                  className="bg-[#3b82f6] hover:bg-blue-600 text-white px-6 py-1.5 text-sm font-medium rounded-sm shadow-sm transition-colors"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-1.5 text-sm font-medium rounded-sm shadow-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Add/Edit Theater Modal --- */}
      {isScreenModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-[450px] shadow-2xl border border-gray-200">

            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-gray-800 font-bold">
                {editingScreenId ? "Edit Theater" : "Add Theater"}
              </h3>
              <button
                onClick={() => setIsScreenModalOpen(false)}
                className="text-gray-500 hover:text-black font-bold text-xl leading-none focus:outline-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleScreenSubmit} className="p-6">
              <div className="space-y-4">

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Theater Name/Location</label>
                  <input
                    type="text"
                    name="name"
                    value={screenForm.name}
                    onChange={handleScreenFormChange}
                    required
                    placeholder="e.g., Northridge"
                    className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:border-[#8b5cf6] transition-colors"
                  />
                </div>

              </div>

              <div className="mt-8 flex justify-end gap-2 border-t border-gray-200 pt-4">
                <button
                  type="submit"
                  className="bg-[#5b21b6] hover:bg-[#4c1d95] text-white px-6 py-1.5 text-sm font-medium rounded-sm shadow-sm transition-colors"
                >
                  Save Theater
                </button>
                <button
                  type="button"
                  onClick={() => setIsScreenModalOpen(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-1.5 text-sm font-medium rounded-sm shadow-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* --- Add/Edit Showtime Modal --- */}
      {isShowtimeModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-[420px] shadow-2xl border border-gray-200">

            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-gray-800 font-bold">{editingShowtimeId ? "Edit Showtime" : "Add Showtime"}</h3>
              <button onClick={() => setIsShowtimeModalOpen(false)} className="text-gray-500 hover:text-black font-bold text-xl leading-none focus:outline-none">&times;</button>
            </div>

            <form onSubmit={handleShowtimeSubmit} className="p-6">
              <div className="space-y-4">

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Movie</label>
                  <select
                    value={showtimeForm.movieId}
                    onChange={e => setShowtimeForm(prev => ({ ...prev, movieId: e.target.value }))}
                    required
                    className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:border-[#8b5cf6] transition-colors bg-white"
                  >
                    <option value="">— select a movie —</option>
                    {movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Room</label>
                  <select
                    value={showtimeForm.roomId}
                    onChange={e => setShowtimeForm(prev => ({ ...prev, roomId: e.target.value }))}
                    required
                    className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:border-[#8b5cf6] transition-colors bg-white"
                  >
                    <option value="">— select a room —</option>
                    {theaterData.map(t =>
                      (t.rooms ?? []).map(r => (
                        <option key={r.id} value={r.id}>{t.name} — Room {r.number}</option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Date &amp; Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={showtimeForm.datetime}
                    onChange={e => setShowtimeForm(prev => ({ ...prev, datetime: e.target.value }))}
                    className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:border-[#8b5cf6] transition-colors"
                  />
                </div>

              </div>

              <div className="mt-8 flex justify-end gap-2 border-t border-gray-200 pt-4">
                <button type="submit" className="bg-[#5b21b6] hover:bg-[#4c1d95] text-white px-6 py-1.5 text-sm font-medium rounded-sm shadow-sm transition-colors">
                  {editingShowtimeId ? "Save" : "Add Showtime"}
                </button>
                <button type="button" onClick={() => setIsShowtimeModalOpen(false)} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-1.5 text-sm font-medium rounded-sm shadow-sm transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Add Room Modal --- */}
      {isAddRoomModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-[400px] shadow-2xl border border-gray-200">

            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-gray-800 font-bold">Add Screen</h3>
              <button
                onClick={() => setIsAddRoomModalOpen(false)}
                className="text-gray-500 hover:text-black font-bold text-xl leading-none focus:outline-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddRoomSubmit} className="p-6">
              <div className="space-y-4">

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Theater</label>
                  <select
                    value={addRoomForm.theaterId}
                    onChange={e => setAddRoomForm(prev => ({ ...prev, theaterId: e.target.value }))}
                    required
                    className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:border-[#8b5cf6] transition-colors bg-white"
                  >
                    {theaterData.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Room Number</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={addRoomForm.roomNumber}
                    onChange={e => setAddRoomForm(prev => ({ ...prev, roomNumber: e.target.value }))}
                    placeholder="e.g. 4"
                    className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:border-[#8b5cf6] transition-colors"
                  />
                </div>

              </div>

              <div className="mt-8 flex justify-end gap-2 border-t border-gray-200 pt-4">
                <button
                  type="submit"
                  className="bg-[#5b21b6] hover:bg-[#4c1d95] text-white px-6 py-1.5 text-sm font-medium rounded-sm shadow-sm transition-colors"
                >
                  Add Screen
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddRoomModalOpen(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-1.5 text-sm font-medium rounded-sm shadow-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
