from models.models import MealItem, Meal, DailyMealPlan, Item, Client, PhysicalDetails, MedicalDetails
from db_config import db
from services.item_service import get_item_by_id, calculate_item_calories, calculate_portion_calories

from datetime import date

STATIC_ALTERNATIVE_PROMPT = """
You are a dietitian support assistant.
The information provided has been prepared by a dietitian.

RULES:
- Medical restrictions always take precedence.
- The diet plan cannot be altered.
- Macronutrients should be maintained as close as possible.
- Do not perform calculations; base your reasoning on the given values.
- Do not recommend medical treatment or diagnosis.

Only suggest meals within the framework of the RULES.

OUTPUT RULES:
- The response must be ONLY in valid JSON FORMAT.
- Do not include any text outside the JSON FORMAT.
- If no suitable alternative is available, set status to "no_alternative" and set recommended_food to null.
- If an alternative is found, set status to "ok".


JSON FORMAT:
{
  "status": "ok | no_alternative",
  "recommended_food": "food name - portion"
}
"""




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
    
    
def give_feedback_on_mealitem_manually(client_id, meal_id, item_id, changedItem, is_followed):
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
        meal_item.isLLM = 0  # Always 0 for manual feedback 
        
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
    



def give_feedback_on_mealitem_via_LLM(client_id, meal_id, item_id, accepted_item_json):
    """
    Give feedback on a meal item via LLM suggestion
    Updates isFollowed=0 (always), isLLM=1 (always), and ChangedItem with the accepted alternative

    """
    try:
        # First verify that this meal belongs to the client
        meal = Meal.query.filter_by(MealID=meal_id).first()
        if not meal:
            return False, "Meal not found"
        
        # Verify the meal plan belongs to the client
        daily_plan = DailyMealPlan.query.filter_by(
            MealPlanID=meal.MealPlanID,
            ClientID=client_id
        ).first()
        
        if not daily_plan:
            return False, "This meal does not belong to the specified client"
        
        # Find the meal item
        meal_item = MealItem.query.filter_by(
            MealID=meal_id,
            ItemID=item_id
        ).first()
        
        if not meal_item:
            return False, "Meal item not found"
        
        # Validate the accepted_item_json structure
        if not accepted_item_json or 'recommended_food' not in accepted_item_json:
            return False, "Invalid alternative item format"
        
        recommended_food = accepted_item_json['recommended_food']
        
        # Validate recommended_food has required fields
        if not recommended_food or 'name' not in recommended_food or 'portion' not in recommended_food:
            return False, "Invalid recommended_food format"
        
        # Create a formatted string with both name and portion
        changed_item_text = f"{recommended_food.get('name', 'Unknown')} - {recommended_food.get('portion', 'Unknown portion')}"
        
        # Update for LLM suggestion
        meal_item.ChangedItem = changed_item_text
        meal_item.isFollowed = 0  # Always 0 for LLM changes
        meal_item.isLLM = 1  # Always 1 for LLM suggestions
        
        # Commit changes to database
        db.session.commit()
        
        return True, "LLM alternative successfully accepted and saved"
        
    except Exception as e:
        db.session.rollback()
        print(f"Error in give_feedback_on_mealitem_via_LLM: {str(e)}")
        import traceback
        traceback.print_exc()
        return False, f"Server error: {str(e)}"




def get_all_items():
    """
    Get all available items from the database.
    
    Returns:
        list: List of items with their details
    """
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
                'ItemID': item.ItemID,
                'ItemName': item.ItemName,
                'ItemCalories': round(total_calories_per_100g, 0),
                'ItemProtein': item.ItemProtein,
                'ItemCarb': item.ItemCarb,
                'ItemFat': item.ItemFat,
            })
        
        return items_list
        
    except Exception as e:
        print(f"Error in get_all_items: {str(e)}")
        raise
    

def calculate_lbm(weight, body_fat_percentage = None):
    """
    Calculate Lean Body Mass (LBM)
    
    """

    try:
        if body_fat_percentage is None or body_fat_percentage <= 0:
            return None
        
        lbm = weight * (1 - (body_fat_percentage / 100))
        return round(lbm, 2)
        
    except Exception as e:
        print(f"Error in calculate_lbm: {str(e)}")
        return None

def calculate_tdee(sex, age , weight , height, bodyfat_percentage , activity_status):
    """
    Calculate Total Daily Energy Expenditure (TDEE) 
    by first estimating Basal Metabolic Rate (BMR) using the Mifflin–St Jeor equation, 
    or the Katch–McArdle formula when body fat percentage is available, 
    then multiplying BMR by an appropriate activity factor.

    Returns:
        float: Calculated TDEE
    """

    try:
        # Activity multipliers
        activity_multipliers = {
            'Sedentary': 1.2,
            'Light': 1.375,
            'Moderate': 1.55,
            'Active': 1.725,
            'Very Active': 1.9
        }
        
        activity_factor = activity_multipliers.get(activity_status, 1.2)
        
        # If body fat percentage is available, use Katch-McArdle Formula (more accurate)
        if bodyfat_percentage is not None and bodyfat_percentage > 0:
            lbm = calculate_lbm(weight, bodyfat_percentage)
            if lbm:
                bmr = 370 + (21.6 * lbm)
                tdee = bmr * activity_factor
                return round(tdee, 0)
        
        # Otherwise (If bodyfat is not available or <= 0), use Mifflin-St Jeor Equation
        if sex.lower() == 'male':
            bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5
        else:
            bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161
        
        tdee = bmr * activity_factor
        return round(tdee, 0)
        
    except Exception as e:
        print(f"Error in calculate_tdee: {str(e)}")
        return None



def build_dynamic_prompt(client_id, meal_id, item_id):
    # Find the mealItem from DB which is gonna be changed  and get the details (Macros and calories)
    # Get the client's medical details, alternative items should not conflict with medical issues
    # Understand the plan goal of the client: Get last updated physical details of the client,  calculate TDEE, Find the current meal plan's nutritional info (calories) of that client and Understand the plan (Losing weight, gaining weight, maintaining weight)
    # Create the dynamic prompt with all these data


    """
    Build a dynamic prompt based on client's medical details, meal plan goals, and item details

    """
    try:
        
        # 1. Find the meal item and get its details
        meal_item = MealItem.query.filter_by(MealID=meal_id, ItemID=item_id).first()
        if not meal_item:
            print(f"Meal item not found: MealID={meal_id}, ItemID={item_id}")
            return None
        
        # Get item details
        item = get_item_by_id(item_id)
        if not item:
            print(f"Item not found: ItemID={item_id}")
            return None
        
        # Calculate macros for this portion
        protein = round(item['ItemProtein'] * (meal_item.ConsumeAmount / 100), 1)
        carb = round(item['ItemCarb'] * (meal_item.ConsumeAmount / 100), 1)
        fat = round(item['ItemFat'] * (meal_item.ConsumeAmount / 100), 1)
        
        total_calories_per_100g = calculate_item_calories(
            item['ItemProtein'],
            item['ItemCarb'],
            item['ItemFat'] # get all itemsdaki problem burada da olabilir
        )
        portion_calories = round(calculate_portion_calories(total_calories_per_100g, meal_item.ConsumeAmount), 0)
        
        # 2. Get client's medical details
        medical_details = MedicalDetails.query.filter_by(ClientID=client_id).first()
        medical_info = medical_details.MedicalData if medical_details and medical_details.MedicalData else "Bilinen hastalık yok"
        
        # 3. Get client's physical details
        physical_details = PhysicalDetails.query.filter_by(ClientID=client_id).order_by(
            PhysicalDetails.RecordDate.desc()
        ).first()
        
        if not physical_details:
            print(f"Physical details not found for client: {client_id}")
            return None
        
        # 4. Get client info for age calculation
        client = Client.query.filter_by(ClientID=client_id).first()
        if not client:
            print(f"Client not found: {client_id}")
            return None
        
        # Calculate age and taking into account of the day/month
        today = date.today()
        age = today.year - client.DOB.year - (
            (today.month, today.day) < (client.DOB.month, client.DOB.day)
        )
        
        # 5. Calculate TDEE using the helper function
        tdee = calculate_tdee(
            sex=client.Sex,
            age=age,
            weight=float(physical_details.Weight),
            height=float(physical_details.Height),
            bodyfat_percentage=float(physical_details.BodyFat) if physical_details.BodyFat else None,
            activity_status=physical_details.ActivityStatus if physical_details.ActivityStatus else 'Sedentary'
        )
        
        if not tdee:
            print(f"TDEE calculation failed for client: {client_id}")
            return None
        
        # 6. Get daily meal plan total calories
        daily_plan = db.session.query(DailyMealPlan).join(
            Meal, DailyMealPlan.MealPlanID == Meal.MealPlanID
        ).filter(Meal.MealID == meal_id).first()
        
        if not daily_plan:
            print(f"Daily plan not found for meal: {meal_id}")
            return None
        
        # Calculate total daily calories from the meal plan
        all_meals = Meal.query.filter_by(MealPlanID=daily_plan.MealPlanID).all()
        total_plan_calories = 0
        
        for meal in all_meals:
            meal_items = MealItem.query.filter_by(MealID=meal.MealID).all()
            for mi in meal_items:
                mi_item = get_item_by_id(mi.ItemID)
                if mi_item:
                    mi_calories_per_100g = calculate_item_calories(
                        mi_item['ItemProtein'],
                        mi_item['ItemCarb'],
                        mi_item['ItemFat']
                    )
                    total_plan_calories += calculate_portion_calories(mi_calories_per_100g, mi.ConsumeAmount)
        
        # 7. Determine plan goal
        calorie_difference = total_plan_calories - tdee
        if calorie_difference < -200:
            plan_goal = "Weight loss"
        elif calorie_difference > 200:
            plan_goal = "Weight gain"
        else:
            plan_goal = "Weight maintenance"
        
        # 8. Build the dynamic prompt
        dynamic_prompt = f"""
Plan Goal:
Person is working on {plan_goal}

Person's medical status:
{medical_info}

Macro values ​​of replacement meal:
{portion_calories} kcal, {protein} g protein, {carb} g carbohydrates, {fat} g fat

Meal to replace:
{item['ItemName']} ({meal_item.ConsumeAmount}g)

Suggest the most suitable single meal and its portion based on this information.
"""
        
        return dynamic_prompt
        
    except Exception as e:
        print(f"Error in build_dynamic_prompt: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

def build_alternative_prompt(client_id, meal_id, item_id): 
    # call build_dynamic_prompt to get the dynamic part
    # and append the result of dynamic prompt to static prompt
    # return the full prompt

    """
    Build the full prompt by combining static and dynamic parts
    
    """

    try:
        # Get dynamic prompt
        dynamic_prompt = build_dynamic_prompt(client_id, meal_id, item_id)
        
        if not dynamic_prompt:
            return None
        
        # Combine static and dynamic prompts
        full_prompt = STATIC_ALTERNATIVE_PROMPT + "\n\n" + dynamic_prompt
        
        return full_prompt
        
    except Exception as e:
        print(f"Error in build_alternative_prompt: {str(e)}")
        return None


def get_alternative_mealitem(client_id, meal_id, item_id):

    # call the build_alternative_prompt to get the full prompt
    # call the LLM with the prompt and get the response
    # return the response to the route

    """
    Get alternative meal item suggestion using LLM

    """

    try:
        # Build the full prompt
        full_prompt = build_alternative_prompt(client_id, meal_id, item_id)
        
        if not full_prompt:
            return False, "Prompt oluşturulamadı", None
        
        # TODO: Call LLM API here with the prompt
        # Example:
        # import anthropic
        # client = anthropic.Anthropic(api_key="your-api-key")
        # response = client.messages.create(
        #     model="gpt-nano-4.1",
        #     max_tokens=1024,
        #     messages=[{"role": "user", "content": full_prompt}]
        # )
        # alternative_suggestion = response.content[0].text
        
        # For now, return placeholder
        return False, "LLM entegrasyonu henüz tamamlanmadı", None
        
    except Exception as e:
        print(f"Error in get_alternative_mealitem: {str(e)}")
        import traceback
        traceback.print_exc()
        return False, f"Server error: {str(e)}", None