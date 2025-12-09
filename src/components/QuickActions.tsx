"use client";

import { useEffect, useState, type ReactNode } from "react";
import api, { type QuickAction } from "@/lib/api";

const defaultActions: QuickAction[] = [
  { id: "morning-briefing", name: "Morning Briefing", icon: "sun", category: "announcements" },
  { id: "dinner-time", name: "Dinner Time", icon: "utensils", category: "announcements" },
  { id: "bedtime-start", name: "Bedtime Routine", icon: "moon", category: "announcements" },
  { id: "family-meeting", name: "Family Meeting", icon: "users", category: "announcements" },
];

const iconMap: Record<string, ReactNode> = {
  sun: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  moon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  ),
  utensils: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  ),
  users: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
};

export function QuickActions() {
  const [actions, setActions] = useState<QuickAction[]>(defaultActions);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    async function fetchActions() {
      try {
        const data = await api.getQuickActions();
        if (data.length > 0) {
          setActions(data);
        }
      } catch {
        // Use defaults on error
      }
    }
    fetchActions();
  }, []);

  async function handleAction(action: QuickAction) {
    setLoading(action.id);
    try {
      await api.executeQuickAction(action.id);
    } catch (err) {
      console.error("Action failed:", err);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={() => handleAction(action)}
          disabled={loading === action.id}
          className="relative flex flex-col items-center gap-2 p-4 bg-slate-800/60 rounded-xl border border-slate-700/50 hover:border-blue-500/50 hover:bg-slate-700/60 transition-all disabled:opacity-50"
        >
          <div className="text-blue-400">
            {iconMap[action.icon] || iconMap.sun}
          </div>
          <span className="text-sm text-slate-200">{action.name}</span>
          {loading === action.id && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 rounded-xl">
              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
