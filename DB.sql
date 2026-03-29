-- Schemayı oluştur
create DATABASE dietitian_assistant; USE dietitian_assistant;

-- Email / DOB  = SHA-256 Hashing, Tüm email ve DOB'ler hashlenmiş olarak tutulacaktır.
-- Password = bcrypt

-- Client Tablosu
CREATE TABLE Client (
    ClientID VARCHAR(36) PRIMARY KEY, -- UUID
    Email VARCHAR(64) UNIQUE NOT NULL,
    Password VARCHAR(60) NOT NULL, -- bcrypt
    Name VARCHAR(64) NOT NULL,
    DOB VARCHAR(64),
    Sex VARCHAR(10) NOT NULL,
    AssignedDietitianID VARCHAR(36) NOT NULL,
    -- AssignedMealID VARCHAR(36), Bunun kaldırılmasıyla birden fazla mealplan'i olabilir FAKAT index eklemesi yapmak daha doğrudur Client,Date şeklinde
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    IsActive BOOLEAN DEFAULT TRUE, -- Başlangıçta kurulurken hesap aktif sayılır, eğer kapatıcaksa burası false olucak. User silmek diye bir QUERY olmıcak ASLA
    
    -- Indexes
    INDEX idx_client_dietitian (AssignedDietitianID)  -- Diyetisyen o client'ı görüntülemek isterken
);

-- Client's Medical_Details Tablosu
CREATE TABLE Medical_Details(
	ClientID VARCHAR(36), -- UUID
    MedicalDetailID VARCHAR(36),
    MedicalData VARCHAR(64) NOT NULL,
    RecordedBy VARCHAR(64) NOT NULL,
    
    CreatedAt DATE NOT NULL,
    -- Importance ENUM('MIN','MID','MAX'),  -- Mesela diyabet MAX tier çünkü diyetleri hazırlanırken çok dikkat edilmesi lazım o yüzden önem'i yüksek.
    
    PRIMARY KEY (ClientID, MedicalDetailID),
    FOREIGN KEY (ClientID) REFERENCES Client(ClientID) ON DELETE CASCADE
);

-- Dietitian Tablosu
CREATE TABLE Dietitian (
    DietitianID VARCHAR(36) PRIMARY KEY, -- UUID
    Email VARCHAR(64) UNIQUE NOT NULL, 
    Password VARCHAR(60) NOT NULL,
    Name VARCHAR(64) NOT NULL,
    
    SubscriptionType ENUM('STANDART','PRO'),
    SubscriptionStart TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    SubscriptionEnd TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	IsActive BOOLEAN DEFAULT TRUE -- Başlangıçta kurulurken hesap aktif sayılır, eğer kapatıcaksa burası false olucak
    -- SELECT * FROM Dietitian WHERE Email = ? AND Password = ? AND IsActive = TRUE  şeklinde yapıcaz

    
);

-- Weak Entity Physical_Details (Client'a bağımlı) Tablosu
CREATE TABLE Physical_Details (
    ClientID VARCHAR(36), -- Weak entity'nin sahibi
    PhysicalDetailID INT NOT NULL AUTO_INCREMENT, -- Weak entity'nin kendi partial key'i
    RecordedBy VARCHAR(36), -- Hangi diyetisyen tarafından recordlandı (ID'si)  ???? GEREKLI ?? GEREKSIZ ???
    
    ActivityStatus ENUM('SEDENTARY','LIGHT','MODERATE','HEAVY','ATHELETE'),
    Weight DECIMAL(5,2), -- kg cinsinden (örn: 70.25)
    Height DECIMAL(5,2), -- cm cinsinden (örn: 175.50)
	BodyFat DECIMAL(3,1), -- 0.00 - 99.9%  (Mantıken 100% yağ oranı olamaz amk)
    MeasurementDate DATE, -- Ölçüm tarihi (Raporlama için önemli)
    
    PRIMARY KEY (PhysicalDetailID, ClientID),
    FOREIGN KEY (ClientID) REFERENCES Client(ClientID) ON DELETE CASCADE,
    FOREIGN KEY (RecordedBy) REFERENCES Dietitian(DietitianID)
);


-- Tüm o günlük planı 
CREATE TABLE DailyMealPlan(
	MealPlanID INT NOT NULL AUTO_INCREMENT,
    ClientID VARCHAR(36), -- UUID
    
    PlanDate DATE, -- 07/12/2025
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (MealPlanID),
    UNIQUE KEY uq_client_plandate (ClientID, PlanDate),
    FOREIGN KEY (ClientID) REFERENCES Client(ClientID) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_plan_client (ClientID),
	INDEX idx_plan_date (ClientID,PlanDate)  -- AssignedMealID kaldırıldığı için eklenilmesi gereklidir
);


-- Plan içindeki bir adet meal (09:00 - 11:00 Kahvaltı)
CREATE TABLE Meal(
	MealID INT NOT NULL AUTO_INCREMENT,
    MealPlanID INT NOT NULL,
    MealStart TIME,  -- 09:00
    MealEnd TIME,  -- 11:00
    
    PRIMARY KEY (MealID),
    FOREIGN KEY (MealPlanID) REFERENCES DailyMealPlan(MealPlanID),
    
    -- Indexes
    INDEX idx_mealplan (MealPlanID)
);


-- Meal içine yerleştirilecek itemlar listesi/tablosu
CREATE TABLE Item(
	ItemID INT PRIMARY KEY AUTO_INCREMENT,
    ItemName VARCHAR(64) UNIQUE NOT NULL,  -- Her eşyadan 1 tane olmak zorunda, 10 tane Banana değeri olamaz
    ItemCategory VARCHAR(30) DEFAULT NULL,
    ItemProtein FLOAT,  -- gram cinsinden hepsi
    ItemCarb FLOAT,
    ItemFat FLOAT
);


-- Meal içindeki itemları görmek / Feedback ile takip etmek
CREATE TABLE MealItem(
	ItemID INT NOT NULL,
    MealID INT,
    ClientID VARCHAR(36),  -- Performans için burada denormalization düşündüm. Çoğu şey client-merkezli olduğu için her şeyde clientID olması performansımızı çok artırıcak
    
    ConsumeAmount INT NOT NULL, -- 80 gr / 150 gr 
    canChange BOOLEAN NOT NULL,  -- LLM Kullanım izni
    isFollowed BOOLEAN, -- Kaçırdı (0), Değiştirdi(0), Uyum sağladı (1) Eğer NULL ise daha feedback verilmedi
    ChangedItem JSON, -- Dropdown menuden itemlar seçilecek buraya "ID: Miktar"  şeklinde yazılacak böylece çoklu şekilde tutabilicez, gram bazında miktar [Kaçırdı ise burası boş kalıcak]
    -- isFollowed / ChangedItem kısımları için buraya onlar için update atıcaz. LLM'in önerisi de changedItem'a gelicek
    isLLM BOOLEAN,
    
    PRIMARY KEY (ItemID, MealID),
    FOREIGN KEY (ItemID) REFERENCES Item(ItemID),
    FOREIGN KEY (MealID) REFERENCES Meal(MealID),
    FOREIGN KEY (ClientID) REFERENCES Client(ClientID),
    
    
    -- Indexes
    INDEX idx_mealitem_client (ClientID),
    INDEX idx_meal (MealID)
);


-- Security için (Özellikle de Brute Force engellemesi için)
CREATE TABLE LoginAttempts (
	AttemptID INT AUTO_INCREMENT PRIMARY KEY, -- UUID
    Email VARCHAR(64),
    AttemptTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    IPAddress VARCHAR(64),
    IsSuccess BOOLEAN DEFAULT FALSE,
    
	-- Indexes
    INDEX idx_login_email_time (Email, AttemptTime),  -- Bu Email adresi ile son 15/40 dkda kaç kere deneme yaptı ? 
    INDEX idx_login_ip_time (IPAddress, AttemptTime)  -- Bu IP addresi ile son 15/40 dk da kaç kere deneme yaptı ? 
    -- Backend'de eğer 3'ten fazla yanlış denemeyse o IP adresine bloke edicez 30 dk
);

CREATE TABLE ClientProgressSnapshot (
    SnapshotID    INT AUTO_INCREMENT PRIMARY KEY,
    ClientID      CHAR(36) NOT NULL,

    SuccessAmount	       DECIMAL(5,2), 
    Total       DECIMAL(4,1),
    AdherenceRate DECIMAL(5,2),   -- e.g. 87.50 (%)

    ProgressDate DATE NOT NULL,

    CONSTRAINT fk_snapshot_client
        FOREIGN KEY (ClientID) REFERENCES Client(ClientID) ON DELETE CASCADE,

	-- Indexes
    INDEX idx_snapshot_client_date (ClientID, ProgressDate)
);

CREATE TABLE ClientMealPreference (
    PreferenceID INT NOT NULL AUTO_INCREMENT,
    ClientID VARCHAR(36) NOT NULL,
    MealName VARCHAR(20) NOT NULL,
    ItemID INT NOT NULL,
    ItemName VARCHAR(100),
    Score INT NOT NULL DEFAULT 50,
    SelectionCount INT NOT NULL DEFAULT 0,
    RejectionCount INT NOT NULL DEFAULT 0,
    PRIMARY KEY (PreferenceID),


    FOREIGN KEY (ClientID) REFERENCES Client(ClientID) ON DELETE CASCADE,
    FOREIGN KEY (ItemID) REFERENCES Item(ItemID) ON DELETE CASCADE
);
