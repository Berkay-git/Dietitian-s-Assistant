from models.models import Item
from db_config import db

def get_item_by_id(item_id):
    """
    Get item details by ItemID
        
    Returns:
        dict: Item details or None if not found
    """
    try:
        item = Item.query.filter_by(ItemID=item_id).first()
        
        if not item:
            return None
            
        return {
            'ItemID': item.ItemID,
            'ItemName': item.ItemName,
            'ItemProtein': float(item.ItemProtein) if item.ItemProtein else 0,
            'ItemCarb': float(item.ItemCarb) if item.ItemCarb else 0,
            'ItemFat': float(item.ItemFat) if item.ItemFat else 0,
            'ItemFiber': float(item.ItemFiber) if item.ItemFiber else 0,
            'ItemVitamins': item.ItemVitamins,
            'ItemMinerals': item.ItemMinerals
        }
    except Exception as e:
        print(f"Error in get_item_by_id: {str(e)}")
        return None

def calculate_item_calories(protein, carb, fat):
    """
    Calculate total calories for item (per 100g)
    Formula: Protein*4 + Carb*4 + Fat*9
        
    Returns:
        float: Total calories
    """
    return (protein * 4) + (carb * 4) + (fat * 9)

def calculate_portion_calories(total_calories, portion_grams):
    """
    Calculate calories for specific portion
    Formula: total_calories * (portion/100)

        
    Returns:
        float: Calories for the portion
    """
    return total_calories * (portion_grams / 100)