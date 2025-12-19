// components/common/calculator.tsx

/* =======================
   TYPES
======================= */

interface MealItem {
  calories: number;
  protein: number;
  carb: number;
  fat: number;

  isFollowed: boolean | null;
  changedItem: any | null;
  canChange: boolean;
  isLLM: boolean;
}

interface Meal {
  totalCalories: number;
  totalProtein: number;
  totalCarb: number;
  totalFat: number;
  isCompleted: boolean;
  items: MealItem[];
}

interface DailyTotals {
  calories: number;
  protein: number;
  carb: number;
  fat: number;
}

/* =======================
   HELPERS
======================= */

/**
 * Bir item yenmiş mi?
 */
function isItemConsumed(item: MealItem): boolean {
  // 1️⃣ Diyetisyenin verdiğini aynen yemiş
  if (item.isFollowed === true) return true;

  // 2️⃣ Manuel değiştirip yemiş
  if (
    item.isFollowed === false &&
    item.changedItem !== null &&
    item.canChange === true
  ) {
    return true;
  }

  // 3️⃣ LLM ile değiştirip yemiş
  if (
    item.isFollowed === false &&
    item.changedItem !== null &&
    item.canChange === true &&
    item.isLLM === true
  ) {
    return true;
  }

  // ❌ Yenmemiş / feedback yok
  return false;
}

/* =======================
   MAIN CALCULATOR
======================= */

export function calculateDailySummary(
  meals: Meal[],
  dailyTotals: DailyTotals
) {
  const consumed = {
    calories: 0,
    protein: 0,
    carb: 0,
    fat: 0,
  };

  meals.forEach(meal => {
    // ✅ Meal tamamen tamamlandıysa → direkt ekle
    if (meal.isCompleted) {
      consumed.calories += meal.totalCalories;
      consumed.protein += meal.totalProtein;
      consumed.carb += meal.totalCarb;
      consumed.fat += meal.totalFat;
      return;
    }

    // ❓ Meal ? ise → item item kontrol
    meal.items.forEach(item => {
      if (isItemConsumed(item)) {
        consumed.calories += item.calories;
        consumed.protein += item.protein;
        consumed.carb += item.carb;
        consumed.fat += item.fat;
      }
    });
  });

  /* =======================
     TARGETS (Backend)
  ======================= */

  const target = {
    calories: dailyTotals.calories,
    protein: dailyTotals.protein,
    carb: dailyTotals.carb,
    fat: dailyTotals.fat,
  };

  /* =======================
     REMAINING
  ======================= */

  const remaining = {
    calories: Math.max(target.calories - consumed.calories, 0),
    protein: Math.max(target.protein - consumed.protein, 0),
    carb: Math.max(target.carb - consumed.carb, 0),
    fat: Math.max(target.fat - consumed.fat, 0),
  };

  /* =======================
     RETURN SHAPE
  ======================= */

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
