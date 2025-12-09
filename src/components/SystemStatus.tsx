"use client";

import { useEffect, useState } from "react";
import api, { type SystemHealth } from "@/lib/api";

export function SystemStatus() {
  const [health, setHealth] = useState<SystemHealth | null>(null);

  useEffect(() => {
    async function fetchHealth() {
      try {
        const data = await api.getHealth();
        setHealth(data);
      } catch {
        setHealth({ status: 'unhealthy', uptime: 0, modules: {} });
      }
    }

    fetchHealth();
    const interval = setInterval(fetchHealth, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const statusColors = {
    healthy: "bg-green-500",
    degraded: "bg-yellow-500",
    unhealthy: "bg-red-500",
  };

  const statusColor = health ? statusColors[health.status] : "bg-slate-500";

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${statusColor} animate-pulse-slow`} />
        <span className="text-sm text-slate-400">
          {health?.status || "Connecting..."}
        </span>
      </div>
      {health && health.status === 'healthy' && (
        <span className="text-xs text-slate-500">
          {Math.floor(health.uptime / 3600)}h uptime
        </span>
      )}
    </div>
  );
}
