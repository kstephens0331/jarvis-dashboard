"use client";

import type { FamilyMemberStatus } from "@/lib/api";

interface Props {
  status: FamilyMemberStatus;
}

const defaultColors: Record<string, string> = {
  Kyle: "#3b82f6",
  Natasha: "#ec4899",
  Zoe: "#a855f7",
  Kaylee: "#f472b6",
  Bentley: "#22c55e",
  Kyleigh: "#f59e0b",
};

export function FamilyMemberCard({ status }: Props) {
  const { member, presence, pendingChores, upcomingEvents, nextAppointment } = status;
  const color = member.color || defaultColors[member.name] || "#6b7280";
  const isHome = presence?.isHome ?? false;
  const indicatorClass = isHome ? "bg-green-500" : "bg-slate-500";
  const ageDisplay = `Age ${member.age}`;

  return (
    <div
      className="relative bg-slate-800/60 backdrop-blur rounded-xl p-4 border border-slate-700/50 hover:border-slate-600 transition-all"
      style={{ borderLeftColor: color, borderLeftWidth: 4 }}
    >
      <div className="absolute top-3 right-3">
        <div
          className={`w-3 h-3 rounded-full ${indicatorClass}`}
          title={isHome ? 'Home' : 'Away'}
        />
      </div>

      <div
        className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-3"
        style={{ backgroundColor: color + "30", color }}
      >
        {member.avatar || member.name.charAt(0)}
      </div>

      <h3 className="font-semibold text-white">
        {member.nickname || member.name}
      </h3>
      <p className="text-xs text-slate-400 mb-3">
        {member.role === 'parent' ? 'Parent' : ageDisplay}
      </p>

      <div className="flex gap-3 text-xs">
        {pendingChores > 0 && (
          <span className="flex items-center gap-1 text-amber-400">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {pendingChores}
          </span>
        )}
        {upcomingEvents > 0 && (
          <span className="flex items-center gap-1 text-blue-400">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {upcomingEvents}
          </span>
        )}
      </div>

      {nextAppointment && (
        <div className="mt-3 pt-3 border-t border-slate-700/50 text-xs text-slate-300">
          <p className="truncate">{nextAppointment.purpose}</p>
        </div>
      )}
    </div>
  );
}
