import * as React from "react";
import { useState, useEffect, useRef } from "react";

/**
 * Module Name: ManagerDashboard
 * Date: May 1, 2026
 * Programmer's Name: Benjamin Martinez
 * * Brief description of the class/module:
 * This component serves as the primary administrative dashboard for the TicketFLIX web application. 
 * It provides a user interface for managers to view, create, edit, and delete movie records, manage viewing screens, track customer orders, view reports, and manage their account settings.
 * * Brief explanation of important functions in each class, including input values and output values:
 * - getDynamicStatus(startDateStr: string, endDateStr: string): string -> Inputs: start and end date strings. Output: "Active" or "Not Active". Compares current date to movie schedule.
 * - handleDelete(id: number): void -> Inputs: movie ID (number). Output: none. Prompts for confirmation and removes a movie from the state.
 * - openCreateModal(): void -> Inputs: none. Output: none. Clears the form state and opens the modal for a new movie entry.
 * - openEditModal(movie: Movie): void -> Inputs: Movie object. Output: none. Populates the form state with the selected movie's data.
 * - handleScreenSubmit(e: React.FormEvent): void -> Inputs: Event object. Output: none. Evaluates if a screen is being edited or created, updates the screens state, and closes the modal.
 * - handleSubmit(e: React.FormEvent): void -> Inputs: Event object. Output: none. Evaluates if a movie is being edited or created, updates the state, and closes the modal.
 * * Any important data structure in class/methods:
 * - Movie (Interface): Defines the exact schema for a movie object, strongly typing the data across the module.
 * - TheaterScreen (Interface): Defines the schema for screen data (capacity, location, status).
 * - Order (Interface): Defines the schema for customer checkout transactions.
 * - Tab (Type): A union type enforcing valid string literals for the active tab state.
 * * Briefly describe any algorithm that you may have used and why did you select it:
 * - Array Filtering (Array.prototype.filter): Used in deletion handlers to remove items safely. Selected over a standard 'for' loop because it guarantees an immutable state update, which is strictly required by React to trigger UI re-renders, operating efficiently at O(N) time complexity.
 * - Date Normalization & Comparison Algorithm: Used in getDynamicStatus to normalize the current Date to midnight, and evaluate if it falls within the start/end boundaries. Selected to dynamically render movie status on the frontend without requiring hardcoded database polling.
 */

// --- Data Interfaces ---

export interface Movie {
  id: number;
  title: string;
  description: string;
  durationHrs: string;
  durationMins: string;
  price: string;
  showingSchedule: string;
  endDate: string;
  imageUrl: string;
}

export interface TheaterScreen {
  id: number;
  name: string;
  location: string;
  capacity: number;
  status: "Open" | "Maintenance" | "Closed";
}

export interface Order {
  id: number;
  customerEmail: string;
  movieTitle: string;
  checkoutDate: string;
  tickets: number;
  total: string;
  status: "Completed" | "Pending" | "Cancelled";
}

// --- Mock Data ---

const INITIAL_MOVIES: Movie[] = [
  {
    id: 1,
    title: "The Matrix",
    description: "Sample Movie",
    durationHrs: "2",
    durationMins: "30",
    price: "15.00",
    showingSchedule: "2026-04-05",
    endDate: "2026-04-16", 
    imageUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=150&h=200&fit=crop",
  }
];

const INITIAL_SCREENS: TheaterScreen[] = [
  { id: 1, name: "Screen 1 (IMAX)", location: "Main Floor, North Wing", capacity: 250, status: "Open" },
  { id: 2, name: "Screen 2", location: "Main Floor, South Wing", capacity: 120, status: "Open" },
  { id: 3, name: "Screen 3", location: "Upper Level", capacity: 80, status: "Maintenance" }
];

const MOCK_ORDERS: Order[] = [
  { id: 10452, customerEmail: "john.doe@example.com", movieTitle: "The Matrix", checkoutDate: "2026-04-15 14:32", tickets: 2, total: "30.00", status: "Completed" },
  { id: 10453, customerEmail: "sarah.smith@example.com", movieTitle: "The Matrix", checkoutDate: "2026-04-16 09:15", tickets: 4, total: "60.00", status: "Pending" },
  { id: 10454, customerEmail: "mike.jones@example.com", movieTitle: "The Matrix", checkoutDate: "2026-04-16 11:05", tickets: 1, total: "15.00", status: "Cancelled" }
];

const EMPTY_MOVIE_FORM: Omit<Movie, 'id'> = {
  title: "", description: "", durationHrs: "", durationMins: "", price: "", showingSchedule: "", endDate: "", imageUrl: ""
};

const EMPTY_SCREEN_FORM: Omit<TheaterScreen, 'id'> = {
  name: "", location: "", capacity: 0, status: "Open"
};

type Tab = "Movies" | "Screens" | "Orders" | "Account Settings";

export default function ManagerDashboard() {
  // Navigation and Primary Data State
  const [activeTab, setActiveTab] = useState<Tab>("Movies");
  const [movies, setMovies] = useState<Movie[]>(INITIAL_MOVIES);
  const [screens, setScreens] = useState<TheaterScreen[]>(INITIAL_SCREENS);
  
  // Dropdown UI State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Movie Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_MOVIE_FORM);

  // Screen Modal State
  const [isScreenModalOpen, setIsScreenModalOpen] = useState(false);
  const [editingScreenId, setEditingScreenId] = useState<number | null>(null);
  const [screenForm, setScreenForm] = useState(EMPTY_SCREEN_FORM);

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

  // --- Utility Functions ---

  function getDynamicStatus(startDateStr: string, endDateStr: string) {
    if (!startDateStr || !endDateStr) return "Not Active";
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    
    if (today >= startDate && today <= endDate) {
      return "Active";
    }
    return "Not Active";
  }

  // --- Movie Handlers ---

  function handleDelete(id: number) {
    if (confirm("Are you sure you want to delete this movie?")) {
      setMovies((prev) => prev.filter((m) => m.id !== id));
    }
  }

  function openCreateModal() {
    setForm(EMPTY_MOVIE_FORM);
    setEditingId(null);
    setIsModalOpen(true);
  }

  function openEditModal(movie: Movie) {
    setForm({ ...movie });
    setEditingId(movie.id);
    setIsModalOpen(true);
  }

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingId !== null) {
      setMovies(prev => prev.map(m => m.id === editingId ? { ...form, id: editingId } : m));
    } else {
      setMovies(prev => [...prev, { ...form, id: Date.now() }]);
    }
    setIsModalOpen(false);
  }

  // --- Screen Handlers ---

  function handleDeleteScreen(id: number) {
    if (confirm("Are you sure you want to delete this screen?")) {
      setScreens((prev) => prev.filter((s) => s.id !== id));
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

  function handleScreenSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingScreenId !== null) {
      setScreens(prev => prev.map(s => s.id === editingScreenId ? { ...screenForm, id: editingScreenId } as TheaterScreen : s));
    } else {
      setScreens(prev => [...prev, { ...screenForm, id: Date.now() } as TheaterScreen]);
    }
    setIsScreenModalOpen(false);
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
                <p className="text-sm font-semibold text-gray-800">Benjamin Martinez</p>
                <p className="text-xs text-gray-500 truncate">admin@ticketflix.com</p>
              </div>
              <hr className="border-gray-200" />
              <div className="py-1">
                <button 
                  onClick={() => { setActiveTab("Account Settings"); setIsDropdownOpen(false); }} 
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Account Settings
                </button>
                <button 
                  onClick={() => alert("Connecting to logout handler...")} 
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
          {(["Movies", "Screens", "Orders"] as Tab[]).map((tab) => (
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
                <table className="w-full min-w-[800px] text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-300">
                      <th className="p-3 border-r border-gray-300 w-12 text-center font-medium">#</th>
                      <th className="p-3 border-r border-gray-300 w-24 font-medium">Cover</th>
                      <th className="p-3 border-r border-gray-300 font-medium">Title</th>
                      <th className="p-3 border-r border-gray-300 font-medium w-32">Status</th>
                      <th className="p-3 font-medium text-center w-40">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movies.map((movie, index) => {
                      const dynamicStatus = getDynamicStatus(movie.showingSchedule, movie.endDate);
                      const isStatusActive = dynamicStatus === "Active";

                      return (
                        <tr key={movie.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                          <td className="p-3 border-r border-gray-300 text-center">{index + 1}</td>
                          <td className="p-3 border-r border-gray-300">
                            <img 
                              src={movie.imageUrl || "https://via.placeholder.com/150x200?text=No+Cover"} 
                              alt="cover" 
                              className="w-12 h-16 object-cover mx-auto shadow-sm" 
                            />
                          </td>
                          <td className="p-3 border-r border-gray-300 font-medium">{movie.title}</td>
                          <td className="p-3 border-r border-gray-300">
                            <span 
                              className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium ${
                                isStatusActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {dynamicStatus}
                            </span>
                          </td>
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

          {/* --- Screens View --- */}
          {activeTab === "Screens" && (
            <div className="max-w-6xl">
              <div className="flex justify-between items-end mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Theater Screens</h2>
                <button 
                  onClick={openCreateScreenModal} 
                  className="bg-[#5b21b6] hover:bg-[#4c1d95] text-white px-4 py-2 text-sm font-medium rounded-sm shadow-sm transition-colors"
                >
                  + Add Screen
                </button>
              </div>

              <div className="border border-gray-300 bg-white overflow-x-auto">
                <table className="w-full min-w-[800px] text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-300">
                      <th className="p-3 border-r border-gray-300 font-medium">Screen Name</th>
                      <th className="p-3 border-r border-gray-300 font-medium">Location</th>
                      <th className="p-3 border-r border-gray-300 font-medium w-32 text-center">Capacity</th>
                      <th className="p-3 border-r border-gray-300 font-medium w-32">Status</th>
                      <th className="p-3 font-medium text-center w-40">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {screens.map((screen) => (
                      <tr key={screen.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                        <td className="p-3 border-r border-gray-300 font-bold text-gray-800">{screen.name}</td>
                        <td className="p-3 border-r border-gray-300 text-gray-600">{screen.location}</td>
                        <td className="p-3 border-r border-gray-300 text-center font-medium">{screen.capacity}</td>
                        <td className="p-3 border-r border-gray-300">
                          <span 
                            className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium ${
                              screen.status === 'Open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {screen.status}
                          </span>
                        </td>
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
                      <th className="p-3 border-r border-gray-300 font-medium">Customer Email</th>
                      <th className="p-3 border-r border-gray-300 font-medium">Movie</th>
                      <th className="p-3 border-r border-gray-300 font-medium text-center w-24">Tickets</th>
                      <th className="p-3 border-r border-gray-300 font-medium">Total</th>
                      <th className="p-3 font-medium w-32">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_ORDERS.map((order) => (
                      <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                        <td className="p-3 border-r border-gray-300 font-mono text-gray-600">#{order.id}</td>
                        <td className="p-3 border-r border-gray-300 font-medium">{order.customerEmail}</td>
                        <td className="p-3 border-r border-gray-300">
                          <div className="font-medium text-gray-800">{order.movieTitle}</div>
                          <div className="text-xs text-gray-500">{order.checkoutDate}</div>
                        </td>
                        <td className="p-3 border-r border-gray-300 text-center font-bold">{order.tickets}</td>
                        <td className="p-3 border-r border-gray-300 font-medium">${order.total}</td>
                        <td className="p-3">
                          <span 
                            className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium ${
                              order.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                              order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* --- Account Settings View --- */}
          {activeTab === "Account Settings" && (
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Account Settings</h2>
              
              <div className="bg-white border border-gray-300 shadow-sm p-6">
                <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); alert("Saved successfully!"); }}>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">First Name</label>
                      <input 
                        type="text" 
                        defaultValue="Benjamin" 
                        className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:border-[#8b5cf6] transition-colors" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Last Name</label>
                      <input 
                        type="text" 
                        defaultValue="Martinez" 
                        className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:border-[#8b5cf6] transition-colors" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Email Address</label>
                    <input 
                      type="email" 
                      defaultValue="admin@ticketflix.com" 
                      className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:border-[#8b5cf6] transition-colors" 
                    />
                  </div>

                  <hr className="border-gray-200 my-6" />

                  <h3 className="text-sm font-bold text-gray-800">Change Password</h3>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Current Password</label>
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:border-[#8b5cf6] transition-colors" 
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">New Password</label>
                      <input 
                        type="password" 
                        placeholder="Enter new password" 
                        className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:border-[#8b5cf6] transition-colors" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Confirm New Password</label>
                      <input 
                        type="password" 
                        placeholder="Confirm new password" 
                        className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:border-[#8b5cf6] transition-colors" 
                      />
                    </div>
                  </div>

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
                        className="w-12 border border-gray-300 p-1.5 text-sm text-center focus:outline-none focus:border-blue-500" 
                      />
                      <span className="text-gray-500">:</span>
                      <input 
                        type="number" 
                        name="durationMins" 
                        value={form.durationMins} 
                        onChange={handleFormChange} 
                        className="w-12 border border-gray-300 p-1.5 text-sm text-center focus:outline-none focus:border-blue-500" 
                      />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Price</label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700 font-medium">$</span>
                      <input 
                        type="number" 
                        step="0.01" 
                        name="price" 
                        value={form.price} 
                        onChange={handleFormChange} 
                        className="w-24 border border-gray-300 p-1.5 text-sm focus:outline-none focus:border-blue-500" 
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Showing Schedule</label>
                  <input 
                    type="date" 
                    name="showingSchedule" 
                    value={form.showingSchedule} 
                    onChange={handleFormChange} 
                    className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:border-blue-500 transition-colors" 
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">End Date</label>
                  <input 
                    type="date" 
                    name="endDate" 
                    value={form.endDate} 
                    onChange={handleFormChange} 
                    className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:border-blue-500 transition-colors" 
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Cover Image</label>
                  <div className="flex text-sm">
                    <button 
                      type="button" 
                      className="bg-gray-100 border border-gray-300 px-3 py-1.5 text-gray-600 rounded-l-sm hover:bg-gray-200 transition-colors"
                    >
                      Upload
                    </button>
                    <input 
                      type="text" 
                      name="imageUrl" 
                      value={form.imageUrl} 
                      onChange={handleFormChange} 
                      placeholder="Image URL (Placeholder for file)" 
                      className="flex-1 border border-l-0 border-gray-300 px-2 outline-none text-xs rounded-r-sm focus:border-blue-500" 
                    />
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

      {/* --- Add/Edit Screen Modal --- */}
      {isScreenModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-[450px] shadow-2xl border border-gray-200">
            
            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-gray-800 font-bold">
                {editingScreenId ? "Edit Screen" : "Add Screen"}
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
                  <label className="block text-xs text-gray-500 mb-1">Screen Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={screenForm.name} 
                    onChange={handleScreenFormChange} 
                    required 
                    placeholder="e.g., Screen 4 (IMAX)"
                    className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:border-[#8b5cf6] transition-colors" 
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Location / Wing</label>
                  <input 
                    type="text" 
                    name="location" 
                    value={screenForm.location} 
                    onChange={handleScreenFormChange} 
                    required 
                    placeholder="e.g., East Wing"
                    className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:border-[#8b5cf6] transition-colors" 
                  />
                </div>

                <div className="flex gap-8">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Capacity (Seats)</label>
                    <input 
                      type="number" 
                      name="capacity" 
                      value={screenForm.capacity} 
                      onChange={handleScreenFormChange} 
                      min="1"
                      required
                      className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:border-[#8b5cf6] transition-colors" 
                    />
                  </div>

                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Operational Status</label>
                    <select 
                      name="status" 
                      value={screenForm.status} 
                      onChange={handleScreenFormChange}
                      className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:border-[#8b5cf6] transition-colors bg-white"
                    >
                      <option value="Open">Open</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>

              </div>

              <div className="mt-8 flex justify-end gap-2 border-t border-gray-200 pt-4">
                <button 
                  type="submit" 
                  className="bg-[#5b21b6] hover:bg-[#4c1d95] text-white px-6 py-1.5 text-sm font-medium rounded-sm shadow-sm transition-colors"
                >
                  Save Screen
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
    </div>
  );
}
