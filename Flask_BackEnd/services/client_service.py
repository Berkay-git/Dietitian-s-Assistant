import uuid
from models.models import Client
from db_config import db
from services.allServices import AuthService # Reusing your existing Auth logic for hashing

class ClientService:
    @staticmethod
    def create_client(dietitian_id, data):
        try:
            # 1. Validate required fields
            required_fields = ['name', 'email', 'password', 'dob', 'gender']
            for field in required_fields:
                if field not in data or not data[field]:
                    return False, f"{field} is required", None

            # 2. Check if email already exists
            if Client.query.filter_by(Email=data['email']).first():
                return False, "Email already exists", None

            # 3. Hash the password (using your existing AuthService helper)
            hashed_password = AuthService.hash_password(data['password'])

            # 4. Create the Client Object
            new_client = Client(
                ClientID=str(uuid.uuid4()),
                Name=data['name'],
                Email=data['email'],
                Password=hashed_password,
                DOB=data['dob'],
                Sex=data['gender'],
                AssignedDietitianID=dietitian_id, # <--- LINKING TO DIETITIAN
                IsActive=True
            )

            # 5. Save to DB
            db.session.add(new_client)
            db.session.commit()

            return True, "Client created successfully", new_client

        except Exception as e:
            db.session.rollback()
            print(f"Error creating client: {e}")
            return False, "Database error", None