import React, { createContext, useContext, useState, ReactNode } from 'react';
import axios from 'axios'; // npm install axios

interface MealItem {
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carb: number;
  fat: number;
}

interface Meal {
  mealID: string;
  mealName: string;
  timeRange: string;
  totalCalories: number;
  totalProtein: number;
  totalCarb: number;
  totalFat: number;
  isCompleted: boolean;
  items: MealItem[];
}

interface DailyMealPlan {
  mealPlanID: string;
  clientID: string;
  planDate: string;
  planStatus: 'past' | 'current' | 'future';
  isPast: boolean;
  isCurrent: boolean;
  allMealsCompleted: boolean;
  dailyTotals: {
    calories: number;
    protein: number;
    carb: number;
    fat: number;
  };
  meals: Meal[];
  mealCount: number;
}

interface MealsContextType {
  dailyMealPlan: DailyMealPlan | null;
  loading: boolean;
  error: string | null;
  fetchMealPlan: (clientId: string, planDate?: string) => Promise<void>;
  refreshMealPlan: () => Promise<void>;
}

const MealsContext = createContext<MealsContextType | undefined>(undefined);

export const MealsProvider = ({ children }: { children: ReactNode }) => {
  const [dailyMealPlan, setDailyMealPlan] = useState<DailyMealPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchParams, setLastFetchParams] = useState<{ clientId: string; planDate?: string } | null>(null);

  const API_URL = 'http://10.143.19.78:5000'; // Backend IP'nizi buraya yazın

  const fetchMealPlan = async (clientId: string, planDate?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Save params for refresh
      setLastFetchParams({ clientId, planDate });

      // Build URL with query parameters
      let url = `${API_URL}/api/dietitian/meals?client_id=${clientId}`;
      if (planDate) {
        url += `&plan_date=${planDate}`;
      }

      const response = await axios.get(url);

      if (response.data.success) {
        setDailyMealPlan(response.data.data);
        setError(null);
      } else {
        setError('Meal plan alınamadı');
      }
    } catch (err: any) {
      console.error('Error fetching meal plan:', err);
      
      if (err.response?.status === 404) {
        setError('Bu tarih için meal plan bulunamadı');
      } else if (err.response?.status === 400) {
        setError('Geçersiz istek');
      } else {
        setError('Meal plan yüklenirken bir hata oluştu');
      }
      
      setDailyMealPlan(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshMealPlan = async () => {
    if (lastFetchParams) {
      await fetchMealPlan(lastFetchParams.clientId, lastFetchParams.planDate);
    }
  };

  return (
    <MealsContext.Provider
      value={{
        dailyMealPlan,
        loading,
        error,
        fetchMealPlan,
        refreshMealPlan,
      }}
    >
      {children}
    </MealsContext.Provider>
  );
};

export const useMeals = () => {
  const context = useContext(MealsContext);
  if (!context) {
    throw new Error('useMeals must be used within a MealsProvider');
  }
  return context;
};