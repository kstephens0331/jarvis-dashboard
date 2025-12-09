'use client';

import { useEffect, useState } from 'react';

interface MealPlan {
  id: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  recipe: string;
  servings: number;
  prepTime?: number;
  cookTime?: number;
  ingredients?: string[];
  notes?: string;
}

interface Recipe {
  id: string;
  name: string;
  category: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  ingredients: string[];
  instructions: string[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const mealTypeColors: Record<string, string> = {
  breakfast: 'bg-yellow-500/20 border-yellow-500 text-yellow-300',
  lunch: 'bg-green-500/20 border-green-500 text-green-300',
  dinner: 'bg-blue-500/20 border-blue-500 text-blue-300',
  snack: 'bg-purple-500/20 border-purple-500 text-purple-300',
};

const mealTypeIcons: Record<string, string> = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snack: '🍿',
};

export default function MealsPage() {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchMealPlans();
  }, [selectedDate]);

  const fetchMealPlans = async () => {
    try {
      const startOfWeek = new Date(selectedDate);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 7);

      const res = await fetch(
        `${API_BASE}/api/meals/plans?start=${startOfWeek.toISOString()}&end=${endOfWeek.toISOString()}`
      );
      if (res.ok) {
        const data = await res.json();
        setMealPlans(data.plans || []);
      }
    } catch (error) {
      console.error('Failed to fetch meal plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateWeeklyPlan = async () => {
    setGenerating(true);
    try {
      const startOfWeek = new Date(selectedDate);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

      const res = await fetch(`${API_BASE}/api/meals/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weekStart: startOfWeek.toISOString(),
          preferences: { dietary: [], allergies: [] },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // Apply the plan
        await fetch(`${API_BASE}/api/meals/apply-plan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan: data, autoGenerateGroceryList: true }),
        });
        fetchMealPlans();
      }
    } catch (error) {
      console.error('Failed to generate meal plan:', error);
    } finally {
      setGenerating(false);
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

  const getMealsForDay = (date: Date) => {
    return mealPlans.filter((meal) => {
      const mealDate = new Date(meal.date);
      return mealDate.toDateString() === date.toDateString();
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
          <h1 className="text-2xl font-bold text-white">Meal Planning</h1>
          <p className="text-slate-400 text-sm">
            Week of{' '}
            {getDaysInWeek()[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
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
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm"
          >
            This Week
          </button>
          <button
            onClick={() => navigateWeek(1)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white"
          >
            →
          </button>
          <button
            onClick={generateWeeklyPlan}
            disabled={generating}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm ml-2"
          >
            {generating ? 'Generating...' : 'Generate Plan'}
          </button>
        </div>
      </header>

      {/* Weekly Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {getDaysInWeek().map((date) => {
          const meals = getMealsForDay(date);
          return (
            <div
              key={date.toISOString()}
              className={`rounded-lg border p-3 ${
                isToday(date)
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-slate-700 bg-slate-800/50'
              }`}
            >
              <div
                className={`text-sm font-medium mb-3 ${
                  isToday(date) ? 'text-blue-400' : 'text-slate-300'
                }`}
              >
                {date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
              </div>

              <div className="space-y-2">
                {['breakfast', 'lunch', 'dinner', 'snack'].map((mealType) => {
                  const meal = meals.find((m) => m.mealType === mealType);
                  return (
                    <div
                      key={mealType}
                      className={`p-2 rounded border-l-2 text-xs ${
                        meal
                          ? mealTypeColors[mealType]
                          : 'bg-slate-900/30 border-slate-700 text-slate-500'
                      }`}
                    >
                      <div className="flex items-center gap-1 mb-1">
                        <span>{mealTypeIcons[mealType]}</span>
                        <span className="capitalize font-medium">{mealType}</span>
                      </div>
                      {meal ? (
                        <div className="truncate">{meal.recipe}</div>
                      ) : (
                        <div className="italic">Not planned</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Today's Meals Detail */}
      <div className="mt-6 bg-slate-800/50 rounded-lg p-4 border border-slate-700">
        <h2 className="text-lg font-semibold text-white mb-4">Today's Meals</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {['breakfast', 'lunch', 'dinner', 'snack'].map((mealType) => {
            const todayMeals = getMealsForDay(new Date());
            const meal = todayMeals.find((m) => m.mealType === mealType);

            return (
              <div
                key={mealType}
                className={`p-4 rounded-lg border-l-4 bg-slate-900/50 ${
                  mealTypeColors[mealType]
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{mealTypeIcons[mealType]}</span>
                  <span className="font-medium text-white capitalize">{mealType}</span>
                </div>
                {meal ? (
                  <>
                    <div className="text-white font-medium">{meal.recipe}</div>
                    <div className="text-sm text-slate-400 mt-2">
                      {meal.servings} servings
                      {meal.prepTime && ` • ${meal.prepTime}min prep`}
                      {meal.cookTime && ` • ${meal.cookTime}min cook`}
                    </div>
                    {meal.notes && (
                      <div className="text-xs text-slate-500 mt-2 bg-slate-800/50 p-2 rounded">
                        {meal.notes}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-slate-500 italic">No meal planned</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
