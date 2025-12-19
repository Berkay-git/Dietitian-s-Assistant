from models.models import DailyMealPlan
from db_config import db
from services.meal_service import get_meals_by_clientid_and_date
from datetime import datetime, date

def get_daily_meal_plan(client_id, plan_date):
    """
    Get daily meal plan details with all meals (works for both current and past dates, General function to pull daily plan)
        
    Returns:
        dict: Daily meal plan with meals, daily totals, and status (current/past)
    """
    try:
        meal_plan = DailyMealPlan.query.filter_by(
            ClientID=client_id,
            PlanDate=plan_date
        ).first()
        
        if not meal_plan:
            return None
        
        # Get all meals for this plan using meal_service
        meals = get_meals_by_clientid_and_date(client_id, plan_date)
        
        # Calculate daily totals from all meals
        daily_total_calories = sum(meal['totalCalories'] for meal in meals)
        daily_total_protein = sum(meal['totalProtein'] for meal in meals)
        daily_total_carb = sum(meal['totalCarb'] for meal in meals)
        daily_total_fat = sum(meal['totalFat'] for meal in meals)
        
        # Determine if this is current, past, or future plan
        today = date.today()
        if plan_date < today:
            plan_status = 'past'
        elif plan_date == today:
            plan_status = 'current'
        else:
            plan_status = 'future'
        
        # Check if all meals are completed (only relevant for current/past dates)
        all_completed = all(meal['isCompleted'] for meal in meals) if meals else False
        
        return {
            'mealPlanID': meal_plan.MealPlanID,
            'clientID': meal_plan.ClientID,
            'planDate': meal_plan.PlanDate.isoformat(),
            'createdAt': meal_plan.CreatedAt.isoformat() if meal_plan.CreatedAt else None,
            'planStatus': plan_status,  # 'past', 'current', or 'future'
            'isPast': plan_status == 'past',
            'isCurrent': plan_status == 'current',
            'allMealsCompleted': all_completed,
            'dailyTotals': {
                'calories': round(daily_total_calories, 0),
                'protein': round(daily_total_protein, 1),
                'carb': round(daily_total_carb, 1),
                'fat': round(daily_total_fat, 1)
            },
            'meals': meals,
            'mealCount': len(meals)
        }
        
    except Exception as e:
        print(f"Error in get_daily_meal_plan: {str(e)}")
        return None

def get_available_plan_dates(client_id):
    """
    Get all dates that have meal plans for a client (for date picker box we will use this to fill it)

    Returns:
        list: List of dates (ISO format strings) that have meal plans
    """
    try:
        meal_plans = DailyMealPlan.query.filter_by(
            ClientID=client_id
        ).order_by(DailyMealPlan.PlanDate.desc()).all()
        
        available_dates = [plan.PlanDate.isoformat() for plan in meal_plans]
        
        return available_dates
        
    except Exception as e:
        print(f"Error in get_available_plan_dates: {str(e)}")
        return []

def get_current_meal_plan(client_id):
    """
    Get today's meal plan for a client (Default when user opens the app)

    Returns:
        dict: Today's meal plan or None if not found
    """
    today = date.today()
    return get_daily_meal_plan(client_id, today)