'use client';

import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface NutritionChartsProps {
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  calories: {
    consumed: number;
    target: number;
  };
}

export default function NutritionCharts({ macros, calories }: NutritionChartsProps) {
  const macroData = {
    labels: ['Protein', 'Carbs', 'Fat'],
    datasets: [
      {
        data: [macros.protein * 4, macros.carbs * 4, macros.fat * 9],
        backgroundColor: [
          'rgb(239, 68, 68)',
          'rgb(59, 130, 246)',
          'rgb(234, 179, 8)',
        ],
        hoverBackgroundColor: [
          'rgb(220, 38, 38)',
          'rgb(37, 99, 235)',
          'rgb(202, 138, 4)',
        ],
      },
    ],
  };

  const calorieData = {
    labels: ['Calories'],
    datasets: [
      {
        label: 'Consumed',
        data: [calories.consumed],
        backgroundColor: 'rgb(59, 130, 246)',
      },
      {
        label: 'Target',
        data: [calories.target],
        backgroundColor: 'rgb(220, 38, 38)',
      },
    ],
  };

  const calorieOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        max: Math.max(calories.target, calories.consumed) * 1.2,
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Calorie Goal Progress',
      },
    },
  };

  const macroOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Macronutrient Distribution (calories)',
      },
    },
  };

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <Doughnut data={macroData} options={macroOptions} />
        <div className="mt-4 grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <div className="font-medium">Protein</div>
            <div>{macros.protein}g</div>
          </div>
          <div>
            <div className="font-medium">Carbs</div>
            <div>{macros.carbs}g</div>
          </div>
          <div>
            <div className="font-medium">Fat</div>
            <div>{macros.fat}g</div>
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <Bar data={calorieData} options={calorieOptions} />
        <div className="mt-4 text-center">
          <div className="text-sm font-medium">
            {calories.consumed} / {calories.target} kcal
          </div>
          <div className="text-sm text-gray-500">
            {Math.round((calories.consumed / calories.target) * 100)}% of daily goal
          </div>
        </div>
      </div>
    </div>
  );
} 