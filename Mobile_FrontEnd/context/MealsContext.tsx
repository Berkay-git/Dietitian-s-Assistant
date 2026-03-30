import React, { createContext, useContext, useState, ReactNode } from 'react';
import axios from 'axios'; // npm install axios
import { API_URL } from '../config/ipconfig';  // API_URL imported from config/ipconfig.ts

export interface MealItem {
  itemID: string;
  mealID: string;
  clientID: string;
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carb: number;
  fat: number;
  // Burdan aşağısı kalori çembri için ekliyorum
  isFollowed: boolean | null;
  changedItem: any | null;
  canChange: boolean;
  isLLM: boolean;
}

export interface Meal {
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

export interface DailyMealPlan {
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


  // ===================== SORT HELPERS (EKLENDI) =====================
  const timeToMinutes = (t: string) => {
    // "08:00:00" veya "08:00" gelirse de çalışır
    const parts = (t ?? "").split(":");
    const hh = Number(parts[0] ?? 0);
    const mm = Number(parts[1] ?? 0);
    return hh * 60 + mm;
  };

  const rangeStartToMinutes = (range: string) => {
    // "08:00:00 - 10:00:00" ise başlangıcı al, değilse direkt kullan
    const safe = range ?? "";
    const start = safe.includes("-") ? safe.split("-")[0].trim() : safe.trim();
    return timeToMinutes(start);
  };

  const sortMealsByTime = (meals: Meal[]) =>
    (meals ?? [])
      .slice() // state mutate yok
      .sort((a, b) => rangeStartToMinutes(a.timeRange) - rangeStartToMinutes(b.timeRange));
  // ================================================================

  const fetchMealPlan = async (clientId: string, planDate?: string) => {
    setLoading(true);
    setError(null);

    try {
      // Save params for refresh
      setLastFetchParams({ clientId, planDate });

      // Build URL with query parameters
      let url = `${API_URL}/meals?client_id=${clientId}`;
      if (planDate) {
        url += `&plan_date=${planDate}`;
      }

      const response = await axios.get(url);

      if (response.data.success) {
        const plan: DailyMealPlan = response.data.data;

        // meals'ı timeRange'e göre burada otomatik sortluyoruz
        const sortedPlan: DailyMealPlan = {
          ...plan,
          meals: sortMealsByTime(plan.meals),
        };

        setDailyMealPlan(sortedPlan);
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
