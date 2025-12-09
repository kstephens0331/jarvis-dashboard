'use client';

import { useEffect, useState } from 'react';

interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit?: string;
  category: string;
  checked: boolean;
  addedBy?: string;
  source?: 'manual' | 'meal-plan' | 'recurring';
  priority?: 'high' | 'normal' | 'low';
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const categoryIcons: Record<string, string> = {
  produce: '🥬',
  dairy: '🥛',
  meat: '🥩',
  bakery: '🍞',
  frozen: '🧊',
  pantry: '🥫',
  beverages: '🧃',
  snacks: '🍿',
  household: '🧹',
  personal: '🧴',
  other: '📦',
};

const categoryOrder = [
  'produce',
  'dairy',
  'meat',
  'bakery',
  'frozen',
  'pantry',
  'beverages',
  'snacks',
  'household',
  'personal',
  'other',
];

export default function ShoppingPage() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState('');
  const [newCategory, setNewCategory] = useState('other');
  const [showChecked, setShowChecked] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/shopping/list`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (error) {
      console.error('Failed to fetch shopping list:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = async (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    try {
      await fetch(`${API_BASE}/api/shopping/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checked: !item.checked }),
      });
      setItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, checked: !i.checked } : i))
      );
    } catch (error) {
      console.error('Failed to toggle item:', error);
    }
  };

  const addItem = async () => {
    if (!newItem.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/api/shopping/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newItem,
          category: newCategory,
          quantity: 1,
          source: 'manual',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setItems((prev) => [...prev, data.item]);
        setNewItem('');
      }
    } catch (error) {
      console.error('Failed to add item:', error);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      await fetch(`${API_BASE}/api/shopping/items/${itemId}`, {
        method: 'DELETE',
      });
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const clearChecked = async () => {
    try {
      await fetch(`${API_BASE}/api/shopping/clear-checked`, { method: 'POST' });
      setItems((prev) => prev.filter((i) => !i.checked));
    } catch (error) {
      console.error('Failed to clear checked items:', error);
    }
  };

  const getItemsByCategory = () => {
    const filtered = items.filter((i) => showChecked || !i.checked);
    const grouped: Record<string, ShoppingItem[]> = {};

    categoryOrder.forEach((cat) => {
      const catItems = filtered.filter((i) => i.category === cat);
      if (catItems.length > 0) {
        grouped[cat] = catItems;
      }
    });

    return grouped;
  };

  const uncheckedCount = items.filter((i) => !i.checked).length;
  const checkedCount = items.filter((i) => i.checked).length;

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  const groupedItems = getItemsByCategory();

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Shopping List</h1>
          <p className="text-slate-400 text-sm">
            {uncheckedCount} items remaining
            {checkedCount > 0 && ` • ${checkedCount} checked`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-slate-400">
            <input
              type="checkbox"
              checked={showChecked}
              onChange={(e) => setShowChecked(e.target.checked)}
              className="rounded bg-slate-700 border-slate-600"
            />
            Show Checked
          </label>
          {checkedCount > 0 && (
            <button
              onClick={clearChecked}
              className="px-3 py-1.5 rounded bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm"
            >
              Clear Checked
            </button>
          )}
        </div>
      </header>

      {/* Add Item */}
      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addItem()}
            placeholder="Add item..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
          >
            {categoryOrder.map((cat) => (
              <option key={cat} value={cat}>
                {categoryIcons[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
          <button
            onClick={addItem}
            className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white"
          >
            Add
          </button>
        </div>
      </div>

      {/* Shopping List */}
      {Object.keys(groupedItems).length === 0 ? (
        <div className="bg-slate-800/50 rounded-lg p-8 border border-slate-700 text-center">
          <p className="text-slate-400">Your shopping list is empty</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedItems).map(([category, categoryItems]) => (
            <div
              key={category}
              className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden"
            >
              <div className="px-4 py-3 bg-slate-900/50 border-b border-slate-700 flex items-center gap-2">
                <span className="text-xl">{categoryIcons[category]}</span>
                <span className="font-medium text-white capitalize">{category}</span>
                <span className="text-xs text-slate-400">({categoryItems.length})</span>
              </div>
              <div className="divide-y divide-slate-700">
                {categoryItems.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 px-4 py-3 ${
                      item.checked ? 'bg-slate-900/30' : ''
                    }`}
                  >
                    <button
                      onClick={() => toggleItem(item.id)}
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                        item.checked
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-slate-600 hover:border-blue-500'
                      }`}
                    >
                      {item.checked && '✓'}
                    </button>
                    <div className="flex-1">
                      <span
                        className={`${
                          item.checked ? 'line-through text-slate-500' : 'text-white'
                        }`}
                      >
                        {item.name}
                      </span>
                      {item.quantity > 1 && (
                        <span className="text-slate-400 ml-2">
                          x{item.quantity}
                          {item.unit && ` ${item.unit}`}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {item.source === 'meal-plan' && (
                        <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">
                          Meal Plan
                        </span>
                      )}
                      {item.priority === 'high' && (
                        <span className="text-xs bg-red-500/20 text-red-300 px-2 py-0.5 rounded">
                          Urgent
                        </span>
                      )}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Meal Plan Integration Note */}
      <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-xl">💡</span>
          <div>
            <div className="font-medium text-blue-300">Smart Shopping</div>
            <p className="text-sm text-slate-400 mt-1">
              Items are automatically added when you generate a meal plan. Look for the "Meal
              Plan" badge to see which items came from your weekly meals.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
