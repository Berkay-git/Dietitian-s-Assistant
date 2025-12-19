// components/common/calculator.tsx

interface Meal {
  totalCalories: number;
  totalProtein: number;
  totalCarb: number;
  totalFat: number;
  isCompleted: boolean;
}

interface DailyTotals {
  calories: number;
  protein: number;
  carb: number;
  fat: number;
}

export function calculateDailySummary(
  meals: Meal[],
  dailyTotals: DailyTotals
) {
  // 1️⃣ Consumed = sadece tamamlanan (isCompleted === true) öğünler
  const consumed = meals
    .filter(meal => meal.isCompleted)
    .reduce(
      (acc, meal) => {
        acc.calories += meal.totalCalories;
        acc.protein += meal.totalProtein;
        acc.carb += meal.totalCarb;
        acc.fat += meal.totalFat;
        return acc;
      },
      { calories: 0, protein: 0, carb: 0, fat: 0 }
    );

  // 2️⃣ Target = backend'den gelen dailyTotals
  const target = {
    calories: dailyTotals.calories,
    protein: dailyTotals.protein,
    carb: dailyTotals.carb,
    fat: dailyTotals.fat,
  };

  // 3️⃣ Remaining = target - consumed
  const remaining = {
    calories: Math.max(target.calories - consumed.calories, 0),
    protein: Math.max(target.protein - consumed.protein, 0),
    carb: Math.max(target.carb - consumed.carb, 0),
    fat: Math.max(target.fat - consumed.fat, 0),
  };

  return {
    calories: {
      target: target.calories,
      consumed: consumed.calories,
      remaining: remaining.calories,
    },
    macros: {
      protein: {
        target: target.protein,
        consumed: consumed.protein,
        remaining: remaining.protein,
      },
      carb: {
        target: target.carb,
        consumed: consumed.carb,
        remaining: remaining.carb,
      },
      fat: {
        target: target.fat,
        consumed: consumed.fat,
        remaining: remaining.fat,
      },
    },
  };
}
