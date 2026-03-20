from models.models import ClientMealPreference, Meal, Item
from db_config import db

DEFAULT_SCORE = 50
MIN_SCORE = 0
MAX_SCORE = 100
SCORE_DELTA = 5
VALID_MEAL_NAMES = {"Breakfast", "Lunch", "Dinner", "Snack"}


def clamp_score(score: int) -> int:
    return max(MIN_SCORE, min(MAX_SCORE, score))


def is_fruit_item(item_id: str) -> bool:
    item = Item.query.filter_by(ItemID=item_id).first()
    if not item:
        return False
    return (item.ItemCategory or "").strip().lower() == "fruit"


def get_preference(client_id: str, meal_name: str, item_id: str):
    return ClientMealPreference.query.filter_by(
        ClientID=client_id,
        MealName=meal_name,
        ItemID=item_id
    ).first()


def get_or_create_preference(client_id: str, meal_name: str, item_id: str):
    pref = get_preference(client_id, meal_name, item_id)

    if pref:
        return pref

    item = Item.query.filter_by(ItemID=item_id).first()

    pref = ClientMealPreference(
        ClientID=client_id,
        MealName=meal_name,
        ItemID=item_id,
        ItemName=item.ItemName if item else None,
        Score=DEFAULT_SCORE,
        SelectionCount=0,
        RejectionCount=0
    )
    db.session.add(pref)
    db.session.flush()
    return pref


def update_preference_after_manual_replacement(client_id: str, meal_id: str, original_item_id: str, selected_item_id: str):
    """
    Learn only from manual fruit-to-fruit replacement.
    No auto replacement. No history table.
    """
    try:
        if not selected_item_id:
            return False, "selected_item_id is required"

        if original_item_id == selected_item_id:
            return True, "Same item selected, no preference change needed"

        meal = Meal.query.filter_by(MealID=meal_id).first()
        if not meal:
            return False, "Meal not found"

        meal_name = meal.MealName

        if meal_name not in VALID_MEAL_NAMES:
            return False, f"Invalid meal name: {meal_name}"

        if not is_fruit_item(original_item_id):
            return True, "Original item is not a fruit, preference learning skipped"

        if not is_fruit_item(selected_item_id):
            return True, "Selected item is not a fruit, preference learning skipped"

        original_pref = get_or_create_preference(client_id, meal_name, original_item_id)
        selected_pref = get_or_create_preference(client_id, meal_name, selected_item_id)

        original_pref.Score = clamp_score(original_pref.Score - SCORE_DELTA)
        original_pref.RejectionCount += 1

        selected_pref.Score = clamp_score(selected_pref.Score + SCORE_DELTA)
        selected_pref.SelectionCount += 1

        db.session.commit()

        return True, "Fruit preference scores updated successfully"

    except Exception as e:
        db.session.rollback()
        print(f"Error in update_preference_after_manual_replacement: {str(e)}")
        return False, f"Server error: {str(e)}"


def get_meal_fruit_recommendations(client_id: str, meal_name: str, limit: int = 3):
    """
    Return fruit recommendations for a client and meal.
    If no learned data exists, return fruits with default score 50.
    """
    try:
        if meal_name not in VALID_MEAL_NAMES:
            return False, f"Invalid meal name: {meal_name}", []

        fruit_items = Item.query.filter_by(ItemCategory='Fruit').all()

        if not fruit_items:
            return True, "No fruit items found", []

        recommendations = []

        for fruit in fruit_items:
            pref = get_preference(client_id, meal_name, fruit.ItemID)

            score = pref.Score if pref else DEFAULT_SCORE
            selection_count = pref.SelectionCount if pref else 0
            rejection_count = pref.RejectionCount if pref else 0

            if selection_count > 0:
                reason = "Frequently selected in this meal"
            elif rejection_count > 0:
                reason = "Previously changed in this meal"
            else:
                reason = "Default preference score"

            recommendations.append({
                "item_id": fruit.ItemID,
                "item_name": fruit.ItemName,
                "category": fruit.ItemCategory,
                "score": score,
                "selection_count": selection_count,
                "rejection_count": rejection_count,
                "reason": reason
            })

        recommendations.sort(
            key=lambda x: (-x["score"], -x["selection_count"], x["rejection_count"], x["item_name"])
        )

        return True, "Recommendations fetched successfully", recommendations[:limit]

    except Exception as e:
        print(f"Error in get_meal_fruit_recommendations: {str(e)}")
        return False, f"Server error: {str(e)}", []


def get_meal_fruit_recommendations_from_meal_id(client_id: str, meal_id: str, limit: int = 3):
    try:
        meal = Meal.query.filter_by(MealID=meal_id).first()
        if not meal:
            return False, "Meal not found", []

        return get_meal_fruit_recommendations(client_id, meal.MealName, limit)

    except Exception as e:
        print(f"Error in get_meal_fruit_recommendations_from_meal_id: {str(e)}")
        return False, f"Server error: {str(e)}", []