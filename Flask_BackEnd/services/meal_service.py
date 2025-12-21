import uuid
from datetime import datetime
from models.models import DailyMealPlan, Meal, MealItem, Item
from db_config import db

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
        new_plan_id = str(uuid.uuid4())
        new_plan = DailyMealPlan(
            MealPlanID=new_plan_id,
            ClientID=client_id,
            PlanDate=plan_date_str 
        )
        db.session.add(new_plan)

        # C. Loop Meals
        for m in meals_data:
            start_time = None
            end_time = None
            if m.get('time'):
                times = m['time'].split('-')
                if len(times) == 2:
                    start_time = times[0].strip()
                    end_time = times[1].strip()

            new_meal_id = str(uuid.uuid4())
            new_meal = Meal(
                MealID=new_meal_id,
                MealPlanID=new_plan_id,
                MealName=m.get('title'),
                MealStart=start_time,
                MealEnd=end_time
            )
            db.session.add(new_meal)

            # D. Loop Items
            for i in m.get('items', []):
                # Find or Create Item
                existing_item = Item.query.filter_by(ItemName=i['name']).first()
                item_id = None
                
                if existing_item:
                    item_id = existing_item.ItemID
                else:
                    item_id = str(uuid.uuid4())
                    new_item = Item(
                        ItemID=item_id,
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
                    MealID=new_meal_id,
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

                    items_data.append({
                        'name': item.ItemName,
                        'amount': mi.ConsumeAmount,
                        'calories': round(actual_cals),
                        'protein': round((item.ItemProtein or 0) * ratio),
                        'carbs': round((item.ItemCarb or 0) * ratio),
                        'fat': round((item.ItemFat or 0) * ratio),
                        'allowChange': mi.canChange
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

# --- Function 3: Legacy Support ---
def get_meals_by_clientid_and_date(client_id, plan_date):
    try:
        plan = DailyMealPlan.query.filter_by(ClientID=client_id, PlanDate=plan_date).first()
        if not plan:
            return None
        return plan.meals 
    except Exception as e:
        print(f"Error fetching meals: {e}")
        return []