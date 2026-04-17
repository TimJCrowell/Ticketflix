import * as React from "react";
import { useState } from "react";

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

const INITIAL_MOVIES: Movie[] = [];
type Tab = "Movies" | "Theaters" | "Users" | "Orders" | "Report";

export default function ManagerDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("Movies");
  const [movies, setMovies] = useState<Movie[]>(INITIAL_MOVIES);

  return (
    <div className="h-full w-full flex-1 bg-white text-gray-900 font-sans flex flex-col">
      {/* Top Header */}
      <header className="border-b border-gray-300 flex items-center justify-between px-6 py-4">
        <div className="text-gray-400 font-medium">Admin {activeTab}</div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold">a</div>
          <span className="font-semibold text-lg">administrator</span>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-48 border-r border-gray-300 bg-white flex flex-col">
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
            <h1 className="text-2xl font-bold mb-4">Dashboard initialized</h1>
        </main>
      </div>
    </div>
  );
}
