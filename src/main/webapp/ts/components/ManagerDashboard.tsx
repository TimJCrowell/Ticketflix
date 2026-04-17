import * as React from "react";
import { useState } from "react";

/**
 * Module Name: ManagerDashboard
 * Date: April 17, 2026
 * Programmer's Name: Benjamin Martinez
 * * Brief Description of the class/module:
 * This component serves as the primary administrative dashboard for the TicketFLIX web application.
 * * Brief explanation of important functions:
 * - handleDelete(id: number): void -> Prompts for confirmation and removes a movie from the list.
 * * Important data structure:
 * - Movie (Interface): Defines the schema for a movie object, strongly typing the data across the module.
 * * Algorithms used and justification:
 * - Array Filtering (Array.prototype.filter): Used in handleDelete to remove items. Chosen because it provides an immutable state update, which is strictly required by React to trigger UI re-renders, operating at highly efficient O(N) time complexity.
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
  status: string;
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
    showingSchedule: "2023-06-28",
    endDate: "2023-12-16",
    status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=150&h=200&fit=crop",
  }
];

type Tab = "Movies" | "Theaters" | "Users" | "Orders" | "Report";

export default function ManagerDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("Movies");
  const [movies, setMovies] = useState<Movie[]>(INITIAL_MOVIES);

  /**
   * Deletes a movie from the state after user confirmation.
   * @param {number} id - The unique identifier of the movie to delete.
   * @returns {void}
   */
  function handleDelete(id: number) {
    if (confirm("Are you sure you want to delete this movie?")) {
      setMovies((prev) => prev.filter((m) => m.id !== id));
    }
  }

  return (
    <div className="h-full w-full flex-1 bg-white text-gray-900 font-sans flex flex-col">
      <header className="border-b border-gray-300 flex items-center justify-between px-6 py-4">
        <div className="text-xl font-bold text-gray-800 tracking-wide">TicketFLIX</div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-lg">administrator</span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-48 border-r border-gray-300 bg-white flex flex-col pt-2">
          {(["Movies", "Theaters", "Users", "Orders", "Report"] as Tab[]).map((tab) => (
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

        <main className="flex-1 p-8 overflow-y-auto">
          {activeTab === "Movies" && (
            <div className="max-w-6xl">
              <div className="border border-gray-300 overflow-x-auto">
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
                      <tr key={movie.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="p-3 border-r border-gray-300 text-center">{index + 1}</td>
                        <td className="p-3 border-r border-gray-300">
                          <img src={movie.imageUrl} alt="cover" className="w-12 h-16 object-cover mx-auto shadow-sm" />
                        </td>
                        <td className="p-3 border-r border-gray-300">{movie.title}</td>
                        <td className="p-3 border-r border-gray-300">
                          <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">{movie.status}</span>
                        </td>
                        <td className="p-3 text-center">
                          <button 
                            onClick={() => handleDelete(movie.id)} 
                            className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded shadow-sm"
                          >
                            Delete
                          </button>
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
    </div>
  );
}
