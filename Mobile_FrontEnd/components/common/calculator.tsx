// components/common/calculator.tsx
import type { DailyMealPlan } from "../../context/MealsContext";

/* =======================
   HELPERS
======================= */

function isItemConsumed(item: DailyMealPlan["meals"][0]["items"][0]): boolean {
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

  return false;
}

/* =======================
   MAIN CALCULATOR
======================= */

export function calculateDailySummary(
  meals: DailyMealPlan["meals"],
  dailyTotals: DailyMealPlan["dailyTotals"]
) {
  const consumed = {
    calories: 0,
    protein: 0,
    carb: 0,
    fat: 0,
  };

  // 🚨 YEŞİL TİK YOK – HER ZAMAN ITEM ITEM
  meals.forEach(meal => {
    meal.items.forEach(item => {
      if (isItemConsumed(item)) {
        consumed.calories += item.calories;
        consumed.protein += item.protein;
        consumed.carb += item.carb;
        consumed.fat += item.fat;
      }
    });
  });

  const remaining = {
    calories: Math.max(dailyTotals.calories - consumed.calories, 0),
    protein: Math.max(dailyTotals.protein - consumed.protein, 0),
    carb: Math.max(dailyTotals.carb - consumed.carb, 0),
    fat: Math.max(dailyTotals.fat - consumed.fat, 0),
  };

  return {
    calories: {
      target: dailyTotals.calories,
      consumed: consumed.calories,
      remaining: remaining.calories,
    },
    macros: {
      protein: {
        target: dailyTotals.protein,
        consumed: consumed.protein,
        remaining: remaining.protein,
      },
      carb: {
        target: dailyTotals.carb,
        consumed: consumed.carb,
        remaining: remaining.carb,
      },
      fat: {
        target: dailyTotals.fat,
        consumed: consumed.fat,
        remaining: remaining.fat,
      },
    },
  };
}
