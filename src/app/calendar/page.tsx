'use client';

import { useEffect, useState } from 'react';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay?: boolean;
  location?: string;
  familyMember?: string;
  type: 'appointment' | 'school' | 'work' | 'family' | 'reminder' | 'other';
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const eventTypeColors: Record<string, string> = {
  appointment: 'bg-red-500/20 border-red-500 text-red-300',
  school: 'bg-yellow-500/20 border-yellow-500 text-yellow-300',
  work: 'bg-blue-500/20 border-blue-500 text-blue-300',
  family: 'bg-purple-500/20 border-purple-500 text-purple-300',
  reminder: 'bg-green-500/20 border-green-500 text-green-300',
  other: 'bg-slate-500/20 border-slate-500 text-slate-300',
};

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');

  useEffect(() => {
    fetchEvents();
  }, [selectedDate]);

  const fetchEvents = async () => {
    try {
      const startOfWeek = new Date(selectedDate);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 7);

      const res = await fetch(
        `${API_BASE}/api/calendar/events?start=${startOfWeek.toISOString()}&end=${endOfWeek.toISOString()}`
      );
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInWeek = () => {
    const days = [];
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getEventsForDay = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const navigateWeek = (direction: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + direction * 7);
    setSelectedDate(newDate);
  };

  const isToday = (date: Date) => {
    return date.toDateString() === new Date().toDateString();
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Family Calendar</h1>
          <p className="text-slate-400 text-sm">
            {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateWeek(-1)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white"
          >
            ←
          </button>
          <button
            onClick={() => setSelectedDate(new Date())}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm"
          >
            Today
          </button>
          <button
            onClick={() => navigateWeek(1)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white"
          >
            →
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-2">
          {/* Day Headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-sm text-slate-400 font-medium py-2">
              {day}
            </div>
          ))}

          {/* Day Cells */}
          {getDaysInWeek().map((date) => (
            <div
              key={date.toISOString()}
              className={`min-h-[150px] rounded-lg border p-2 ${
                isToday(date)
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-slate-700 bg-slate-800/50'
              }`}
            >
              <div
                className={`text-sm font-medium mb-2 ${
                  isToday(date) ? 'text-blue-400' : 'text-slate-300'
                }`}
              >
                {date.getDate()}
              </div>
              <div className="space-y-1">
                {getEventsForDay(date).map((event) => (
                  <div
                    key={event.id}
                    className={`text-xs p-1.5 rounded border-l-2 ${
                      eventTypeColors[event.type] || eventTypeColors.other
                    }`}
                  >
                    <div className="font-medium truncate">{event.title}</div>
                    {!event.allDay && (
                      <div className="text-[10px] opacity-75">{formatTime(event.start)}</div>
                    )}
                    {event.familyMember && (
                      <div className="text-[10px] opacity-75">{event.familyMember}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upcoming Events Sidebar */}
      <div className="mt-6 bg-slate-800/50 rounded-lg p-4 border border-slate-700">
        <h2 className="text-lg font-semibold text-white mb-4">Upcoming This Week</h2>
        <div className="space-y-3">
          {events.length === 0 ? (
            <p className="text-slate-400 text-sm">No events this week</p>
          ) : (
            events
              .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
              .slice(0, 5)
              .map((event) => (
                <div
                  key={event.id}
                  className={`p-3 rounded-lg border-l-2 ${
                    eventTypeColors[event.type] || eventTypeColors.other
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium text-white">{event.title}</div>
                      <div className="text-sm text-slate-400">
                        {new Date(event.start).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                        {!event.allDay && ` at ${formatTime(event.start)}`}
                      </div>
                      {event.location && (
                        <div className="text-xs text-slate-500 mt-1">{event.location}</div>
                      )}
                    </div>
                    {event.familyMember && (
                      <span className="text-xs bg-slate-700 px-2 py-1 rounded">
                        {event.familyMember}
                      </span>
                    )}
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
