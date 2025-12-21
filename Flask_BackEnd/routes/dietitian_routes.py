#Burası ise controller kısmıdır. Sadece metodlar bulunur, API/Endpoint kısmı burasıdır.Request alır,Service çağırır,Response döner.
#Ne kadar az kod olursa o kadar iyidir, python backendde.

from flask import Blueprint, request, jsonify
from services.allServices import AuthService
import jwt #Session yerine token, Web+Mobil için ideal,  pip install PyJWT (Backend terminali içerisinde yaz, genel klasöre yazma)
from datetime import datetime, timedelta, date
from db_config import Config
import traceback

from models.models import Client # Import client details
from services.dailymealplan_service import *
from models.models import Client, PhysicalDetails, MedicalDetails
from services.client_service import *
from services.mealitem_service import *
from services.meal_service import *
import services.client_service as client_service# web için, böyle importlamak lazim yoksa çalışmıyor.
import services.meal_service as meal_service# web için, böyle importlamayınca çalışmıyor. (from ... import *) olmuyor.



dietitian_bp = Blueprint('dietitian', __name__)


# Mobile and Web
@dietitian_bp.route('/auth', methods=['POST'])
def login():
    try:
        # Email hash (SHA-256)
        data = request.get_json() #email,password,userType gelicek

        print("=== 🔑 LOGIN REQUEST 🔑 ===")
        # DEBUG print(f"Gelen data: {data}")
        
        if not data or 'email' not in data or 'password' not in data:
            return jsonify({'error': 'Email ve şifre gereklidir'}), 400
        
        if not isinstance(data['email'], str) or not isinstance(data['password'], str):
            return jsonify({'error': 'Geçersiz veri tipi'}), 400
        
        user_type = data['user_type']  # 'dietitian', 'client' veya None
        if user_type not in ['dietitian', 'client']:
            print(f"Geçersiz user_type: {user_type}")
            return jsonify({'error': 'Kullanıcı tipi "dietitian" veya "client" olmalıdır'}), 400

        email = data['email']
        password = data['password']
        
        #DEBUGGING  print(f"Email: {email}, User Type: {user_type}") DEBUGGING 

        # IP adresini al
        ip_address = request.headers.get('X-Forwarded-For', request.remote_addr)
        
        # AuthService ile giriş kontrolü
        success, message, user, found_user_type = AuthService.login(email, password, ip_address, user_type)
        
        print(f"Login sonucu - Success: {success}, Message: {message}, User Type: {found_user_type}")

        if not success:
            return jsonify({'error': message}), 401

        # Token oluştur
        token = jwt.encode({
            'user_id': user.DietitianID if found_user_type == 'dietitian' else user.ClientID,
            'user_type': found_user_type,
            'email_hash': user.Email,
            'exp': datetime.utcnow() + timedelta(days=7)
        }, Config.SECRET_KEY, algorithm='HS256')
    

        return jsonify({
            'message': message,
            'token': token,
            'user_type': found_user_type,  #Bunun sayesinde tek 1 login fonksiyonunda 2 türü de işleyeceğiz
            'user': {
                'id': user.DietitianID if found_user_type == 'dietitian' else user.ClientID,
                'name': user.Name,
                'email': user.Email
            }
        }), 200
        
    except Exception as e:
        print(f"!!! EXCEPTION !!!")
        print(f"Exception type: {type(e).__name__}")
        print(f"Exception message: {str(e)}")
        return jsonify({'error': 'Sunucu hatası'}), 500
    
# Mobile
@dietitian_bp.route('/meals', methods=['GET'])
def getMeals():
    """
    Get meal plan for a client on a specific date (today/given date [Past/Future])
    
    Returns:
        - Daily meal plan with all meals and totals
    """
    try:
        # Get client_id from query parameters
        client_id = request.args.get('client_id')
        
        if not client_id:
            return jsonify({'error': 'client_id is required'}), 400
        
        # Get plan_date from query parameters, default to today
        plan_date_str = request.args.get('plan_date')
        
        if plan_date_str:
            try:
                # Parse date string to date object
                plan_date = datetime.strptime(plan_date_str, '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'Geçersiz tarih formatı. YYYY-MM-DD kullanın'}), 400
        else:
            # Default to today
            plan_date = date.today()
        
        meal_plan = get_daily_meal_plan(client_id, plan_date)
        
        if not meal_plan:
            return jsonify({'error': 'Bu tarih için meal plan bulunamadı'}), 404
        
        return jsonify({
            'success': True,
            'data': meal_plan
        }), 200
        
    except Exception as e:
        print(f"Error in getMeals: {str(e)}")
        return jsonify({'error': 'Sunucu hatası'}), 500

# Mobile
@dietitian_bp.route('/meals/available-dates', methods=['GET'])
def getAvailableDates():
    """
    Get all available dates that have meal plans for a client

    Returns:
        - List of dates in ISO format
    """
    try:
        client_id = request.args.get('client_id')
        
        if not client_id:
            return jsonify({'error': 'client_id is required'}), 400
        
        #All dates that client has meal plans (it will be shown in date picker box in frontend)
        #ISO formatted 'YYYY-MM-DD'
        available_dates = get_available_plan_dates(client_id)
        
        return jsonify({
            'success': True,
            'dates': available_dates
        }), 200
        
    except Exception as e:
        print(f"Error in getAvailableDates: {str(e)}")
        return jsonify({'error': 'Server error'}), 500
    

# Web
@dietitian_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Validate data
        if not data or not all(k in data for k in ('email', 'password', 'name')):
            return jsonify({'error': 'Email, şifre ve isim gereklidir'}), 400
            
        # Call Service
        success, message, new_dietitian = AuthService.register(
            email=data['email'],
            password=data['password'],
            name=data['name']
        )
        
        if success:
            return jsonify({
                'message': message,
                'dietitian': new_dietitian.to_dict() # This uses the method we added to_dict, in authService
            }), 201
        else:
            return jsonify({'error': message}), 400
            
    except Exception as e:
        print(f"Register Error: {str(e)}")
        return jsonify({'error': 'Sunucu hatası'}), 500
    
# Web
@dietitian_bp.route('/clients', methods=['GET'])
def get_my_clients():
    try:
        # 1. Get the Dietitian's ID from the request (sent by frontend)
        dietitian_id = request.args.get('dietitian_id')
        
        if not dietitian_id:
            return jsonify({'error': 'Dietitian ID is required'}), 400

        # 2. Query the database: "Select * FROM Client WHERE AssignedDietitianID = ..."
        clients = Client.query.filter_by(AssignedDietitianID=dietitian_id).all()
        
        # 3. Convert to JSON (using the .to_dict() method we created)
        client_list = [client.to_dict() for client in clients]
        
        return jsonify(client_list), 200
        
    except Exception as e:
        print(f"Error fetching clients: {e}")
        return jsonify({'error': 'Server error'}), 500
    

# Web
@dietitian_bp.route('/client-details/<client_id>', methods=['GET'])
def get_client_full_details(client_id):
    try:
        # 1. Fetch Basic Client Info
        client = Client.query.filter_by(ClientID=client_id).first()
        if not client:
            return jsonify({'error': 'Client not found'}), 404

        # 2. Fetch Physical Details (Get the most recent one if multiple exist)
        # Assuming one-to-one for simplicity, or fetching the first found
        physical = PhysicalDetails.query.filter_by(ClientID=client_id).first()

        # 3. Fetch Medical Details
        medical = MedicalDetails.query.filter_by(ClientID=client_id).first()

        # 4. Combine into one JSON object
        response_data = {
            'id': client.ClientID,
            'name': client.Name,
            'email': client.Email,
            'dob': client.DOB,
            'gender': client.Sex,
            'status': 'Active' if client.IsActive else 'Inactive',
            # Physical Data (Handle if None)
            'weight': float(physical.Weight) if physical and physical.Weight else '-',
            'height': float(physical.Height) if physical and physical.Height else '-',
            'bodyfat': float(physical.BodyFat) if physical and physical.BodyFat else '-',
            'activity': physical.ActivityStatus if physical else 'Not Set',
            # Medical Data (Handle if None)
            'medicalReport': medical.MedicalData if medical else 'No records found',
            'goal': 'General Health' # Placeholder (Add to DB if needed)
        }

        return jsonify(response_data), 200

    except Exception as e:
        print(f"Error fetching details: {e}")
        return jsonify({'error': 'Server error'}), 500
    
# Web
@dietitian_bp.route('/clients', methods=['POST'])
def add_client():
    try:
        data = request.get_json()
        
        # We expect the frontend to send the dietitian_id inside the body
        dietitian_id = data.get('dietitian_id')
        
        if not dietitian_id:
            return jsonify({'error': 'Dietitian ID is missing'}), 400

        # Call the Service
        success, message, client = create_client(dietitian_id, data)
        
        if success:
            return jsonify({
                'message': message,
                'client': client.to_dict()
            }), 201
        else:
            return jsonify({'error': message}), 400

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

# Mobile
# Update only manual changed meal item feedback
@dietitian_bp.route('/client_feedback', methods=['PATCH']) #Kısmı güncelleme için PATCH
def give_Feedback():
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or not all(k in data for k in ('client_id', 'meal_id', 'item_id', 'is_followed')):
            return jsonify({'error': 'client_id, meal_id, item_id ve is_followed gereklidir'}), 400
        
        # Get parameters from request
        client_id = data['client_id']
        meal_id = data['meal_id']
        item_id = data['item_id']
        is_followed = data['is_followed']
        changed_item = data.get('changed_item', None)

        success, message, updated_item = give_feedback_on_mealitem_manually(
            client_id=client_id,
            meal_id=meal_id,
            item_id=item_id,
            changedItem=changed_item,
            is_followed=is_followed,
        )
        
        if success:
            return jsonify({
                'success': True,
                'message': message,
                'updated_item': updated_item
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': message
            }), 400
            
    except Exception as e:
        print(f"Error in give_Feedback: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': 'Server error'}), 500
    

# Mobile (Çalışıyor) and Web (Eklenecek)
@dietitian_bp.route('/dropdown_items', methods=['GET'])
def get_dropdown_available_items():
    try:
        items_list = get_all_items()
        return jsonify(items_list), 200
    
    except Exception as e:
        print(f"Error in get_available_items: {str(e)}")
        return jsonify({'error': 'Server error'}), 500

# Web    
@dietitian_bp.route('/clients/<client_id>', methods=['PUT'])
def update_client(client_id):
    try:
        data = request.get_json()
        success, message = update_client_details(client_id, data)
        if success:
            return jsonify({'message': message}), 200
        else:
            return jsonify({'error': message}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Web
@dietitian_bp.route('/meal-plans', methods=['GET'])
def api_get_meal_plans(): 
    try:
        client_id = request.args.get('client_id')
        if not client_id:
            return jsonify({'error': 'Client ID required'}), 400

        # Call the function from the imported module
        plans = get_client_meal_plans(client_id)
        return jsonify(plans), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Web    
@dietitian_bp.route('/meal-plans', methods=['POST'])
def api_create_meal_plan():  # <--- RENAMED THIS to avoid conflict
    try:
        data = request.get_json()
        if not data.get('client_id') or not data.get('date'):
            return jsonify({'error': 'Client ID and Date are required'}), 400

        # Now we call the function from the imported module variable
        success, message = create_meal_plan(data)
        
        if success:
            return jsonify({'message': message}), 201
        else:
            return jsonify({'error': message}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Mobile    
@dietitian_bp.route('/alternative', methods=['POST'])
def get_alternative_meal_item():
    """
    Get alternative meal item suggestion for a client using LLM

    """
    try:

        """    
        Expected JSON body:
        - client_id: Client ID
        - meal_id: Meal ID
        - item_id: Item ID to be replaced
        """

        data = request.get_json()
        
        # Validate required fields
        if not data or not all(k in data for k in ('client_id', 'meal_id', 'item_id')):
            return jsonify({'error': 'client_id, meal_id ve item_id hatalı veya eksik'}), 400
        
        client_id = data['client_id']
        meal_id = data['meal_id']
        item_id = data['item_id']
        
        # Call the service method
        success, message, alternative_item = get_alternative_mealitem(client_id, meal_id, item_id)
        
        if success:
            return jsonify({
                'success': True,
                'message': message,
                'alternative': alternative_item
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': message
            }), 400
            
    except Exception as e:
        print(f"Error in get_alternative_meal_item route: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Server error'}), 500
    
# Mobile
# Update only LLM suggested alternative
@dietitian_bp.route('/update_alternative', methods=['PUT']) #PUT OR PATCH
def update_mealitem_alternative():
    """
    Update mealitem if user accepted the LLM suggested alternative

    """
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or not all(k in data for k in ('client_id', 'meal_id', 'item_id', 'alternative_meal')):
            return jsonify({'error': 'client_id, meal_id, item_id ve accepted_item_id hatalı veya eksik'}), 400
        
        client_id = data['client_id']
        meal_id = data['meal_id']
        item_id = data['item_id']
        accepted_item_json = data['alternative_meal']
        
        # Call the service method
        success, message = give_feedback_on_mealitem_via_LLM(
            client_id, meal_id, item_id, accepted_item_json
        )
        
        if success:
            return jsonify({
                'success': True,
                'message': message, #Success message
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': message
            }), 400
            
    except Exception as e:
        print(f"Error in update_mealitem_alternative route: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': 'Server error'}), 500
    
@dietitian_bp.route('/clients/<client_id>', methods=['DELETE'])
def delete_client(client_id):
    try:
        # Clean call to the service
        success, message = client_service.delete_client(client_id)
        
        if success:
            return jsonify({'message': message}), 200
        else:
            return jsonify({'error': message}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@dietitian_bp.route('/clients/<client_id>/reactivate', methods=['PUT'])
def reactivate_client(client_id):
    try:
        success, message = client_service.reactivate_client(client_id)
        
        if success:
            return jsonify({'message': message}), 200
        else:
            return jsonify({'error': message}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

# to get items from database and use them when addin a meal to client.    
@dietitian_bp.route('/items', methods=['GET'])
def get_available_items():
    try:
        # Call the service function
        items = get_all_items()
        return jsonify(items), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500