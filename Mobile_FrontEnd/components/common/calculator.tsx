// components/common/calculator.tsx
import type { DailyMealPlan } from "../../context/MealsContext";

/* =======================
   HELPERS
======================= */
function parseChangedItemTotals(changedItem: string) {
  let totals = {
    calories: 0,
    protein: 0,
    carb: 0,
    fat: 0,
  };

  const items = changedItem.split(";");

  items.forEach(itemStr => {
    const parts = itemStr.split(",");
    if (parts.length === 6) {
      totals.calories += Number(parts[2]) || 0;
      totals.protein += Number(parts[3]) || 0;
      totals.carb += Number(parts[4]) || 0;
      totals.fat += Number(parts[5]) || 0;
    }
  });

  return totals;
}

function isItemConsumed(item: DailyMealPlan["meals"][0]["items"][0]): boolean {
  //  Diyetisyenin verdiğini aynen yemiş
  if (item.isFollowed === true) return true;

  //  Manuel değiştirip yemiş
  if (
    item.isFollowed === false &&
    item.changedItem !== null 
  ) {
    return true;
  }

  //  LLM ile değiştirip yemiş
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

  //  YEŞİL TİK YOK – HER ZAMAN ITEM ITEM
  meals.forEach(meal => {
    meal.items.forEach(item => {
      if (!isItemConsumed(item)) return;

      if (item.changedItem) {
        const changedTotals = parseChangedItemTotals(item.changedItem);

        consumed.calories += changedTotals.calories;
        consumed.protein += changedTotals.protein;
        consumed.carb += changedTotals.carb;
        consumed.fat += changedTotals.fat;
      } else {
        consumed.calories += item.calories;
        consumed.protein += item.protein;
        consumed.carb += item.carb;
        consumed.fat += item.fat;
      }
    });
  });

  const remaining = {
    calories: dailyTotals.calories - consumed.calories,
    protein: dailyTotals.protein - consumed.protein,
    carb: dailyTotals.carb - consumed.carb,
    fat: dailyTotals.fat - consumed.fat,
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
