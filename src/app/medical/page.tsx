'use client';

import { useEffect, useState } from 'react';

interface MedicalAppointment {
  id: string;
  patientName: string;
  provider: string;
  specialty?: string;
  date: string;
  time?: string;
  location?: string;
  type: 'checkup' | 'specialist' | 'therapy' | 'dental' | 'vision' | 'other';
  status: 'upcoming' | 'completed' | 'cancelled';
  notes?: string;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  takenBy: string;
  nextRefillDate?: string;
  prescriber?: string;
}

interface MedicalRecord {
  id: string;
  patientName: string;
  type: 'lab_result' | 'imaging' | 'diagnosis' | 'note' | 'referral';
  title: string;
  date: string;
  provider?: string;
  status?: 'normal' | 'abnormal' | 'critical' | 'pending';
  summary?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const typeColors: Record<string, string> = {
  checkup: 'bg-blue-500/20 border-blue-500 text-blue-300',
  specialist: 'bg-purple-500/20 border-purple-500 text-purple-300',
  therapy: 'bg-green-500/20 border-green-500 text-green-300',
  dental: 'bg-cyan-500/20 border-cyan-500 text-cyan-300',
  vision: 'bg-indigo-500/20 border-indigo-500 text-indigo-300',
  other: 'bg-slate-500/20 border-slate-500 text-slate-300',
};

const resultStatusColors: Record<string, string> = {
  normal: 'text-green-400',
  abnormal: 'text-yellow-400',
  critical: 'text-red-400',
  pending: 'text-slate-400',
};

export default function MedicalPage() {
  const [appointments, setAppointments] = useState<MedicalAppointment[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'appointments' | 'medications' | 'records'>('appointments');
  const [selectedMember, setSelectedMember] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [apptRes, medRes, recordsRes] = await Promise.all([
        fetch(`${API_BASE}/api/medical/appointments`),
        fetch(`${API_BASE}/api/medications`),
        fetch(`${API_BASE}/api/medical/records`),
      ]);

      if (apptRes.ok) {
        const data = await apptRes.json();
        setAppointments(data.appointments || []);
      }
      if (medRes.ok) {
        const data = await medRes.json();
        setMedications(data.medications || []);
      }
      if (recordsRes.ok) {
        const data = await recordsRes.json();
        setRecords(data.records || []);
      }
    } catch (error) {
      console.error('Failed to fetch medical data:', error);
    } finally {
      setLoading(false);
    }
  };

  const upcomingAppointments = appointments
    .filter((a) => a.status === 'upcoming')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const getDaysUntil = (date: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const apptDate = new Date(date);
    apptDate.setHours(0, 0, 0, 0);
    return Math.ceil((apptDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const medicationsNeedingRefill = medications.filter((m) => {
    if (!m.nextRefillDate) return false;
    const daysUntil = getDaysUntil(m.nextRefillDate);
    return daysUntil <= 7;
  });

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
          <h1 className="text-2xl font-bold text-white">Medical Dashboard</h1>
          <p className="text-slate-400 text-sm">Family health management</p>
        </div>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <div className="text-sm text-slate-400">Upcoming Appointments</div>
          <div className="text-2xl font-bold text-white mt-1">{upcomingAppointments.length}</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <div className="text-sm text-slate-400">Active Medications</div>
          <div className="text-2xl font-bold text-blue-400 mt-1">{medications.length}</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4 border border-yellow-500/30">
          <div className="text-sm text-slate-400">Refills Needed</div>
          <div className="text-2xl font-bold text-yellow-400 mt-1">
            {medicationsNeedingRefill.length}
          </div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <div className="text-sm text-slate-400">Recent Results</div>
          <div className="text-2xl font-bold text-purple-400 mt-1">
            {records.filter((r) => r.type === 'lab_result').length}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-700 pb-2">
        {(['appointments', 'medications', 'records'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-t-lg transition-colors ${
              activeTab === tab
                ? 'bg-slate-800 text-white border-b-2 border-blue-500'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Appointments Tab */}
      {activeTab === 'appointments' && (
        <div className="space-y-4">
          {upcomingAppointments.length === 0 ? (
            <div className="bg-slate-800/50 rounded-lg p-8 border border-slate-700 text-center">
              <p className="text-slate-400">No upcoming appointments</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingAppointments.map((appt) => {
                const daysUntil = getDaysUntil(appt.date);
                const isUrgent = daysUntil <= 2;

                return (
                  <div
                    key={appt.id}
                    className={`p-4 rounded-lg border-l-4 bg-slate-800/50 ${
                      typeColors[appt.type] || typeColors.other
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium text-white">{appt.patientName}</div>
                        <div className="text-sm text-slate-300 mt-1">{appt.provider}</div>
                        {appt.specialty && (
                          <div className="text-xs text-slate-400">{appt.specialty}</div>
                        )}
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          typeColors[appt.type] || typeColors.other
                        }`}
                      >
                        {appt.type}
                      </span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-700">
                      <div className={`text-sm ${isUrgent ? 'text-yellow-400' : 'text-slate-300'}`}>
                        {new Date(appt.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric',
                        })}
                        {appt.time && ` at ${appt.time}`}
                        {daysUntil === 0 && ' (Today!)'}
                        {daysUntil === 1 && ' (Tomorrow)'}
                        {daysUntil > 1 && daysUntil <= 7 && ` (${daysUntil} days)`}
                      </div>
                      {appt.location && (
                        <div className="text-xs text-slate-500 mt-1">{appt.location}</div>
                      )}
                    </div>
                    {appt.notes && (
                      <div className="mt-2 text-xs text-slate-400 bg-slate-900/50 p-2 rounded">
                        {appt.notes}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Medications Tab */}
      {activeTab === 'medications' && (
        <div className="space-y-4">
          {medicationsNeedingRefill.length > 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
              <h3 className="text-yellow-400 font-medium mb-2">Refills Needed Soon</h3>
              <div className="space-y-2">
                {medicationsNeedingRefill.map((med) => (
                  <div key={med.id} className="flex items-center justify-between text-sm">
                    <span className="text-white">
                      {med.name} ({med.takenBy})
                    </span>
                    <span className="text-yellow-400">
                      Refill by {new Date(med.nextRefillDate!).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {medications.map((med) => (
              <div
                key={med.id}
                className="p-4 rounded-lg bg-slate-800/50 border border-slate-700"
              >
                <div className="font-medium text-white">{med.name}</div>
                <div className="text-sm text-slate-300 mt-1">{med.dosage}</div>
                <div className="text-xs text-slate-400 mt-1">{med.frequency}</div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700">
                  <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                    {med.takenBy}
                  </span>
                  {med.nextRefillDate && (
                    <span className="text-xs text-slate-400">
                      Refill: {new Date(med.nextRefillDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Records Tab */}
      {activeTab === 'records' && (
        <div className="space-y-4">
          {records.length === 0 ? (
            <div className="bg-slate-800/50 rounded-lg p-8 border border-slate-700 text-center">
              <p className="text-slate-400">No medical records</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {records
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((record) => (
                  <div
                    key={record.id}
                    className="p-4 rounded-lg bg-slate-800/50 border border-slate-700"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium text-white">{record.title}</div>
                        <div className="text-sm text-slate-400 mt-1">{record.patientName}</div>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded bg-slate-700 ${
                          record.status ? resultStatusColors[record.status] : 'text-slate-300'
                        }`}
                      >
                        {record.type.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-700">
                      <div className="text-sm text-slate-400">
                        {new Date(record.date).toLocaleDateString()}
                        {record.provider && ` - ${record.provider}`}
                      </div>
                      {record.status && (
                        <div className={`text-sm mt-1 ${resultStatusColors[record.status]}`}>
                          Status: {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </div>
                      )}
                      {record.summary && (
                        <div className="text-xs text-slate-500 mt-2 bg-slate-900/50 p-2 rounded">
                          {record.summary}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
