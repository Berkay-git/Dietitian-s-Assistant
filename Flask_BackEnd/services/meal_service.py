import uuid
from datetime import datetime
from models.models import DailyMealPlan, Meal, MealItem, Item
from db_config import db
from services.item_service import calculate_portion_calories, calculate_item_calories

# --- Function 1: Create Logic ---
def create_meal_plan(data):
    try:
        client_id = data.get('client_id')
        plan_date_str = data.get('date')
        meals_data = data.get('meals', [])

        # A. Check/Overwrite existing plan
        existing_plan = DailyMealPlan.query.filter_by(ClientID=client_id, PlanDate=plan_date_str).first()
        if existing_plan:
            db.session.delete(existing_plan)
            db.session.flush()

        # B. Create Plan
        new_plan = DailyMealPlan(
            ClientID=client_id,
            PlanDate=plan_date_str 
        )
        db.session.add(new_plan)
        db.session.flush()

        # C. Loop Meals
        for m in meals_data:
            start_time = None
            end_time = None
            if m.get('time'):
                times = m['time'].split('-')
                if len(times) == 2:
                    start_time = times[0].strip()
                    end_time = times[1].strip()

            new_meal = Meal(
                MealPlanID=new_plan.MealPlanID,
                MealName=m.get('title'),
                MealStart=start_time,
                MealEnd=end_time
            )
            db.session.add(new_meal)
            db.session.flush()

            # D. Loop Items
            for i in m.get('items', []):
                # Find or Create Item
                existing_item = Item.query.filter_by(ItemName=i['name']).first()
                item_id = None
                
                if existing_item:
                    item_id = existing_item.ItemID
                else:
                    new_item = Item(
                        ItemName=i['name'],
                        # ItemCalories removed as per your request
                        ItemProtein=i.get('protein'),
                        ItemCarb=i.get('carbs'),
                        ItemFat=i.get('fat')
                    )
                    db.session.add(new_item)
                    db.session.flush() 

                # Link Item
                new_meal_item = MealItem(
                    MealID=new_meal.MealID,
                    ItemID=item_id,
                    ClientID=client_id,
                    ConsumeAmount=i.get('amount'),
                    canChange=i.get('allowChange', False),
                    isFollowed=None,
                    isLLM=False
                )
                db.session.add(new_meal_item)

        db.session.commit()
        return True, "Meal Plan Created Successfully"

    except Exception as e:
        db.session.rollback()
        print(f"Error creating meal plan: {e}")
        return False, str(e)

# --- Function 2: Get Logic ---
def get_client_meal_plans(client_id):
    try:
        # Get all plans for this client, newest first
        plans = DailyMealPlan.query.filter_by(ClientID=client_id)\
            .order_by(DailyMealPlan.PlanDate.desc()).all()
        
        history = []

        for p in plans:
            meals = Meal.query.filter_by(MealPlanID=p.MealPlanID).all()
            daily_total_cals = 0
            meals_data = []

            for m in meals:
                # Join with Item table to get macros
                meal_items = db.session.query(MealItem, Item)\
                    .join(Item, MealItem.ItemID == Item.ItemID)\
                    .filter(MealItem.MealID == m.MealID).all()
                
                items_data = []
                meal_cals = 0

                for mi, item in meal_items:
                    # Calculate Calories: (4*Pro + 4*Carb + 9*Fat) * ratio
                    base_cals = (4 * (item.ItemProtein or 0)) + \
                                (4 * (item.ItemCarb or 0)) + \
                                (9 * (item.ItemFat or 0))
                    
                    ratio = mi.ConsumeAmount / 100.0
                    actual_cals = base_cals * ratio
                    meal_cals += actual_cals

#--------------------------------------------------------------------
                    # --- NEW CODE: Calculate Macros for ChangedItem SPECIFICALLY FOR WEB SIDE, MOBILE SIDE WILL NOT USE IT.---
                    # --- FIXED: Handle multiple changed items ---
                    new_kcal, new_pro, new_carb, new_fat = 0, 0, 0, 0

                    if mi.ChangedItem:
                        clean_changed = str(mi.ChangedItem).replace('"', '').strip()

                        # Split multiple items
                        changed_items = clean_changed.split(",")

                        for changed in changed_items:
                            if '-' not in changed:
                                continue

                            parts = changed.split('-')
                            if len(parts) != 2:
                                continue

                            new_item_name = parts[0].strip()

                            try:
                                new_item_amount = float(parts[1].strip())

                                new_db_item = Item.query.filter(Item.ItemName.ilike(new_item_name)).first()

                                if new_db_item:
                                    ratio = new_item_amount / 100.0

                                    pro = (new_db_item.ItemProtein or 0) * ratio
                                    carb = (new_db_item.ItemCarb or 0) * ratio
                                    fat = (new_db_item.ItemFat or 0) * ratio

                                    kcal = (4 * pro) + (4 * carb) + (9 * fat)

                                    # 🔥 ADD to totals
                                    new_pro += pro
                                    new_carb += carb
                                    new_fat += fat
                                    new_kcal += kcal

                            except Exception as e:
                                print(f"Error parsing modified item: {e}")

                        # Round at the end
                        new_pro = round(new_pro)
                        new_carb = round(new_carb)
                        new_fat = round(new_fat)
                        new_kcal = round(new_kcal)
#------------------------------------------

                    items_data.append({
                        'name': item.ItemName,
                        'amount': mi.ConsumeAmount,
                        'calories': round(actual_cals),
                        'protein': round((item.ItemProtein or 0) * ratio),
                        'carbs': round((item.ItemCarb or 0) * ratio),
                        'fat': round((item.ItemFat or 0) * ratio),
                        'allowChange': mi.canChange,
                        'changedItem': mi.ChangedItem,  # ----- ADDED THIS FOR GIVING FEEDBACK TO DIETITIAN ON WEB
                        'isLLM': mi.isLLM,               # ----- ADDED THIS FOR GIVING FEEDBACK TO DIETITIAN ON WEB
                        'newKcal': new_kcal,    # ----- SOME ADDITONAL FIELDS FOR WEB
                        'newProtein': new_pro,  # ----- SOME ADDITONAL FIELDS FOR WEB
                        'newCarbs': new_carb,   # ----- SOME ADDITONAL FIELDS FOR WEB
                        'newFat': new_fat       # ----- SOME ADDITONAL FIELDS FOR WEB
                    })

                daily_total_cals += meal_cals

                meals_data.append({
                    'title': m.MealName,
                    'time': f"{m.MealStart} - {m.MealEnd}" if m.MealStart else "Flexible",
                    'items': items_data
                })

            history.append({
                'id': p.MealPlanID,
                'date': p.PlanDate.strftime('%Y-%m-%d') if p.PlanDate else "Unknown Date",
                'status': 'Active', 
                'avgCalories': round(daily_total_cals),
                'goal': 'General', 
                'meals': meals_data
            })

        return history

    except Exception as e:
        print(f"Error fetching plans: {e}")
        return []

# MOBILE
def get_meals_by_clientid_and_date(client_id, plan_date):
    try:
        plan = DailyMealPlan.query.filter_by(ClientID=client_id, PlanDate=plan_date).first()
        if not plan:
            return []
        
        meals = Meal.query.filter_by(MealPlanID=plan.MealPlanID).all()
        meals_data = []
        
        for m in meals:
            # Join with Item table to get macros
            meal_items = db.session.query(MealItem, Item)\
                .join(Item, MealItem.ItemID == Item.ItemID)\
                .filter(MealItem.MealID == m.MealID).all()
            
            items_data = []
            total_calories = 0
            total_protein = 0
            total_carb = 0
            total_fat = 0
            
            for mi, item in meal_items:
                # Use helper function for ORIGINAL item

                actual_100g_cals = calculate_item_calories(
                    item.ItemProtein or 0,
                    item.ItemCarb or 0,
                    item.ItemFat or 0,
                )
                
                actual_cals = calculate_portion_calories(
                    actual_100g_cals,
                    mi.ConsumeAmount
                )
                
                ratio = mi.ConsumeAmount / 100.0
                scaled_protein = (item.ItemProtein or 0) * ratio
                scaled_carb = (item.ItemCarb or 0) * ratio
                scaled_fat = (item.ItemFat or 0) * ratio
                
                # Parse changedItem from database
                # Supports:
                # 1) new JSON/list format: [{"item_id": "...", "name": "...", "portion": 100}]
                # 2) single JSON/object format: {"item_id": "...", "name": "...", "portion": 100}
                # 3) legacy string format: "Banana - 100g, Apple - 80g"
                changed_item_parsed = None
                if mi.ChangedItem:
                    parsed_items = []

                    # NEW FORMAT: list of objects
                    if isinstance(mi.ChangedItem, list):
                        for changed in mi.ChangedItem:
                            changed_name = changed.get('name')
                            changed_portion = changed.get('portion')

                            if not changed_name or changed_portion is None:
                                continue

                            try:
                                changed_portion = int(changed_portion)
                            except (ValueError, TypeError):
                                continue

                            changed_item_obj = Item.query.filter_by(ItemName=changed_name).first()
                            if changed_item_obj:
                                changed_100g_cals = calculate_item_calories(
                                    changed_item_obj.ItemProtein or 0,
                                    changed_item_obj.ItemCarb or 0,
                                    changed_item_obj.ItemFat or 0,
                                )
                                changed_cals = calculate_portion_calories(
                                    changed_100g_cals,
                                    changed_portion
                                )

                                changed_ratio = changed_portion / 100.0
                                changed_protein = (changed_item_obj.ItemProtein or 0) * changed_ratio
                                changed_carb = (changed_item_obj.ItemCarb or 0) * changed_ratio
                                changed_fat = (changed_item_obj.ItemFat or 0) * changed_ratio

                                parsed_items.append(
                                    f"{changed_name},{changed_portion},{round(changed_cals)},"
                                    f"{round(changed_protein, 1)},{round(changed_carb, 1)},{round(changed_fat, 1)}"
                                )

                    # NEW FORMAT: single object
                    elif isinstance(mi.ChangedItem, dict):
                        changed_name = mi.ChangedItem.get('name')
                        changed_portion = mi.ChangedItem.get('portion')

                        if changed_name and changed_portion is not None:
                            try:
                                changed_portion = int(changed_portion)
                            except (ValueError, TypeError):
                                changed_portion = None

                            if changed_portion is not None:
                                changed_item_obj = Item.query.filter_by(ItemName=changed_name).first()
                                if changed_item_obj:
                                    changed_100g_cals = calculate_item_calories(
                                        changed_item_obj.ItemProtein or 0,
                                        changed_item_obj.ItemCarb or 0,
                                        changed_item_obj.ItemFat or 0,
                                    )
                                    changed_cals = calculate_portion_calories(
                                        changed_100g_cals,
                                        changed_portion
                                    )

                                    changed_ratio = changed_portion / 100.0
                                    changed_protein = (changed_item_obj.ItemProtein or 0) * changed_ratio
                                    changed_carb = (changed_item_obj.ItemCarb or 0) * changed_ratio
                                    changed_fat = (changed_item_obj.ItemFat or 0) * changed_ratio

                                    parsed_items.append(
                                        f"{changed_name},{changed_portion},{round(changed_cals)},"
                                        f"{round(changed_protein, 1)},{round(changed_carb, 1)},{round(changed_fat, 1)}"
                                    )

                    # LEGACY FORMAT: string
                    elif isinstance(mi.ChangedItem, str):
                        items_list = mi.ChangedItem.split(', ')
                        for item_str in items_list:
                            parts = item_str.split(' - ')
                            if len(parts) == 2:
                                changed_name = parts[0].strip()
                                changed_portion_str = parts[1].strip().replace('g', '')

                                try:
                                    changed_portion = int(changed_portion_str)
                                except ValueError:
                                    continue

                                changed_item_obj = Item.query.filter_by(ItemName=changed_name).first()
                                if changed_item_obj:
                                    changed_100g_cals = calculate_item_calories(
                                        changed_item_obj.ItemProtein or 0,
                                        changed_item_obj.ItemCarb or 0,
                                        changed_item_obj.ItemFat or 0,
                                    )
                                    changed_cals = calculate_portion_calories(
                                        changed_100g_cals,
                                        changed_portion
                                    )

                                    changed_ratio = changed_portion / 100.0
                                    changed_protein = (changed_item_obj.ItemProtein or 0) * changed_ratio
                                    changed_carb = (changed_item_obj.ItemCarb or 0) * changed_ratio
                                    changed_fat = (changed_item_obj.ItemFat or 0) * changed_ratio

                                    parsed_items.append(
                                        f"{changed_name},{changed_portion},{round(changed_cals)},"
                                        f"{round(changed_protein, 1)},{round(changed_carb, 1)},{round(changed_fat, 1)}"
                                    )

                    if parsed_items:
                        changed_item_parsed = ';'.join(parsed_items)
                
                # ORIGINAL item ALWAYS contributes to totals
                # Changed items are SEPARATE in the "changedItem" and shown in UI only
                total_calories += actual_cals
                total_protein += scaled_protein
                total_carb += scaled_carb
                total_fat += scaled_fat
                
                items_data.append({
                    'itemID': item.ItemID,
                    'mealID': m.MealID, 
                    'clientID': client_id,
                    'name': item.ItemName,
                    'portion': f"{mi.ConsumeAmount}g",
                    'calories': round(actual_cals),
                    'protein': round(scaled_protein, 1),
                    'carb': round(scaled_carb, 1),
                    'fat': round(scaled_fat, 1),
                    'isFollowed': mi.isFollowed,
                    'changedItem': changed_item_parsed,  #  Parsed string or None
                    'canChange': mi.canChange,
                    'isLLM': mi.isLLM
                })
            
            # Check if meal is completed
            is_completed = all(mi.isFollowed is not None for mi, _ in meal_items) if meal_items else False
            
            meals_data.append({
                'mealID': m.MealID,
                'mealName': m.MealName,
                'timeRange': f"{m.MealStart} - {m.MealEnd}" if m.MealStart else "Flexible",
                'totalCalories': round(total_calories),
                'totalProtein': round(total_protein, 1),
                'totalCarb': round(total_carb, 1),
                'totalFat': round(total_fat, 1),
                'isCompleted': is_completed,
                'items': items_data
            })
        
        return meals_data
        
    except Exception as e:
        print(f"Error fetching meals: {e}")
        return []