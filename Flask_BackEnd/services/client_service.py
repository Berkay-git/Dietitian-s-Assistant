import uuid
import datetime
from models.models import Client, PhysicalDetails, MedicalDetails
from db_config import db
from services.allServices import AuthService 

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

        # 4. Generate Client UUID
        new_client_id = str(uuid.uuid4())

        # 5. Create Client Record
        new_client = Client(
            ClientID=new_client_id,
            Name=data['name'],
            Email=data['email'],
            Password=hashed_password,
            DOB=data['dob'],
            Sex=data['gender'],
            AssignedDietitianID=dietitian_id, # <--- LINKING TO DIETITIAN
            IsActive=True
        )

        #Save to DB
        db.session.add(new_client)

        # 6. Create Physical Details Record (Step 2 Data)
        # We check if these fields exist in data, else use None/Defaults
        new_physical = PhysicalDetails(
            ClientID=new_client_id,
            PhysicalDetailID=str(uuid.uuid4()),
            RecordedBy=dietitian_id,
            Weight=data.get('weight'),
            Height=data.get('height'),
            BodyFat=data.get('bodyFat'),
            ActivityStatus=data.get('activityStatus', 'SEDENTARY'),
            MeasurementDate=datetime.date.today()
        )
        db.session.add(new_physical)

        # 7. Create Medical Details Record (Step 2 Data)
        # Only add if medical details are provided
        medical_text = data.get('medicalDetails', 'None')
        new_medical = MedicalDetails(
            ClientID=new_client_id,
            MedicalDetailID=str(uuid.uuid4()),
            MedicalData=medical_text,
            RecordedBy=dietitian_id,
            CreatedAt=datetime.date.today()
        )
        db.session.add(new_medical)

        # 8. Commit Everything
        db.session.commit()

        return True, "Client created successfully", new_client
    
    except Exception as e:
        db.session.rollback()
        print(f"Error creating client: {e}")
        return False, "Database error", None
    
def update_client_details(client_id, data):
    try:
        # 1. Update Physical Details
        physical = PhysicalDetails.query.filter_by(ClientID=client_id).first()
        if physical:
            physical.Weight = data.get('weight')
            physical.Height = data.get('height')
            physical.BodyFat = data.get('bodyfat')
            physical.ActivityStatus = data.get('activity')
        
        # 2. Update Medical Details
        medical = MedicalDetails.query.filter_by(ClientID=client_id).first()
        if medical:
            medical.MedicalData = data.get('medicalReport')
        
        # 3. Update Basic Client Info (Optional, e.g. Name/Goal if you added Goal column)
        client = Client.query.filter_by(ClientID=client_id).first()
        if client:
                # If you eventually add a 'Goal' column to Client table, update it here:
                # client.Goal = data.get('goal') 
                pass

        db.session.commit()
        return True, "Client updated successfully"

    except Exception as e:
        db.session.rollback()
        print(f"Update Error: {e}")
        return False, "Database update failed"
    

def delete_client(client_id):
    try:
        clean_id = client_id.strip()
        
        client = Client.query.filter_by(ClientID=clean_id).first()
        if not client:
            return False, "Client not found"
        
        client.IsActive = False # deactivate client.
        db.session.commit()
        
        return True, "Client deactivated successfully"

    except Exception as e:
        db.session.rollback()
        return False, str(e)
    
def reactivate_client(client_id):
    try:
        clean_id = client_id.strip()
        
        client = Client.query.filter_by(ClientID=clean_id).first()
        if not client:
            return False, "Client not found"
        
        # Set back to True
        client.IsActive = True
        db.session.commit()
        
        return True, "Client reactivated successfully"

    except Exception as e:
        db.session.rollback()
        return False, str(e)