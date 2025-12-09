import { FamilyGrid } from "@/components/FamilyGrid";
import { QuickActions } from "@/components/QuickActions";
import { SystemStatus } from "@/components/SystemStatus";
import { UpcomingEvents } from "@/components/UpcomingEvents";

export default function DashboardPage() {
  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            JARVIS
          </h1>
          <p className="text-muted-foreground text-sm">Living Household Operating System</p>
        </div>
        <SystemStatus />
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Family Members */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Family Status</h2>
          <FamilyGrid />
        </div>

        {/* Right Column - Quick Actions & Events */}
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <QuickActions />
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-4">Upcoming</h2>
            <UpcomingEvents />
          </div>
        </div>
      </div>
    </div>
  );
}
