from models.models import MealItem, Meal, DailyMealPlan, Item, Client, PhysicalDetails, MedicalDetails
from db_config import db
from services.item_service import get_item_by_id, calculate_item_calories, calculate_portion_calories
from services.preference_service import update_preference_after_manual_replacement
from datetime import date, datetime
import traceback

import openai #pip install openai python-dotenv
import os
import json

openai.api_key = os.getenv('OPENAI_API_KEY') # Get the API key from environment variable (.env)

STATIC_ALTERNATIVE_PROMPT = """
You are a dietitian support assistant.
The information provided has been prepared by a dietitian.

Your task is to suggest the most reasonable food alternative while strictly respecting the dietitian-defined structure.

RULES:
- Medical restrictions always take precedence and must never be violated.
- The overall diet plan structure cannot be altered.
- Alternatives must stay within a reasonable nutritional tolerance of the original meal.
- Macronutrients and calories should be kept as close as reasonably possible using the given values.
- Do not introduce new calculations or assumptions; base decisions on the provided nutritional information only.
- Do not recommend medical treatment or provide medical diagnosis.
- If multiple options exist, choose the closest and most appropriate alternative.
- In the JSON Format never put portion in paranthesis. e.g Cauliflower (130g). It should be Cauliflower rice.

GUIDANCE:
- Minor deviations in macronutrients are acceptable if the alternative is nutritionally equivalent.
- Prefer food substitutions that fulfill the same dietary role (e.g., protein source to protein source).
- Avoid rejecting alternatives unless no reasonable equivalent exists.

OUTPUT RULES:
- The response must be ONLY in valid JSON FORMAT.
- Do not include any text outside the JSON.
- If no reasonable alternative exists, set status to "no_alternative" and recommended_food to null.
- If a reasonable alternative is found, set status to "ok".
- Portion must be in grams as an integer.
- Calories must be rounded to the nearest whole number.
- Protein, carb, and fat must be rounded to one decimal place.

CRITICAL FOOD NAME RULE:
- You MUST pick a food from the CANDIDATE ITEMS list provided in the prompt.
- The food name in "recommended_food" MUST be copied EXACTLY as it appears in the candidate list — character for character, including spaces, commas, parentheses, and Turkish characters.
- Do NOT shorten, generalize, translate, or modify the name in any way.
- Do NOT invent a food name that is not in the candidate list.
- If the candidate list says "Hindi eti (derisiz), kemiksiz", you must use exactly "Hindi eti (derisiz), kemiksiz" — not "Hindi Eti" or "Turkey Meat".
- If no candidate is suitable, set status to "no_alternative".

STRING FORMAT RULE:
- The "recommended_food" string must strictly follow this exact pattern:
  "Exact DB Name - Portion - Calories - Protein - Carb - Fat"
- Use exactly one space before and after each hyphen.
- Portion must be an integer in grams.

FINAL CHECK RULE:
- Before returning the final JSON, verify that the food name matches one of the candidate items EXACTLY.
- If it does not match any candidate exactly, fix it or set status to "no_alternative".

JSON FORMAT:
{
  "status": "ok | no_alternative",
  "recommended_food": "food name - portion - calories - protein - carb - fat" | null
}
"""

previous_requested_itemList = []

def format_changed_item_for_db(changed_item):
    """
    Frontend'den gelen changed_item'i DB formatına çevirir.
    
    Kabul edilen input örnekleri:
    1) [{"name": "Kiwi", "item_id": "9", "portion": 100}]
    2) {"name": "Kiwi", "item_id": "9", "portion": 100}
    3) "Kiwi - 100g"
    4) "Kiwi - 100g, Banana - 80g"
    
    DB'ye yazılacak format:
    "Kiwi - 100g, Banana - 80g"
    """
    if not changed_item:
        return None

    # String geldiyse önce JSON mı diye dene
    if isinstance(changed_item, str):
        changed_item = changed_item.strip()

        # Zaten eski doğru string formatındaysa aynen bırak
        if " - " in changed_item and "[" not in changed_item and "{" not in changed_item:
            return changed_item

        # JSON string olabilir
        try:
            changed_item = json.loads(changed_item)
        except Exception:
            return changed_item  # saçma bir şey geldiyse bozmayalım

    # Tek obje geldiyse listeye çevir
    if isinstance(changed_item, dict):
        changed_item = [changed_item]

    # Liste geldiyse DB stringine çevir
    if isinstance(changed_item, list):
        formatted_items = []

        for item in changed_item:
            if not isinstance(item, dict):
                continue

            name = str(item.get("name", "")).strip()
            portion = item.get("portion")

            if not name or portion in [None, ""]:
                continue

            try:
                portion = int(float(portion))
            except Exception:
                continue

            formatted_items.append(f"{name} - {portion}")

        return ", ".join(formatted_items) if formatted_items else None

    return None




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
    

def parse_changed_item_with_ids(changed_item_text):
    if not changed_item_text:
        return []

    result = []
    items_list = changed_item_text.split(', ')

    for item_str in items_list:
        parts = item_str.split(' - ')
        if len(parts) != 2:
            continue

        name = parts[0].strip()
        portion_str = parts[1].strip().replace('g', '')

        try:
            portion = int(portion_str)
        except ValueError:
            continue

        db_item = Item.query.filter_by(ItemName=name).first()

        result.append({
            "item_id": db_item.ItemID if db_item else None,
            "name": name,
            "portion": portion
        })

    return result




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
        
        selected_item_id = None

        # CASE 1: dict gelirse (doğru format)
        if isinstance(changedItem, dict):
            selected_item_id = changedItem.get("item_id")

        # CASE 2: list gelirse (frontend bazen array gönderiyor)
        elif isinstance(changedItem, list) and len(changedItem) > 0:
            selected_item_id = changedItem[0].get("item_id")

        # CASE 3: legacy string (senin şu anki bug)
        elif isinstance(changedItem, str):
            selected_item_ids = []

            # Split multiple items
            items = changedItem.split(",")

            for item_str in items:
                # Handle formats like "banana-100" OR "banana - 100g"
                name_part = item_str.split("-")[0].strip()

                selected_item = Item.query.filter_by(ItemName=name_part).first()
                if selected_item:
                    selected_item_ids.append(selected_item.ItemID)

            # If only one item, keep old behavior
            if len(selected_item_ids) == 1:
                selected_item_id = selected_item_ids[0]
            else:
                selected_item_id = selected_item_ids  # 🔥 now supports multiple

        


        # It will not be overwritten of an itemID so we can track what changed with what.
        # UI should be designed to show the previous and new item if changedItem is not null.
        # Update the meal item with manual feedback
        formatted_changed_item = format_changed_item_for_db(changedItem)
        meal_item.isFollowed = is_followed
        meal_item.ChangedItem = formatted_changed_item
        meal_item.isLLM = 0
        
        # Commit changes to database
        db.session.commit()
        
        preference_message = None

        print("=== DEBUG PREFERENCE ===")
        print("changedItem:", changedItem)
        print("selected_item_id:", selected_item_id)
        
        if selected_item_id:
            pref_success, pref_message = update_preference_after_manual_replacement(
                client_id=client_id,
                meal_id=meal_id,
                original_item_id=item_id,
                selected_item_id=selected_item_id
            )
            preference_message = pref_message
            if not pref_success:
                print(f"Preference update warning: {pref_message}")




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
            'fat': round(item['ItemFat'] * (meal_item.ConsumeAmount / 100), 1),
            'preferenceUpdate': preference_message
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
        if not accepted_item_json:
            return False, "Invalid alternative item format"
        
        recommended_food = accepted_item_json  #['recommended_food'] olmaması lazım kaldırıldı! Çünkü recommended food listesinde başka bir recommended food objesi arıyordu.
        
        # Validate recommended_food has required fields
        if not recommended_food or 'name' not in recommended_food or 'portion' not in recommended_food:
            return False, "Invalid recommended_food format"
        
        # Create a formatted string with both name and portion
        changed_item_text = f"{recommended_food.get('name', 'Unknown')} - {recommended_food.get('portion', 'Unknown portion')}"
        
        meal_item.ChangedItem = changed_item_text
        meal_item.isFollowed = 0
        meal_item.isLLM = 1
        
        # Commit changes to database
        db.session.commit()
        
        return True, "LLM alternative successfully accepted and saved"
        
    except Exception as e:
        db.session.rollback()
        print(f"Error in give_feedback_on_mealitem_via_LLM: {str(e)}")
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


def _prefilter_candidates(original_item_id, original_item, limit=12):
    """
    Prefilter DB items to find the most nutritionally similar candidates.
    Scores items by calorie + macro similarity to the original, same food role preferred.
    Returns top N candidates sorted by similarity score (best first).
    """
    try:
        all_items = Item.query.all()
        if not all_items:
            return []

        # Original item macros per 100g
        orig_protein = original_item['ItemProtein'] or 0
        orig_carb = original_item['ItemCarb'] or 0
        orig_fat = original_item['ItemFat'] or 0
        orig_cal = calculate_item_calories(orig_protein, orig_carb, orig_fat)

        # Determine dominant macro role of original (protein/carb/fat source)
        macros = {'protein': orig_protein, 'carb': orig_carb, 'fat': orig_fat}
        dominant_role = max(macros, key=macros.get)

        scored = []
        for db_item in all_items:
            # Skip the original item itself
            if str(db_item.ItemID) == str(original_item_id):
                continue

            p = db_item.ItemProtein or 0
            c = db_item.ItemCarb or 0
            f = db_item.ItemFat or 0
            cal = calculate_item_calories(p, c, f)

            # Calorie similarity (closer = better, max 40 points)
            cal_diff = abs(cal - orig_cal)
            cal_score = max(0, 40 - (cal_diff / orig_cal * 40)) if orig_cal > 0 else 20

            # Macro similarity (closer = better, max 40 points)
            macro_diff = abs(p - orig_protein) + abs(c - orig_carb) + abs(f - orig_fat)
            macro_total = orig_protein + orig_carb + orig_fat
            macro_score = max(0, 40 - (macro_diff / macro_total * 40)) if macro_total > 0 else 20

            # Food role bonus (same dominant macro = +20 points)
            item_macros = {'protein': p, 'carb': c, 'fat': f}
            item_role = max(item_macros, key=item_macros.get)
            role_bonus = 20 if item_role == dominant_role else 0

            total_score = cal_score + macro_score + role_bonus

            scored.append({
                'name': db_item.ItemName,
                'cal_per_100g': round(cal, 1),
                'protein': round(p, 1),
                'carb': round(c, 1),
                'fat': round(f, 1),
                'score': round(total_score, 1),
            })

        # Sort by score descending, take top N
        scored.sort(key=lambda x: x['score'], reverse=True)
        return scored[:limit]

    except Exception as e:
        print(f"Error in _prefilter_candidates: {str(e)}")
        return []


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
            PhysicalDetails.MeasurementDate.desc()
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
        
        if isinstance(client.DOB, str):
            # If DOB is string, parse it
            try:
                dob = datetime.strptime(client.DOB, '%Y-%m-%d').date()
            except ValueError:
                try:
                    dob = datetime.strptime(client.DOB, '%d/%m/%Y').date()
                except ValueError:
                    print(f"❌ Invalid DOB format: {client.DOB}")
                    dob = today  # Fallback
        else:
            dob = client.DOB
        
        age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
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

        # 8. Prefilter candidates from DB (RAG-style)
        candidates = _prefilter_candidates(item_id, item, limit=12)

        if candidates:
            candidates_text = "CANDIDATE ITEMS FROM DATABASE (pick the best one from this list):\n"
            for c in candidates:
                candidates_text += f"- {c['name']}: {c['cal_per_100g']} kcal/100g, P:{c['protein']}g C:{c['carb']}g F:{c['fat']}g per 100g\n"
        else:
            candidates_text = "No prefiltered candidates available. Suggest any suitable food."

        # 9. Build the dynamic prompt
        dynamic_prompt = f"""
Plan Goal:
Person is working on {plan_goal}

Person's medical status:
{medical_info}

Macro values of replacement meal:
{portion_calories} kcal, {protein} g protein, {carb} g carbohydrates, {fat} g fat

Meal to replace:
{item['ItemName']} ({meal_item.ConsumeAmount}g)

{candidates_text}

Pick the single best alternative from the candidate list above. Adjust portion to match the original meal's calorie and macro profile as closely as possible.
"""
        
        return dynamic_prompt
        
    except Exception as e:
        print(f"Error in build_dynamic_prompt: {str(e)}")
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


def generate_chatgpt_response(prompt):
    """
    Generate response from ChatGPT using OpenAI API
    """
    try:
        response = openai.chat.completions.create(
            model="gpt-4.1-nano",
            messages=[
                {
                    "role": "system", 
                    "content": "You are a helpful dietitian assistant. Always respond in valid JSON format."
                },
                {
                    "role": "user", 
                    "content": prompt
                }
            ],
            max_tokens=300,
            temperature=0.7, #0.6 - 0.8.. 0.6 eğer saçmalarsa. 0.8 eğer bulamamaya devam ederse
            response_format={"type": "json_object"}  # JSON formatında döndür
        )
        
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error in generate_chatgpt_response: {e}")
        raise

# Mobile LLM
def extract_food_name(food_string: str) -> str:
    """
    Extracting the name from the respone of LLM in "recommended_food"
    "Cauliflower rice - 100g - 25 calories - ..."
    -> "cauliflower rice"
    """
    return food_string.split(" - ")[0].strip().lower()

def get_alternative_mealitem(client_id, meal_id, item_id):
    """
    Get alternative meal item suggestion using LLM
    
    """
    try:
        # Build the full prompt
        full_prompt = build_alternative_prompt(client_id, meal_id, item_id)
        
        if not full_prompt:
            return False, "Prompt oluşturulamadı", None
        
        print("🤖 Calling OpenAI API...")
        
        # Set API key from environment variable
        openai.api_key = os.getenv('OPENAI_API_KEY')
        
        if not openai.api_key:
            return False, "OpenAI API key bulunamadı", None
        
        # Call the helper function with your custom API
        response_text = generate_chatgpt_response(full_prompt)
        print(f"📥 LLM Raw Response: {response_text}")
        
        # Parse JSON response
        try:
            # Remove markdown code blocks if present
            cleaned_text = response_text.strip()
            
            if cleaned_text.startswith('```'):
                # Split by newlines and remove first/last lines
                lines = cleaned_text.split('\n')
                # Remove first line (```json or ```)
                lines = lines[1:]
                # Remove last line if it's ```
                if lines and lines[-1].strip() == '```':
                    lines = lines[:-1]
                cleaned_text = '\n'.join(lines).strip()

            llm_response = json.loads(response_text)
            
            # Validate response structure
            if 'status' not in llm_response:
                return False, "Geçersiz LLM yanıtı (status eksik)", None
            
            # Check status
            if llm_response['status'] == 'no_alternative':
                return True, "Uygun alternatif bulunamadı", {
                    'status': 'no_alternative',
                    'recommended_food': None
                }
            
            # If status is 'ok', validate recommended_food
            if llm_response['status'] == 'ok':
                if 'recommended_food' not in llm_response or not llm_response['recommended_food']:
                    return False, "Geçersiz LLM yanıtı (recommended_food eksik)", None
                
                # There is no error with status error and invalid recommended food format.
                # Now we check if the name is exists in the previous suggested food list to make it suggest different type of foods
                recommended_food = llm_response.get('recommended_food')
                recommended_name = extract_food_name(recommended_food)
                previous_food_names = {
                    extract_food_name(item)
                    for item in previous_requested_itemList
                }

                # 🔴 Aynı item tekrar önerildiyse
                # status no alternative döndür böylece frontendde hata gözüksün
                if recommended_name in previous_food_names:
                    print("⚠️ Same item suggested again, no new alternative found")
                    # DEBUGGING print(f"📋 Previous requested items: {previous_requested_itemList}")
                    return False, "Yeni bir alternatif bulunamadı", {
                        'status': 'no_alternative',
                        'recommended_food': None
                    }

                # 🟢 Gerçekten yeni alternatifse kaydet
                previous_requested_itemList.append(recommended_food)

                # Gerçekten yeni alternatif olan yemeği frontende gönder
                print(f"✅ Alternative found: {recommended_food}")
                # DEBUGGING print(f"📋 Previous requested items: {previous_requested_itemList}")
                return True, "Alternatif başarıyla oluşturuldu", {
                    'status': 'ok',
                    'recommended_food': recommended_food
                }
                
            
            return False, f"Beklenmeyen status değeri: {llm_response['status']}", None
            
        except (json.JSONDecodeError, ValueError) as e:
            print(f"❌ Error parsing LLM response: {e}")
            print(f"Raw response: {response_text}")
            return False, "LLM yanıtı işlenemedi", None
    
    except openai.RateLimitError:
        print("⚠️ OpenAI Rate limit exceeded")
        return False, "API rate limit aşıldı. Lütfen daha sonra tekrar deneyin.", None
    
    except openai.APIError as e:
        print(f"❌ OpenAI API error: {e}")
        return False, "AI servisi geçici olarak kullanılamıyor", None
    
    except Exception as e:
        print(f"❌ Error in get_alternative_mealitem: {str(e)}")
        import traceback
        traceback.print_exc()
        return False, f"Server error: {str(e)}", None