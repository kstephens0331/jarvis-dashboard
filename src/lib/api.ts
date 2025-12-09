/**
 * JARVIS API Client
 * 
 * Communicates with JARVIS Core backend on Railway
 */

const API_BASE = process.env.NEXT_PUBLIC_JARVIS_API_URL || 'https://jarvis-production-051d.up.railway.app';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
}

async function request<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

// Types
export interface FamilyMember {
  id: string;
  name: string;
  nickname?: string;
  role: 'parent' | 'child';
  age: number;
  avatar?: string;
  color?: string;
}

export interface FamilyMemberStatus {
  member: FamilyMember;
  presence?: {
    isHome: boolean;
    lastSeen?: Date;
    currentZone?: string;
  };
  pendingChores: number;
  upcomingEvents: number;
  nextAppointment?: {
    purpose: string;
    dateTime: Date;
  };
}

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  familyMemberIds: string[];
  type: 'appointment' | 'event' | 'reminder';
}

export interface QuickAction {
  id: string;
  name: string;
  icon: string;
  category: string;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  modules: Record<string, { status: string; message: string }>;
}

// API Functions
export const api = {
  // Health
  async getHealth(): Promise<SystemHealth> {
    return request('/api/health');
  },

  // Family
  async getFamilyMembers(): Promise<FamilyMember[]> {
    return request('/api/family');
  },

  async getFamilyDashboard(): Promise<FamilyMemberStatus[]> {
    return request('/api/family/dashboard');
  },

  // Calendar
  async getUpcomingEvents(limit = 5): Promise<CalendarEvent[]> {
    return request(`/api/calendar/upcoming?limit=${limit}`);
  },

  // Quick Actions
  async getQuickActions(): Promise<QuickAction[]> {
    return request('/api/quickactions');
  },

  async executeQuickAction(actionId: string): Promise<{ success: boolean; message: string }> {
    return request(`/api/quickactions/${actionId}/execute`, { method: 'POST' });
  },

  // Announcements
  async triggerAnnouncement(type: string): Promise<{ success: boolean }> {
    return request('/api/announcements/trigger', { 
      method: 'POST', 
      body: { type } 
    });
  },
};

export default api;
