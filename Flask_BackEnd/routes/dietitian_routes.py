#Burası ise controller kısmıdır. Sadece metodlar bulunur, API/Endpoint kısmı burasıdır.Request alır,Service çağırır,Response döner.
#Ne kadar az kod olursa o kadar iyidir, python backendde.

from flask import Blueprint, request, jsonify
from services.allServices import AuthService
import jwt #Session yerine token, Web+Mobil için ideal,  pip install PyJWT (Backend terminali içerisinde yaz, genel klasöre yazma)
from datetime import datetime, timedelta, date
from db_config import Config

from services.dailymealplan_service import *

dietitian_bp = Blueprint('dietitian', __name__)

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