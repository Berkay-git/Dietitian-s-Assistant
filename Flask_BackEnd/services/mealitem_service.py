from models.models import MealItem, Meal, DailyMealPlan, Item
from db_config import db
from services.item_service import get_item_by_id, calculate_item_calories, calculate_portion_calories

def get_mealitems_by_clientid(client_id, plan_date=None):
    """
    (It will be used for feedback system)
    Get all meal items for a client, optionally filtered by date
    
    Args:
        client_id (str): The ClientID
        plan_date (date, optional): Filter by specific date
        
    Returns:
        list: List of meal items with calculated values
    """
    try:
        # Query to get meal items for the client
        query = db.session.query(MealItem, Meal, DailyMealPlan).join(
            Meal, MealItem.MealID == Meal.MealID
        ).join(
            DailyMealPlan, Meal.MealPlanID == DailyMealPlan.MealPlanID
        ).filter(
            DailyMealPlan.ClientID == client_id
        )
        
        # Apply date filter if provided
        if plan_date:
            query = query.filter(DailyMealPlan.PlanDate == plan_date)
        
        results = query.all()
        
        meal_items_data = []
        
        for meal_item, meal, daily_plan in results:
            # Get item details
            item = get_item_by_id(meal_item.ItemID)
            
            if not item:
                continue
            
            # Calculate calories
            total_calories_per_100g = calculate_item_calories(
                item['ItemProtein'],
                item['ItemCarb'],
                item['ItemFat']
            )
            
            portion_calories = calculate_portion_calories(
                total_calories_per_100g,
                meal_item.ConsumeAmount
            )
            
            # Determine if meal is completed
            # isCompleted is false only if isFollowed is NULL
            is_completed = meal_item.isFollowed is not None
            
            meal_items_data.append({
                'MealID': meal_item.MealID,
                'ItemID': meal_item.ItemID,
                'name': item['ItemName'],
                'portion': f"{item['ItemName']}, {meal_item.ConsumeAmount} grams",
                'calories': round(portion_calories, 0),
                'consumeAmount': meal_item.ConsumeAmount,
                'canChange': meal_item.canChange,
                'isFollowed': meal_item.isFollowed,
                'isCompleted': is_completed,
                'changedItem': meal_item.ChangedItem,
                'isLLM': meal_item.isLLM,
                'planDate': daily_plan.PlanDate.isoformat(),
                'mealStart': meal.MealStart.isoformat() if meal.MealStart else None,
                'mealEnd': meal.MealEnd.isoformat() if meal.MealEnd else None,
                # Nutritional details
                'protein': round(item['ItemProtein'] * (meal_item.ConsumeAmount / 100), 1),
                'carb': round(item['ItemCarb'] * (meal_item.ConsumeAmount / 100), 1),
                'fat': round(item['ItemFat'] * (meal_item.ConsumeAmount / 100), 1),
                'fiber': round(item['ItemFiber'] * (meal_item.ConsumeAmount / 100), 1) if item['ItemFiber'] else 0
            })
        
        return meal_items_data
        
    except Exception as e:
        print(f"Error in get_mealitems_by_clientid: {str(e)}")
        return []

def get_meal_items_by_mealid(meal_id):
    """
    Get all items for a specific meal with calculated values and totals
        
    Returns:
        dict: Meal data with items and totals, or None if not found
    """
    try:
        # Query to get meal items for the specific meal
        meal_items = MealItem.query.filter_by(MealID=meal_id).all()
        
        if not meal_items:
            return None
        
        # Get meal details
        meal = Meal.query.filter_by(MealID=meal_id).first()
        if not meal:
            return None
        
        items_list = []
        total_calories = 0
        total_protein = 0
        total_carb = 0
        total_fat = 0
        is_completed = True  # Will be set to False if any item is not completed
        
        for meal_item in meal_items:
            # Get item details
            item = get_item_by_id(meal_item.ItemID)
            
            if not item:
                continue
            
            # Calculate calories
            total_calories_per_100g = calculate_item_calories(
                item['ItemProtein'],
                item['ItemCarb'],
                item['ItemFat']
            )
            
            portion_calories = calculate_portion_calories(
                total_calories_per_100g,
                meal_item.ConsumeAmount
            )
            
            # Calculate macro values for this portion
            protein = item['ItemProtein'] * (meal_item.ConsumeAmount / 100)
            carb = item['ItemCarb'] * (meal_item.ConsumeAmount / 100)
            fat = item['ItemFat'] * (meal_item.ConsumeAmount / 100)
            
            # Add to totals
            total_calories += portion_calories
            total_protein += protein
            total_carb += carb
            total_fat += fat
            
            # Check if item is completed
            item_completed = meal_item.isFollowed is not None
            if not item_completed:
                is_completed = False
            
            items_list.append({
                'name': item['ItemName'],
                'portion': f"{item['ItemName']}, {meal_item.ConsumeAmount} grams",
                'calories': round(portion_calories, 0),
                'protein': round(protein, 1),
                'carb': round(carb, 1),
                'fat': round(fat, 1),
                'canChange': meal_item.canChange,
                'isFollowed': meal_item.isFollowed,
                'isLLM': meal_item.isLLM,
                'changedItem': meal_item.ChangedItem,
            })
        
        # After all return the meal data (We will call iteration on meal_service to get meal details)
        return {
            'mealID': meal_id,
            'mealName': meal.MealName,
            # 'mealStart': meal.MealStart.isoformat() if meal.MealStart else None,
            # 'mealEnd': meal.MealEnd.isoformat() if meal.MealEnd else None,
            'timeRange': f"{meal.MealStart.isoformat()[:5]} - {meal.MealEnd.isoformat()[:5]}" if meal.MealStart and meal.MealEnd else "N/A",
            'totalCalories': round(total_calories, 0),
            'totalProtein': round(total_protein, 1),
            'totalCarb': round(total_carb, 1),
            'totalFat': round(total_fat, 1),
            'isCompleted': is_completed,
            'items': items_list
        }
        
    except Exception as e:
        print(f"Error in get_meal_items_by_mealid: {str(e)}")
        return None
    
    
def give_feedback_on_mealitem_manually(client_id, meal_id, item_id, changedItem, is_followed, isLLM = 0):
    """
    Manually give feedback on a meal item (hand-entered feedback)
    Updates isFollowed, changedItem, and isLLM is always be set to 0
    
    Returns:
        tuple: (success: bool, message: str, updated_item: dict or None)
    """
    try:
        # First verify that this meal belongs to the client
        meal = Meal.query.filter_by(MealID=meal_id).first()
        if not meal:
            return False, "Meal not found", None
        
        # Verify the meal plan belongs to the client
        daily_plan = DailyMealPlan.query.filter_by(
            MealPlanID=meal.MealPlanID,
            ClientID=client_id
        ).first()
        
        if not daily_plan:
            return False, "This meal does not belong to the specified client", None
        
        # Find the meal item
        meal_item = MealItem.query.filter_by(
            MealID=meal_id,
            ItemID=item_id
        ).first()
        
        if not meal_item:
            return False, "Meal item not found", None
        
        # It will not be overwritten of an itemID so we can track what changed with what.
        # UI should be designed to show the previous and new item if changedItem is not null.
        # Update the meal item with manual feedback
        meal_item.isFollowed = is_followed
        meal_item.ChangedItem = changedItem if changedItem else None
        meal_item.isLLM = isLLM 
        
        # Commit changes to database
        db.session.commit()
        
        # Get item details for response
        item = get_item_by_id(item_id)
        if not item:
            return False, "Item details not found", None
        
        # Calculate values for response
        total_calories_per_100g = calculate_item_calories(
            item['ItemProtein'],
            item['ItemCarb'],
            item['ItemFat']
        )
        
        portion_calories = calculate_portion_calories(
            total_calories_per_100g,
            meal_item.ConsumeAmount
        )
        
        updated_item_data = {
            'MealID': meal_item.MealID,
            'ItemID': meal_item.ItemID,
            'name': item['ItemName'],
            'portion': f"{item['ItemName']}, {meal_item.ConsumeAmount} grams",
            'calories': round(portion_calories, 0),
            'consumeAmount': meal_item.ConsumeAmount,
            'canChange': meal_item.canChange,
            'isFollowed': meal_item.isFollowed,
            'isCompleted': True,  # Now it's completed since we gave feedback
            'changedItem': meal_item.ChangedItem,
            'isLLM': meal_item.isLLM,
            'protein': round(item['ItemProtein'] * (meal_item.ConsumeAmount / 100), 1),
            'carb': round(item['ItemCarb'] * (meal_item.ConsumeAmount / 100), 1),
            'fat': round(item['ItemFat'] * (meal_item.ConsumeAmount / 100), 1)
        }
        
        return True, "Feedback successfully saved", updated_item_data
        
    except Exception as e:
        db.session.rollback()
        print(f"Error in give_feedback_on_mealitem_manually: {str(e)}")
        return False, f"Server error: {str(e)}", None
    



def get_all_items():
    try:
        items = Item.query.all()


        items_list = []

        for item in items:
            total_calories_per_100g = calculate_item_calories(
                item.ItemProtein,
                item.ItemCarb,
                item.ItemFat
            )

            items_list.append({
                "ItemID": item.ItemID,
                "ItemName": item.ItemName,
                "ItemCalories": round(total_calories_per_100g, 0),
                "ItemProtein": item.ItemProtein,
                "ItemCarb": item.ItemCarb,
                "ItemFat": item.ItemFat,
            })

        return items_list

    except Exception as e:
        print(f"Error in get_all_items: {str(e)}")
        raise

        
    except Exception as e:
        print(f"Error in get_all_items: {str(e)}")
        return []