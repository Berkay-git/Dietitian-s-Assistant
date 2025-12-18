import bcrypt # pip install bcrypt
import hashlib
import re
from models.models import Dietitian, Client, LoginAttempts
from db_config import db
import datetime
import uuid

class AuthService:
    
    #/////////////////////////////////
                    #Static values

    # Zararlı pattern'ler (Bunlar önemli, SQL injection, XSS vb. için)
    MALICIOUS_PATTERNS = [
        r"(\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bCREATE\b|\bALTER\b)",  # SQL keywords
        r"(--|;|\/\*|\*\/|xp_|sp_)",  # SQL injection karakterleri
        r"(<script|<iframe|javascript:|onerror=|onload=)",  # XSS patterns
        r"(\.\./|\.\.\\)",  # Path traversal
        r"(\$\{|\{\{)",  # Template injection
    ]

    maxEmailCharaterAmount = 254
    maxPasswordByte = 72
    
    #/////////////////////////////////

    """Is input malicious?"""
    @staticmethod
    def is_malicious_input(text):
        if not isinstance(text, str):
            return True
        
        # Boş veya çok uzun input kontrolü
        if len(text) == 0 or len(text) > 255:
            return True
        
        # Zararlı pattern'leri kontrol et
        for pattern in AuthService.MALICIOUS_PATTERNS:
            if re.search(pattern, text, re.IGNORECASE):
                return True
        
        return False
    

    """Sanitize and validate email"""
    """Uses [is_malicious_input] as helper function"""
    @staticmethod
    def sanitize_email(email):
        """If input is not valid email, just do not bother db call"""
        if not email or not isinstance(email, str):
            return None
        
        # Email karakter uzunluğu kontrolü (RFC 5321 standardı)
        if len(email) > AuthService.maxEmailCharaterAmount:
            return None
        
        # Email formatı kontrolü
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, email.strip()):
            return None
        
        # Zararlı input kontrolü
        if AuthService.is_malicious_input(email):
            return None
        
        return email.strip().lower()
    

    """Validate Password (Without sanitizing)"""
    """Uses [is_malicious_input] as helper function"""
    @staticmethod
    def sanitize_password(password):

        #Return kısımlarını daha sonra detaylıca hataları döndürürüz böylece ekrana printleriz sorunun ne olduğunu görürler

        if not password or not isinstance(password, str):
            return None
        
        # Şifrenin UTF-8 byte kontrolü (bcrypt limiti)
        password_bytes = len(password.encode('utf-8'))
        if password_bytes > AuthService.maxPasswordByte:
            return None 
        
        # Minimum uzunluk kontrolü
        if len(password) < 6:
            return None
        
        # Zararlı pattern kontrolü (şifrede SQL injection olabilir)
        if AuthService.is_malicious_input(password):
            return None
        
        return password
    

    """Hash the email with SHA-256"""
    @staticmethod
    def hash_email(email):
        return hashlib.sha256(email.lower().encode()).hexdigest()
    
    """Hash the IP address with SHA-256"""
    @staticmethod
    def hash_ip(ip_address):
        if not ip_address or not isinstance(ip_address, str):
            return None
        return hashlib.sha256(ip_address.encode()).hexdigest()

    """Validation with bcrypt / For login"""
    @staticmethod
    def verify_password(plain_password, hashed_password):
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    
    """Hash the input password / For registeration"""
    @staticmethod
    def hash_password(password):
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')


    """Check if IP or email is rate limited"""
    @staticmethod
    def check_rate_limit(email, ip_address):
        """5 başarısız denemeden sonra 15 dk ban"""
        try:
            # Son 15 dakikayı kontrol et
            time_threshold = datetime.datetime.utcnow() - datetime.timedelta(minutes=15)
            
            # Email veya IP için başarısız denemeleri say
            failed_attempts = LoginAttempts.query.filter(
                db.or_(
                    #LoginAttempts.Email == email,
                    LoginAttempts.IPAddress == ip_address
                ),
                LoginAttempts.IsSuccess == False,
                LoginAttempts.AttemptTime >= time_threshold
            ).count()
            
            if failed_attempts >= 5:
                # En son başarısız denemenin zamanını al
                last_attempt = LoginAttempts.query.filter(
                    db.or_(
                        #LoginAttempts.Email == email,
                        LoginAttempts.IPAddress == ip_address
                    ),
                    LoginAttempts.IsSuccess == False
                ).order_by(LoginAttempts.AttemptTime.desc()).first()
                
                if last_attempt:
                    time_diff = datetime.datetime.utcnow() - last_attempt.AttemptTime
                    remaining_minutes = 3 - int(time_diff.total_seconds() / 60)
                    
                    if remaining_minutes > 0:
                        return True, f"Çok fazla başarısız deneme. {remaining_minutes} dakika sonra tekrar deneyin."
            
            return False, None
            
        except Exception as e:
            print(f"Rate limit kontrol hatası: {str(e)}")
            return False, None


    """Log login attempts to database"""
    @staticmethod
    def log_login_attempt(email, ip_address, is_success):
        try:
            attempt = LoginAttempts(
                AttemptID=str(uuid.uuid4()),
                Email=email,
                IPAddress=ip_address,
                IsSuccess=is_success,
                AttemptTime=datetime.datetime.utcnow()
            )
            db.session.add(attempt)
            db.session.commit()
        except Exception as e:
            db.session.rollback()  #Herhangi bir problem varsa session'ı temizle ve DB'ye hiçbir hatalı bir şey kaydetme
            print(f"Login attempt log hatası: {str(e)}")


    """User Login function - Hem Dietitian hem Client için"""
    """Uses [sanitize_email/sanitize_password/hash_email/check_rate_limit/log_login_attempt] as helper function"""
    @staticmethod
    def login(email, password, ip_address=None, user_type=None):
        try:
            hashed_ip = AuthService.hash_ip(ip_address)
            # Rate limit kontrolü (sanitization'dan önce)
            is_limited, limit_message = AuthService.check_rate_limit(email, hashed_ip)

            if is_limited:
                AuthService.log_login_attempt(str(email), hashed_ip, False) #str olarak tutalım ki executable olmasın
                return False, limit_message, None, None
            
            # Input sanitization (Check if there is any malicious input / )
            clean_email = AuthService.sanitize_email(email)
            clean_password = AuthService.sanitize_password(password)
            
            if not clean_email or not clean_password:
                AuthService.log_login_attempt(str(email), hashed_ip, False)
                return False, "Geçersiz email veya şifre formatı", None, None
            
            # Email'i hashle
            hashed_email = AuthService.hash_email(clean_email)
            # DEBUG print(f"Hashed Email: {hashed_email}")
            # DEBUG hashed_password = AuthService.hash_password(clean_password)
            # DEBUG print(f"Hashed password: {hashed_password}")
            
            user = None
            found_user_type = None
            
            # Eğer user_type belirtilmişse sadece o tabloya bak
            if user_type == 'dietitian':
                #DEBUGGING  print(f"Dietitian tablosunda arıyorum: {hashed_email}")
                user = Dietitian.query.filter_by(Email=hashed_email).first()
                found_user_type = 'dietitian' if user else None
            elif user_type == 'client':
                #DEBUGGING  print(f"Client tablosunda arıyorum: {hashed_email}")
                user = Client.query.filter_by(Email=hashed_email).first()
                found_user_type = 'client' if user else None
            #Ikinci kez kontrol et eğer none ise geri dön (Route'da da bakıyor, burada da)
            else:
                return False, "Kullanıcı tipi yok", None, None
            
            if not user:
                AuthService.log_login_attempt(clean_email, hashed_ip, False)
                return False, "Kullanıcı bulunamadı", None, None
            
            # Şifre kontrolü
            if not AuthService.verify_password(clean_password, user.Password):
                AuthService.log_login_attempt(clean_email, hashed_ip, False)
                return False, "Geçersiz şifre", None, None
            
            # Başarılı deneme kaydet
            AuthService.log_login_attempt(clean_email, hashed_ip, True)
            return True, "Giriş başarılı", user, found_user_type
            
        except Exception as e:
            AuthService.log_login_attempt(email, hashed_ip, False)
            return False, f"Giriş hatası: {str(e)}", None, None
        

    """User Registration function"""
    """Uses [sanitize_email/sanitize_password/hash_email/hash_password] as helper function"""
    @staticmethod
    def register(email, password, name): #Diğer parametreleri eklemeyi unutma
        try:
            # Input sanitization
            clean_email = AuthService.sanitize_email(email)
            clean_password = AuthService.sanitize_password(password)
            
            if not clean_email or not clean_password:
                return False, "Geçersiz email veya şifre formatı", None
            
            if not name or not isinstance(name, str) or len(name.strip()) == 0:
                return False, "İsim boş olamaz", None
            
            # Email'i hashle
            hashed_email = AuthService.hash_email(clean_email)
            
            # Email zaten kayıtlı mı kontrol et
            existing_dietitian = Dietitian.query.filter_by(email_hash=hashed_email).first()
            if existing_dietitian:
                return False, "Bu email zaten kayıtlı", None
            
            # Şifre'yi hashle
            hashed_password = AuthService.hash_password(clean_password)
            
            # Yeni diyetisyen oluştur
            new_dietitian = Dietitian(
                email_hash=hashed_email,
                password_hash=hashed_password,
                name=name.strip()
            )
            
            db.session.add(new_dietitian)
            db.session.commit()
            
            return True, "Kayıt başarılı", new_dietitian
            
        except Exception as e:
            db.session.rollback()
            return False, f"Kayıt hatası: {str(e)}", None