from models.models import DailyMealPlan, Meal
from db_config import db
from services.mealitem_service import get_meal_items_by_mealid

def get_meals_by_clientid_and_date(client_id, plan_date):
    """
    Get all meals for a client on specific date with items and totals
        
    Returns:
        list: List of meals with names, items, and totals
    """
    try:
        # Get the meal plan for the date
        meal_plan = DailyMealPlan.query.filter_by(
            ClientID=client_id,
            PlanDate=plan_date
        ).first()
        
        if not meal_plan:
            return []
        
        # Get all meals for this plan
        meals = Meal.query.filter_by(MealPlanID=meal_plan.MealPlanID).all()
        
        meals_data = []
        
        for meal in meals:
            # Get meal items and totals from mealitem_service
            meal_data = get_meal_items_by_mealid(meal.MealID)
            
            if meal_data:
                meals_data.append(meal_data) #All data is coming rom mealitem_service return statement, if anything needed update there.
        
        return meals_data
        
    except Exception as e:
        print(f"Error in get_meals_by_clientid_and_date: {str(e)}")
        return []