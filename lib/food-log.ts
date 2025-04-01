import { supabase } from './supabase';
import { FoodItem } from './usda';

export interface FoodLogEntry {
  id: string;
  created_at: string;
  food_id: string;
  user_id: string;
  date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  quantity: number;
  food_data: FoodItem;
}

export async function logFood(
  foodItem: FoodItem,
  quantity: number,
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('User not authenticated');
  }

  try {
    // First, store or retrieve the food in the foods table
    const { data: existingFood } = await supabase
      .from('foods')
      .select('*')
      .eq('barcode', foodItem.fdcId)
      .single();

    let food = existingFood;

    if (!food) {
      // Food doesn't exist, insert it
      const { data: newFood, error: insertError } = await supabase
        .from('foods')
        .insert({
          name: foodItem.description,
          calories: foodItem.nutrients.calories,
          protein: foodItem.nutrients.protein,
          carbs: foodItem.nutrients.carbohydrates,
          fat: foodItem.nutrients.fat,
          barcode: foodItem.fdcId,
          user_id: user.id,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error storing food:', insertError);
        throw new Error(`Failed to store food data: ${insertError.message}`);
      }
      food = newFood;
    }

    // Now log the food entry
    const { data: logEntry, error: logError } = await supabase
      .from('food_logs')
      .insert({
        food_id: food.id,
        user_id: user.id,
        date: new Date().toISOString().split('T')[0],
        meal_type: mealType,
        quantity,
      })
      .select()
      .single();

    if (logError) {
      console.error('Error logging food:', logError);
      throw new Error(`Failed to log food: ${logError.message}`);
    }

    // Return the complete food log entry with food data
    return {
      ...logEntry,
      food_data: {
        fdcId: food.barcode,
        description: food.name,
        nutrients: {
          calories: food.calories,
          protein: food.protein,
          carbohydrates: food.carbs,
          fat: food.fat,
        }
      }
    } as FoodLogEntry;
  } catch (error) {
    console.error('Error in logFood:', error);
    throw error;
  }
}

export async function getTodaysFoodLogs(): Promise<FoodLogEntry[]> {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('User not authenticated');
  }

  try {
    const today = new Date().toISOString().split('T')[0];
    
    // First, get all food logs for today
    const { data: logs, error } = await supabase
      .from('food_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching food logs:', error);
      throw new Error(`Failed to fetch food logs: ${error.message}`);
    }

    if (!logs || logs.length === 0) {
      return [];
    }

    // Then, get the corresponding food items
    const foodIds = logs.map(log => log.food_id);
    const { data: foods, error: foodsError } = await supabase
      .from('foods')
      .select('*')
      .in('id', foodIds);

    if (foodsError) {
      console.error('Error fetching foods:', foodsError);
      throw new Error(`Failed to fetch foods: ${foodsError.message}`);
    }

    // Create a map of food items by ID for easy lookup
    const foodMap = new Map(foods?.map(food => [food.id, food]));

    // Transform the data to match FoodLogEntry interface
    return logs.map(log => {
      const food = foodMap.get(log.food_id);
      if (!food) {
        console.error('Missing food data for log:', log);
        return null;
      }

      return {
        ...log,
        food_data: {
          fdcId: food.barcode,
          description: food.name,
          nutrients: {
            calories: food.calories,
            protein: food.protein,
            carbohydrates: food.carbs,
            fat: food.fat,
          }
        }
      };
    }).filter(Boolean) as FoodLogEntry[];
  } catch (error) {
    console.error('Error in getTodaysFoodLogs:', error);
    throw error;
  }
}

export function calculateDailyTotals(logs: FoodLogEntry[]) {
  return logs.reduce(
    (totals, entry) => {
      const quantity = entry.quantity;
      const nutrients = entry.food_data.nutrients;
      
      return {
        calories: totals.calories + nutrients.calories * quantity,
        protein: totals.protein + nutrients.protein * quantity,
        carbs: totals.carbs + nutrients.carbohydrates * quantity,
        fat: totals.fat + nutrients.fat * quantity,
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
} 