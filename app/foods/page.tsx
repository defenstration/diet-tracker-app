'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import FoodEntryForm from '../components/FoodEntryForm';
import NutritionCharts from '../components/NutritionCharts';
import { FoodLogEntry, getTodaysFoodLogs, calculateDailyTotals } from '@/lib/food-log';
import { useAuth } from '@/contexts/auth-context';

// Default daily targets (you might want to make these user-configurable later)
const CALORIE_TARGET = 2000;

export default function FoodsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [foodLogs, setFoodLogs] = useState<FoodLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/sign-in');
    }
  }, [authLoading, user, router]);

  const loadFoodLogs = async () => {
    try {
      setLoading(true);
      const logs = await getTodaysFoodLogs();
      setFoodLogs(logs);
    } catch (err) {
      setError('Failed to load food logs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadFoodLogs();
    }
  }, [user]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const totals = calculateDailyTotals(foodLogs);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen p-8">
      <main className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Food Tracker</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Log and track your daily meals and nutrition.
          </p>
        </div>

        <div className="grid gap-6">
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Nutrition Overview</h2>
            <NutritionCharts
              macros={{
                protein: Math.round(totals.protein),
                carbs: Math.round(totals.carbs),
                fat: Math.round(totals.fat),
              }}
              calories={{
                consumed: Math.round(totals.calories),
                target: CALORIE_TARGET,
              }}
            />
          </section>

          <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Add Food Entry</h2>
            <FoodEntryForm onFoodLogged={loadFoodLogs} />
          </section>

          <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Today&apos;s Food Log</h2>
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              </div>
            ) : error ? (
              <div className="p-4 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg">
                {error}
              </div>
            ) : foodLogs.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No foods logged today</p>
            ) : (
              <div className="space-y-4">
                {['breakfast', 'lunch', 'dinner', 'snack'].map((mealType) => {
                  const mealLogs = foodLogs.filter(log => log.meal_type === mealType);
                  if (mealLogs.length === 0) return null;

                  return (
                    <div key={mealType} className="space-y-2">
                      <h3 className="font-medium capitalize">{mealType}</h3>
                      <div className="divide-y dark:divide-gray-700">
                        {mealLogs.map((log) => (
                          <div key={log.id} className="py-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium">{log.food_data.description}</div>
                                <div className="text-sm text-gray-500">
                                  {log.quantity} serving{log.quantity !== 1 ? 's' : ''} •{' '}
                                  {Math.round(log.food_data.nutrients.calories * log.quantity)} kcal
                                </div>
                              </div>
                              <div className="text-sm text-gray-500">
                                {formatTime(log.created_at)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
} 