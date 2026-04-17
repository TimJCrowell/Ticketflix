import * as React from "react";
import { useState, useEffect, useRef } from "react";

/**
 * Module Name: ManagerDashboard
 * Date: April 17, 2026
 * Programmer's Name: Benjamin Martinez
 * * * Brief Description of the class/module:
 * This component serves as the primary administrative dashboard for the TicketFLIX web application. 
 * It provides a user interface for managers to view, create, edit, and delete movie records, as well as manage their account settings.
 * * * Brief explanation of important functions:
 * - handleDelete(id: number): void -> Prompts for confirmation and removes a movie from the list.
 * - openCreateModal(): void -> Clears the form state and opens the modal for a new movie entry.
 * - openEditModal(movie: Movie): void -> Populates the form state with the selected movie's data.
 * - handleFormChange(e: Event): void -> Dynamically updates the form state based on user input.
 * - handleSubmit(e: Event): void -> Evaluates if a movie is being edited or created, updates the state, and closes the modal.
 * - getDynamicStatus(start: string, end: string): string -> Compares current date to movie schedule to return "Active" or "Not Active".
 * * * Important data structure:
 * - Movie (Interface): Defines the schema for a movie object, strongly typing the data across the module.
 * * * Algorithms used and justification:
 * - Array Filtering (Array.prototype.filter): Used in handleDelete to remove items safely. Chosen for its immutable state update, operating at O(N) time complexity.
 * - Date Comparison: Used to dynamically render movie status without requiring hardcoded database updates.
 */

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

const EMPTY_FORM: Omit<Movie, 'id'> = {
  title: "",
  description: "",
  durationHrs: "",
  durationMins: "",
  price: "",
  showingSchedule: "",
  endDate: "",
  imageUrl: ""
};

// 1. Updated Tab Types
type Tab = "Movies" | "Theaters" | "Report" | "Account Settings";

export default function ManagerDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("Movies");
  const [movies, setMovies] = useState<Movie[]>(INITIAL_MOVIES);
  
  // 2. Dropdown State Logic
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  // 3. Dropdown Click-Outside Handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleDelete(id: number) {
    if (confirm("Are you sure you want to delete this movie?")) {
      setMovies((prev) => prev.filter((m) => m.id !== id));
    }
  }

  function openCreateModal() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setIsModalOpen(true);
  }

  function openEditModal(movie: Movie) {
    setForm({
      title: movie.title,
      description: movie.description,
      durationHrs: movie.durationHrs,
      durationMins: movie.durationMins,
      price: movie.price,
      showingSchedule: movie.showingSchedule,
      endDate: movie.endDate,
      imageUrl: movie.imageUrl
    });
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

  return (
    <div className="h-full w-full flex-1 bg-white text-gray-900 font-sans flex flex-col">
      <header className="border-b border-gray-300 flex items-center justify-between px-6 py-4">
        <div className="text-xl font-bold text-gray-800 tracking-wide">TicketFLIX</div>
        
        {/* 4. New Header Dropdown UI */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1.5 hover:text-gray-600 transition-colors focus:outline-none"
          >
            <span className="font-semibold text-lg">admin panel</span>
            <svg className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

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

      <div className="flex flex-1 overflow-hidden">
        {/* 5. Cleaned up Sidebar */}
        <aside className="w-48 border-r border-gray-300 bg-white flex flex-col pt-2 shrink-0">
          {(["Movies", "Theaters", "Report"] as Tab[]).map((tab) => (
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

        <main className="flex-1 p-8 overflow-y-auto bg-gray-50/30">
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
                    {movies.map((movie, index) => (
                      <tr key={movie.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                        <td className="p-3 border-r border-gray-300 text-center">{index + 1}</td>
                        <td className="p-3 border-r border-gray-300">
                          <img src={movie.imageUrl || "https://via.placeholder.com/150x200?text=No+Cover"} alt="cover" className="w-12 h-16 object-cover mx-auto shadow-sm" />
                        </td>
                        <td className="p-3 border-r border-gray-300 font-medium">{movie.title}</td>
                        <td className="p-3 border-r border-gray-300">
                           {/* Status placeholder for next commit */}
                          <span className="inline-block bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-full font-medium">Active</span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => openEditModal(movie)} className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 text-xs font-bold rounded shadow-sm transition-colors">Edit</button>
                            <button onClick={() => handleDelete(movie.id)} className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded shadow-sm transition-colors">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal - Browse Button remains for now */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-[450px] shadow-2xl border border-gray-200">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-gray-800 font-bold">{editingId ? "Edit Movie" : "Add Movie"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-black font-bold text-xl leading-none focus:outline-none">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div><label className="block text-xs text-gray-500 mb-1">Movie Title</label><input type="text" name="title" value={form.title} onChange={handleFormChange} required className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:border-blue-500 transition-colors" /></div>
                <div><label className="block text-xs text-gray-500 mb-1">Description</label><textarea name="description" value={form.description} onChange={handleFormChange} rows={3} className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:border-blue-500 transition-colors" /></div>
                <div className="flex gap-8">
                  <div className="flex-1"><label className="block text-xs text-gray-500 mb-1">Duration</label><div className="flex items-center gap-2"><input type="number" name="durationHrs" value={form.durationHrs} onChange={handleFormChange} className="w-12 border border-gray-300 p-1.5 text-sm text-center" /><span className="text-gray-500">:</span><input type="number" name="durationMins" value={form.durationMins} onChange={handleFormChange} className="w-12 border border-gray-300 p-1.5 text-sm text-center" /></div></div>
                  <div className="flex-1"><label className="block text-xs text-gray-500 mb-1">Price</label><div className="flex items-center gap-2"><span className="text-sm text-gray-700 font-medium">$</span><input type="number" step="0.01" name="price" value={form.price} onChange={handleFormChange} className="w-24 border border-gray-300 p-1.5 text-sm" /></div></div>
                </div>
                <div><label className="block text-xs text-gray-500 mb-1">Showing Schedule</label><input type="date" name="showingSchedule" value={form.showingSchedule} onChange={handleFormChange} className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:border-blue-500" /></div>
                <div><label className="block text-xs text-gray-500 mb-1">End Date</label><input type="date" name="endDate" value={form.endDate} onChange={handleFormChange} className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:border-blue-500" /></div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Cover Image</label>
                  <div className="flex text-sm">
                    <button type="button" className="bg-gray-100 border border-gray-300 px-3 py-1.5 text-gray-600 rounded-l-sm">Upload</button>
                    <input type="text" name="imageUrl" value={form.imageUrl} onChange={handleFormChange} placeholder="Image URL" className="flex-1 border-y border-gray-300 px-2 outline-none text-xs" />
                    <button type="button" className="bg-gray-100 border border-gray-300 px-3 py-1.5 text-gray-600 rounded-r-sm">Browse</button>
                  </div>
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-2 border-t border-gray-200 pt-4">
                <button type="submit" className="bg-[#3b82f6] hover:bg-blue-600 text-white px-6 py-1.5 text-sm font-medium rounded-sm shadow-sm transition-colors">Save</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-1.5 text-sm font-medium rounded-sm shadow-sm transition-colors">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
