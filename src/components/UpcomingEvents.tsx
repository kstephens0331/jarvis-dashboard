"use client";

import { useEffect, useState } from "react";
import api, { type CalendarEvent } from "@/lib/api";

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatDate(date: Date): string {
  const today = new Date();
  const eventDate = new Date(date);

  if (eventDate.toDateString() === today.toDateString()) {
    return "Today";
  }

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (eventDate.toDateString() === tomorrow.toDateString()) {
    return "Tomorrow";
  }

  return eventDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function UpcomingEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const data = await api.getUpcomingEvents(5);
        setEvents(data);
      } catch (err) {
        console.error("Failed to fetch events:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
    const interval = setInterval(fetchEvents, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-slate-800/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="bg-slate-800/40 rounded-xl p-4 text-center text-slate-400">
        <p>No upcoming events</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {events.map((event) => (
        <div
          key={event.id}
          className="bg-slate-800/60 rounded-lg p-3 border-l-4 border-blue-500"
        >
          <div className="flex justify-between items-start">
            <h4 className="font-medium text-white text-sm">{event.title}</h4>
            <span className="text-xs text-slate-400">
              {formatTime(event.startTime)}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {formatDate(event.startTime)}
          </p>
        </div>
      ))}
    </div>
  );
}
