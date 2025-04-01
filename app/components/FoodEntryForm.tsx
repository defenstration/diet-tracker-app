'use client';

import { useState } from 'react';
import { FoodItem, searchFoodByQuery, getFoodByUPC } from '@/lib/usda';
import { logFood } from '@/lib/food-log';
import BarcodeScanner from './BarcodeScanner';

interface FoodWithQuantity extends FoodItem {
  quantity: number;
}

export default function FoodEntryForm({ onFoodLogged }: { onFoodLogged: () => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [selectedMealTypes, setSelectedMealTypes] = useState<{ [key: string]: 'breakfast' | 'lunch' | 'dinner' | 'snack' }>({});

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const results = await searchFoodByQuery(searchQuery);
      setSearchResults(results);
      // Initialize quantities and meal types for new results
      const newQuantities = results.reduce((acc, food) => {
        acc[food.fdcId] = 1;
        return acc;
      }, {} as { [key: string]: number });
      const newMealTypes = results.reduce((acc, food) => {
        acc[food.fdcId] = 'breakfast';
        return acc;
      }, {} as { [key: string]: 'breakfast' | 'lunch' | 'dinner' | 'snack' });
      setQuantities(newQuantities);
      setSelectedMealTypes(newMealTypes);
    } catch (err) {
      setError('Failed to search for food. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBarcodeDetected = async (barcode: string) => {
    setIsScanning(false);
    setLoading(true);
    setError(null);
    try {
      const food = await getFoodByUPC(barcode);
      if (food) {
        setSearchResults([food]);
        setQuantities({ [food.fdcId]: 1 });
        setSelectedMealTypes({ [food.fdcId]: 'breakfast' });
      } else {
        setError('Food not found for this barcode.');
      }
    } catch (err) {
      setError('Failed to look up barcode. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (fdcId: string, newQuantity: number) => {
    setQuantities(prev => ({
      ...prev,
      [fdcId]: Math.max(0.25, Math.min(99, newQuantity))
    }));
  };

  const updateMealType = (fdcId: string, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    setSelectedMealTypes(prev => ({
      ...prev,
      [fdcId]: mealType
    }));
  };

  const handleLogFood = async (food: FoodItem) => {
    try {
      setLoading(true);
      await logFood(
        food,
        quantities[food.fdcId] || 1,
        selectedMealTypes[food.fdcId] || 'breakfast'
      );
      onFoodLogged();
      // Clear the search results after successful logging
      setSearchResults([]);
      setSearchQuery('');
    } catch (err) {
      setError('Failed to log food. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateNutrients = (food: FoodItem, quantity: number) => {
    return {
      calories: Math.round(food.nutrients.calories * quantity),
      protein: Math.round(food.nutrients.protein * quantity * 10) / 10,
      carbs: Math.round(food.nutrients.carbohydrates * quantity * 10) / 10,
      fat: Math.round(food.nutrients.fat * quantity * 10) / 10,
    };
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a food..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => setIsScanning(!isScanning)}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            {isScanning ? 'Cancel Scan' : 'Scan Barcode'}
          </button>
        </div>
      </form>

      {isScanning && (
        <div className="mt-4">
          <BarcodeScanner
            onDetected={handleBarcodeDetected}
            onError={(error) => {
              console.error('Barcode scanning error:', error);
              setError('Failed to scan barcode. Please try again.');
            }}
          />
        </div>
      )}

      {error && (
        <div className="p-4 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold">Search Results</h3>
          <div className="grid gap-4">
            {searchResults.map((food) => {
              const quantity = quantities[food.fdcId] || 1;
              const adjustedNutrients = calculateNutrients(food, quantity);
              const mealType = selectedMealTypes[food.fdcId] || 'breakfast';
              
              return (
                <div
                  key={food.fdcId}
                  className="p-4 border rounded-lg dark:border-gray-700"
                >
                  <h4 className="font-medium">{food.description}</h4>
                  {food.brandOwner && (
                    <p className="text-sm text-gray-500">{food.brandOwner}</p>
                  )}
                  
                  <div className="mt-4 flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <label htmlFor={`quantity-${food.fdcId}`} className="text-sm font-medium">
                        Servings:
                      </label>
                      <input
                        id={`quantity-${food.fdcId}`}
                        type="number"
                        min="0.25"
                        max="99"
                        step="0.25"
                        value={quantity}
                        onChange={(e) => updateQuantity(food.fdcId, parseFloat(e.target.value))}
                        className="w-20 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>
                    {food.servingSize && food.servingSizeUnit && (
                      <span className="text-sm text-gray-500">
                        (1 serving = {food.servingSize}{food.servingSizeUnit})
                      </span>
                    )}
                    <div className="flex items-center gap-2">
                      <label htmlFor={`meal-${food.fdcId}`} className="text-sm font-medium">
                        Meal:
                      </label>
                      <select
                        id={`meal-${food.fdcId}`}
                        value={mealType}
                        onChange={(e) => updateMealType(food.fdcId, e.target.value as 'breakfast' | 'lunch' | 'dinner' | 'snack')}
                        className="px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                      >
                        <option value="breakfast">Breakfast</option>
                        <option value="lunch">Lunch</option>
                        <option value="dinner">Dinner</option>
                        <option value="snack">Snack</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div>Calories: {adjustedNutrients.calories}kcal</div>
                    <div>Protein: {adjustedNutrients.protein}g</div>
                    <div>Carbs: {adjustedNutrients.carbs}g</div>
                    <div>Fat: {adjustedNutrients.fat}g</div>
                  </div>

                  {food.ingredients && (
                    <div className="mt-2 text-sm text-gray-500">
                      <strong>Ingredients:</strong> {food.ingredients}
                    </div>
                  )}

                  <button
                    className="mt-4 w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    onClick={() => handleLogFood(food)}
                    disabled={loading}
                  >
                    Log Food
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
} 