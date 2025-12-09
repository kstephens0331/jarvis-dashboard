'use client';

import { useEffect, useState } from 'react';

interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  category: 'utilities' | 'housing' | 'insurance' | 'subscriptions' | 'medical' | 'other';
  status: 'pending' | 'paid' | 'overdue';
  isRecurring: boolean;
  autopay?: boolean;
  paidAt?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const categoryIcons: Record<string, string> = {
  utilities: '⚡',
  housing: '🏠',
  insurance: '🛡️',
  subscriptions: '📺',
  medical: '🏥',
  other: '📋',
};

const categoryColors: Record<string, string> = {
  utilities: 'bg-yellow-500/20 border-yellow-500 text-yellow-300',
  housing: 'bg-blue-500/20 border-blue-500 text-blue-300',
  insurance: 'bg-purple-500/20 border-purple-500 text-purple-300',
  subscriptions: 'bg-pink-500/20 border-pink-500 text-pink-300',
  medical: 'bg-red-500/20 border-red-500 text-red-300',
  other: 'bg-slate-500/20 border-slate-500 text-slate-300',
};

export default function BillsPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showPaid, setShowPaid] = useState(false);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/bills`);
      if (res.ok) {
        const data = await res.json();
        setBills(data.bills || []);
      }
    } catch (error) {
      console.error('Failed to fetch bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const markPaid = async (billId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/bills/${billId}/pay`, {
        method: 'POST',
      });
      if (res.ok) {
        setBills((prev) =>
          prev.map((b) =>
            b.id === billId ? { ...b, status: 'paid', paidAt: new Date().toISOString() } : b
          )
        );
      }
    } catch (error) {
      console.error('Failed to mark bill as paid:', error);
    }
  };

  const filteredBills = bills.filter((bill) => {
    if (selectedCategory !== 'all' && bill.category !== selectedCategory) return false;
    if (!showPaid && bill.status === 'paid') return false;
    return true;
  });

  const totalDue = filteredBills
    .filter((b) => b.status !== 'paid')
    .reduce((sum, b) => sum + b.amount, 0);

  const totalPaid = filteredBills
    .filter((b) => b.status === 'paid')
    .reduce((sum, b) => sum + b.amount, 0);

  const overdueBills = filteredBills.filter((b) => b.status === 'overdue');
  const upcomingBills = filteredBills
    .filter((b) => b.status === 'pending')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
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
          <h1 className="text-2xl font-bold text-white">Bills & Payments</h1>
          <p className="text-slate-400 text-sm">Manage household bills and subscriptions</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
          >
            <option value="all">All Categories</option>
            {Object.keys(categoryIcons).map((cat) => (
              <option key={cat} value={cat}>
                {categoryIcons[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm text-slate-400">
            <input
              type="checkbox"
              checked={showPaid}
              onChange={(e) => setShowPaid(e.target.checked)}
              className="rounded bg-slate-700 border-slate-600"
            />
            Show Paid
          </label>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <div className="text-sm text-slate-400">Total Due</div>
          <div className="text-2xl font-bold text-white mt-1">{formatCurrency(totalDue)}</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <div className="text-sm text-slate-400">Paid This Month</div>
          <div className="text-2xl font-bold text-green-400 mt-1">{formatCurrency(totalPaid)}</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4 border border-red-500/30">
          <div className="text-sm text-slate-400">Overdue</div>
          <div className="text-2xl font-bold text-red-400 mt-1">{overdueBills.length}</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <div className="text-sm text-slate-400">Upcoming (7 days)</div>
          <div className="text-2xl font-bold text-yellow-400 mt-1">
            {upcomingBills.filter((b) => getDaysUntilDue(b.dueDate) <= 7).length}
          </div>
        </div>
      </div>

      {/* Overdue Alert */}
      {overdueBills.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-red-400 mb-3">Overdue Bills</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {overdueBills.map((bill) => (
              <BillCard key={bill.id} bill={bill} onMarkPaid={markPaid} />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Bills */}
      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
        <h2 className="text-lg font-semibold text-white mb-4">Upcoming Bills</h2>
        {upcomingBills.length === 0 ? (
          <p className="text-slate-400 text-sm">No upcoming bills</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {upcomingBills.map((bill) => (
              <BillCard key={bill.id} bill={bill} onMarkPaid={markPaid} />
            ))}
          </div>
        )}
      </div>

      {/* Paid Bills (if shown) */}
      {showPaid && (
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 mt-6">
          <h2 className="text-lg font-semibold text-green-400 mb-4">Paid Bills</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredBills
              .filter((b) => b.status === 'paid')
              .map((bill) => (
                <BillCard key={bill.id} bill={bill} onMarkPaid={markPaid} />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BillCard({ bill, onMarkPaid }: { bill: Bill; onMarkPaid: (id: string) => void }) {
  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const daysUntil = getDaysUntilDue(bill.dueDate);
  const isUrgent = daysUntil <= 3 && bill.status !== 'paid';

  return (
    <div
      className={`p-4 rounded-lg border-l-4 bg-slate-900/50 ${
        bill.status === 'overdue'
          ? 'border-red-500'
          : bill.status === 'paid'
          ? 'border-green-500'
          : isUrgent
          ? 'border-yellow-500'
          : 'border-slate-600'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-lg">{categoryIcons[bill.category]}</span>
            <span className="font-medium text-white">{bill.name}</span>
          </div>
          <div className="text-xl font-bold text-white mt-2">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
              bill.amount
            )}
          </div>
          <div className="flex items-center gap-2 mt-2 text-sm">
            {bill.status === 'paid' ? (
              <span className="text-green-400">
                Paid {new Date(bill.paidAt!).toLocaleDateString()}
              </span>
            ) : bill.status === 'overdue' ? (
              <span className="text-red-400">
                Overdue by {Math.abs(daysUntil)} days
              </span>
            ) : (
              <span className={isUrgent ? 'text-yellow-400' : 'text-slate-400'}>
                Due {new Date(bill.dueDate).toLocaleDateString()}
                {daysUntil === 0 && ' (Today!)'}
                {daysUntil === 1 && ' (Tomorrow)'}
                {daysUntil > 1 && daysUntil <= 7 && ` (${daysUntil} days)`}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-2">
            {bill.isRecurring && (
              <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">
                Recurring
              </span>
            )}
            {bill.autopay && (
              <span className="text-[10px] bg-green-500/20 text-green-300 px-1.5 py-0.5 rounded">
                Autopay
              </span>
            )}
          </div>
        </div>
        {bill.status !== 'paid' && (
          <button
            onClick={() => onMarkPaid(bill.id)}
            className="px-3 py-1.5 rounded bg-green-500/20 hover:bg-green-500/30 text-green-400 text-sm transition-colors"
          >
            Pay
          </button>
        )}
      </div>
    </div>
  );
}
