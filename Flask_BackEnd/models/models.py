from db_config import db
from datetime import datetime

#DB Schemasinin birebir benzeridir bu dosya. Her tablo için bir class vardır.

class Client(db.Model):
    __tablename__ = 'Client'
    
    ClientID = db.Column(db.String(36), primary_key=True)
    Email = db.Column(db.String(64), unique=True, nullable=False)
    Password = db.Column(db.String(60), nullable=False)
    Name = db.Column(db.String(64), nullable=False)
    DOB = db.Column(db.String(64))
    Sex = db.Column(db.String(10), nullable=False)
    AssignedDietitianID = db.Column(db.String(36), nullable=False)
    CreatedAt = db.Column(db.TIMESTAMP, default=datetime.utcnow)
    IsActive = db.Column(db.Boolean, default=True)
    
    # Relationships
    medical_details = db.relationship('MedicalDetails', backref='client', cascade='all, delete-orphan')
    physical_details = db.relationship('PhysicalDetails', backref='client', cascade='all, delete-orphan')
    daily_meal_plans = db.relationship('DailyMealPlan', backref='client', cascade='all, delete-orphan')
    progress_snapshots = db.relationship('ClientProgressSnapshot', backref='client', cascade='all, delete-orphan')

class MedicalDetails(db.Model):
    __tablename__ = 'Medical_Details'
    
    ClientID = db.Column(db.String(36), db.ForeignKey('Client.ClientID', ondelete='CASCADE'), primary_key=True)
    MedicalDetailID = db.Column(db.String(36), primary_key=True)
    MedicalData = db.Column(db.String(64), nullable=False)
    RecordedBy = db.Column(db.String(64), nullable=False)
    CreatedAt = db.Column(db.Date, nullable=False)

class Dietitian(db.Model):
    __tablename__ = 'Dietitian'
    
    DietitianID = db.Column(db.String(36), primary_key=True)
    Email = db.Column(db.String(64), unique=True, nullable=False)
    Password = db.Column(db.String(60), nullable=False)
    Name = db.Column(db.String(64), nullable=False)
    SubscriptionType = db.Column(db.Enum('STANDART', 'PRO'), nullable=True)
    SubscriptionStart = db.Column(db.TIMESTAMP, default=datetime.utcnow)
    SubscriptionEnd = db.Column(db.TIMESTAMP, default=datetime.utcnow)
    CreatedAt = db.Column(db.TIMESTAMP, default=datetime.utcnow)
    IsActive = db.Column(db.Boolean, default=True)
    
    # Relationships
    physical_details = db.relationship('PhysicalDetails', backref='dietitian', lazy="selectin")

class PhysicalDetails(db.Model):
    __tablename__ = 'Physical_Details'
    
    ClientID = db.Column(db.String(36), db.ForeignKey('Client.ClientID', ondelete='CASCADE'), primary_key=True)
    PhysicalDetailID = db.Column(db.String(36), primary_key=True)
    RecordedBy = db.Column(db.String(36), db.ForeignKey('Dietitian.DietitianID'))
    ActivityStatus = db.Column(db.Enum('SEDENTARY', 'LIGHT', 'MODERATE', 'HEAVY', 'ATHELETE'))
    Weight = db.Column(db.Numeric(5, 2))
    Height = db.Column(db.Numeric(5, 2))
    BodyFat = db.Column(db.Numeric(3, 1))
    MeasurementDate = db.Column(db.Date)

class DailyMealPlan(db.Model):
    __tablename__ = 'DailyMealPlan'
    
    MealPlanID = db.Column(db.String(36))
    ClientID = db.Column(db.String(36), db.ForeignKey('Client.ClientID', ondelete='CASCADE'), primary_key=True)
    PlanDate = db.Column(db.Date, primary_key=True)
    CreatedAt = db.Column(db.TIMESTAMP, default=datetime.utcnow)
    
    # Relationships
    meals = db.relationship('Meal', backref='daily_meal_plan', lazy="selectin", cascade='all, delete-orphan')

class Meal(db.Model):
    __tablename__ = 'Meal'
    
    MealID = db.Column(db.String(36), primary_key=True)
    MealPlanID = db.Column(db.String(36), db.ForeignKey('DailyMealPlan.MealPlanID'), primary_key=True)
    MealStart = db.Column(db.Time)
    MealEnd = db.Column(db.Time)
    
    # Relationships
    meal_items = db.relationship('MealItem', backref='meal', lazy="selectin", cascade='all, delete-orphan')

class Item(db.Model):
    __tablename__ = 'Item'
    
    ItemID = db.Column(db.String(36), primary_key=True)
    ItemName = db.Column(db.String(64), unique=True, nullable=False)
    ItemProtein = db.Column(db.Float)
    ItemCarb = db.Column(db.Float)
    ItemFat = db.Column(db.Float)
    ItemFiber = db.Column(db.Float)
    ItemVitamins = db.Column(db.JSON)
    ItemMinerals = db.Column(db.JSON)
    
    # Relationships
    meal_items = db.relationship('MealItem', backref='item', lazy="selectin")

class MealItem(db.Model):
    __tablename__ = 'MealItem'
    
    ItemID = db.Column(db.String(36), db.ForeignKey('Item.ItemID'), primary_key=True)
    MealID = db.Column(db.String(36), db.ForeignKey('Meal.MealID'), primary_key=True)
    ClientID = db.Column(db.String(36), db.ForeignKey('Client.ClientID'))
    ConsumeAmount = db.Column(db.Integer, nullable=False)
    canChange = db.Column(db.Boolean, nullable=False)
    isFollowed = db.Column(db.Boolean)
    ChangedItem = db.Column(db.JSON)
    isLLM = db.Column(db.Boolean)

class LoginAttempts(db.Model):
    __tablename__ = 'LoginAttempts'
    
    AttemptID = db.Column(db.String(36), primary_key=True)
    Email = db.Column(db.String(64))
    AttemptTime = db.Column(db.TIMESTAMP, default=datetime.utcnow)
    IPAddress = db.Column(db.String(45))
    IsSuccess = db.Column(db.Boolean, default=False)

class ClientProgressSnapshot(db.Model):
    __tablename__ = 'ClientProgressSnapshot'
    
    SnapshotID = db.Column(db.String(36), primary_key=True)
    ClientID = db.Column(db.String(36), db.ForeignKey('Client.ClientID', ondelete='CASCADE'), nullable=False)
    Weight = db.Column(db.Numeric(5, 2))
    BodyFat = db.Column(db.Numeric(4, 1))
    AdherenceRate = db.Column(db.Numeric(5, 2))
    ProgressDate = db.Column(db.Date, nullable=False)


