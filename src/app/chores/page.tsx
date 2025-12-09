'use client';

import { useEffect, useState } from 'react';

interface Chore {
  id: string;
  name: string;
  assignedTo: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  status: 'pending' | 'completed' | 'overdue';
  dueDate?: string;
  completedAt?: string;
  points?: number;
}

interface FamilyMember {
  id: string;
  name: string;
  role: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const statusColors = {
  pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500',
  completed: 'bg-green-500/20 text-green-300 border-green-500',
  overdue: 'bg-red-500/20 text-red-300 border-red-500',
};

export default function ChoresPage() {
  const [chores, setChores] = useState<Chore[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<string>('all');
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [choresRes, familyRes] = await Promise.all([
        fetch(`${API_BASE}/api/chores`),
        fetch(`${API_BASE}/api/family`),
      ]);

      if (choresRes.ok) {
        const data = await choresRes.json();
        setChores(data.chores || []);
      }
      if (familyRes.ok) {
        const data = await familyRes.json();
        setFamilyMembers(data.members || []);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const markComplete = async (choreId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/chores/${choreId}/complete`, {
        method: 'POST',
      });
      if (res.ok) {
        setChores((prev) =>
          prev.map((c) =>
            c.id === choreId ? { ...c, status: 'completed', completedAt: new Date().toISOString() } : c
          )
        );
      }
    } catch (error) {
      console.error('Failed to complete chore:', error);
    }
  };

  const filteredChores = chores.filter((chore) => {
    if (selectedMember !== 'all' && chore.assignedTo !== selectedMember) return false;
    if (!showCompleted && chore.status === 'completed') return false;
    return true;
  });

  const getChoresByStatus = (status: 'pending' | 'completed' | 'overdue') => {
    return filteredChores.filter((c) => c.status === status);
  };

  const getMemberStats = (memberId: string) => {
    const memberChores = chores.filter((c) => c.assignedTo === memberId);
    const completed = memberChores.filter((c) => c.status === 'completed').length;
    const total = memberChores.length;
    const points = memberChores
      .filter((c) => c.status === 'completed')
      .reduce((sum, c) => sum + (c.points || 0), 0);
    return { completed, total, points };
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Family Chores</h1>
          <p className="text-slate-400 text-sm">Track and manage household tasks</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
          >
            <option value="all">All Members</option>
            {familyMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm text-slate-400">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={(e) => setShowCompleted(e.target.checked)}
              className="rounded bg-slate-700 border-slate-600"
            />
            Show Completed
          </label>
        </div>
      </header>

      {/* Member Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {familyMembers.map((member) => {
          const stats = getMemberStats(member.id);
          return (
            <div
              key={member.id}
              className={`bg-slate-800/50 rounded-lg p-3 border cursor-pointer transition-colors ${
                selectedMember === member.id
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-slate-700 hover:border-slate-600'
              }`}
              onClick={() => setSelectedMember(member.id === selectedMember ? 'all' : member.id)}
            >
              <div className="text-sm font-medium text-white">{member.name}</div>
              <div className="text-xs text-slate-400 mt-1">
                {stats.completed}/{stats.total} done
              </div>
              {stats.points > 0 && (
                <div className="text-xs text-yellow-400 mt-1">{stats.points} pts</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Chores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Overdue */}
        <div className="bg-slate-800/50 rounded-lg p-4 border border-red-500/30">
          <h2 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
            <span>Overdue</span>
            <span className="text-xs bg-red-500/20 px-2 py-1 rounded-full">
              {getChoresByStatus('overdue').length}
            </span>
          </h2>
          <div className="space-y-3">
            {getChoresByStatus('overdue').map((chore) => (
              <ChoreCard key={chore.id} chore={chore} onComplete={markComplete} />
            ))}
            {getChoresByStatus('overdue').length === 0 && (
              <p className="text-sm text-slate-500">No overdue chores</p>
            )}
          </div>
        </div>

        {/* Pending */}
        <div className="bg-slate-800/50 rounded-lg p-4 border border-yellow-500/30">
          <h2 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center gap-2">
            <span>Pending</span>
            <span className="text-xs bg-yellow-500/20 px-2 py-1 rounded-full">
              {getChoresByStatus('pending').length}
            </span>
          </h2>
          <div className="space-y-3">
            {getChoresByStatus('pending').map((chore) => (
              <ChoreCard key={chore.id} chore={chore} onComplete={markComplete} />
            ))}
            {getChoresByStatus('pending').length === 0 && (
              <p className="text-sm text-slate-500">No pending chores</p>
            )}
          </div>
        </div>

        {/* Completed */}
        <div className="bg-slate-800/50 rounded-lg p-4 border border-green-500/30">
          <h2 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
            <span>Completed</span>
            <span className="text-xs bg-green-500/20 px-2 py-1 rounded-full">
              {getChoresByStatus('completed').length}
            </span>
          </h2>
          <div className="space-y-3">
            {getChoresByStatus('completed').map((chore) => (
              <ChoreCard key={chore.id} chore={chore} onComplete={markComplete} />
            ))}
            {getChoresByStatus('completed').length === 0 && (
              <p className="text-sm text-slate-500">No completed chores</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChoreCard({
  chore,
  onComplete,
}: {
  chore: Chore;
  onComplete: (id: string) => void;
}) {
  const frequencyBadge = {
    daily: 'bg-blue-500/20 text-blue-300',
    weekly: 'bg-purple-500/20 text-purple-300',
    monthly: 'bg-orange-500/20 text-orange-300',
  };

  return (
    <div
      className={`p-3 rounded-lg border-l-2 ${
        statusColors[chore.status]
      } bg-slate-900/50`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="font-medium text-white text-sm">{chore.name}</div>
          <div className="text-xs text-slate-400 mt-1">{chore.assignedTo}</div>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${frequencyBadge[chore.frequency]}`}>
              {chore.frequency}
            </span>
            {chore.points && (
              <span className="text-[10px] text-yellow-400">{chore.points} pts</span>
            )}
          </div>
        </div>
        {chore.status !== 'completed' && (
          <button
            onClick={() => onComplete(chore.id)}
            className="p-1.5 rounded bg-green-500/20 hover:bg-green-500/30 text-green-400 transition-colors"
            title="Mark complete"
          >
            ✓
          </button>
        )}
      </div>
    </div>
  );
}
