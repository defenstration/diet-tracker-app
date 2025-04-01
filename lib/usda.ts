const USDA_API_KEY = process.env.NEXT_PUBLIC_USDA_API_KEY;
const USDA_API_BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

interface USDANutrient {
  nutrientId: number;
  nutrientName: string;
  nutrientNumber: string;
  unitName: string;
  value: number;
}

interface USDAFoodResponse {
  fdcId: number;
  description: string;
  brandOwner?: string;
  ingredients?: string;
  servingSize?: number;
  servingSizeUnit?: string;
  foodNutrients: USDANutrient[];
}

export interface FoodItem {
  fdcId: string;
  description: string;
  brandOwner?: string;
  ingredients?: string;
  servingSize?: number;
  servingSizeUnit?: string;
  nutrients: {
    protein: number;
    carbohydrates: number;
    fat: number;
    calories: number;
  };
}

export async function searchFoodByQuery(query: string): Promise<FoodItem[]> {
  const response = await fetch(`${USDA_API_BASE_URL}/foods/search?api_key=${USDA_API_KEY}&query=${encodeURIComponent(query)}&pageSize=25&dataType=Branded`);
  const data = await response.json();
  
  if (!data.foods) {
    return [];
  }
  
  return data.foods.map((food: USDAFoodResponse) => parseFood(food));
}

export async function getFoodByUPC(upc: string): Promise<FoodItem | null> {
  const response = await fetch(`${USDA_API_BASE_URL}/foods/search?api_key=${USDA_API_KEY}&query=${upc}&dataType=Branded`);
  const data = await response.json();
  
  if (data.foods && data.foods.length > 0) {
    return parseFood(data.foods[0]);
  }
  return null;
}

function parseFood(food: USDAFoodResponse): FoodItem {
  const getNutrientValue = (nutrients: USDANutrient[], nutrientNumbers: string[]): number => {
    const nutrient = nutrients.find(n => nutrientNumbers.includes(n.nutrientNumber));
    return nutrient ? nutrient.value : 0;
  };

  // USDA nutrient numbers
  const PROTEIN_NUMBERS = ['203', '1003'];
  const CARBS_NUMBERS = ['205', '1005'];
  const FAT_NUMBERS = ['204', '1004'];
  const CALORIES_NUMBERS = ['208', '1008'];

  return {
    fdcId: food.fdcId.toString(),
    description: food.description,
    brandOwner: food.brandOwner,
    ingredients: food.ingredients,
    servingSize: food.servingSize,
    servingSizeUnit: food.servingSizeUnit,
    nutrients: {
      protein: getNutrientValue(food.foodNutrients, PROTEIN_NUMBERS),
      carbohydrates: getNutrientValue(food.foodNutrients, CARBS_NUMBERS),
      fat: getNutrientValue(food.foodNutrients, FAT_NUMBERS),
      calories: getNutrientValue(food.foodNutrients, CALORIES_NUMBERS),
    }
  };
} 