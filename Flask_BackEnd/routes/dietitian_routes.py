#Burası ise controller kısmıdır. Sadece metodlar bulunur, API/Endpoint kısmı burasıdır.Request alır,Service çağırır,Response döner.
#Ne kadar az kod olursa o kadar iyidir, python backendde.

from flask import Blueprint, request, jsonify
from services.allServices import AuthService
import jwt #Session yerine token, Web+Mobil için ideal,  pip install PyJWT (Backend terminali içerisinde yaz, genel klasöre yazma)
import datetime
from db_config import Config

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
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
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
        #DEBUGGING  print(f"!!! EXCEPTION !!!")
        #DEBUGGING print(f"Exception type: {type(e).__name__}")
        #DEBUGGING  print(f"Exception message: {str(e)}")
        return jsonify({'error': 'Sunucu hatası'}), 500