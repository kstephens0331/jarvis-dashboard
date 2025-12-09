"use client";

import { useEffect, useState } from "react";
import { FamilyMemberCard } from "./FamilyMemberCard";
import type { FamilyMemberStatus } from "@/lib/api";
import api from "@/lib/api";

export function FamilyGrid() {
  const [members, setMembers] = useState<FamilyMemberStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFamily() {
      try {
        const data = await api.getFamilyDashboard();
        setMembers(data);
        setError(null);
      } catch (err) {
        setError("Failed to load family data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchFamily();
    // Refresh every 30 seconds
    const interval = setInterval(fetchFamily, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i} 
            className="h-40 bg-slate-800/50 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-4 text-center">
        <p className="text-red-400">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 text-sm text-red-300 hover:text-red-200"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {members.map((status) => (
        <FamilyMemberCard key={status.member.id} status={status} />
      ))}
    </div>
  );
}
