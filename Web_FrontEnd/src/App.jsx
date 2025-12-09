import { useState } from 'react';



// --- 1. MOCK DATABASE (Per 100g values) ---
const FOOD_DATABASE = [
  { id: 'f1', name: 'Apple', calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
  { id: 'f2', name: 'Apricot', calories: 48, protein: 1.4, carbs: 11, fat: 0.4 },
  { id: 'f3', name: 'Banana', calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3 },
  { id: 'f4', name: 'Butter', calories: 717, protein: 0.9, carbs: 0.1, fat: 81 },
  { id: 'f5', name: 'Chicken Breast (Grilled)', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { id: 'f6', name: 'Chicken Thigh', calories: 209, protein: 26, carbs: 0, fat: 10.9 },
  { id: 'f7', name: 'Rice (White, Cooked)', calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  { id: 'f8', name: 'Oatmeal', calories: 68, protein: 2.4, carbs: 12, fat: 1.4 },
  { id: 'f9', name: 'Egg (Boiled)', calories: 155, protein: 13, carbs: 1.1, fat: 11 },
  { id: 'f10', name: 'Almonds', calories: 579, protein: 21, carbs: 22, fat: 50 },
];

const MOCK_CLIENT = {
  name: "Sarah Johnson",
  age: 28,
  goal: "Weight Management",
  startDate: "25 Oct 2025",
  planDuration: "7 days"
};

// Added 'allowChange: true' (Green) as default for initial items
const INITIAL_MEALS = [
  {
    id: 1,
    title: "Breakfast",
    time: "08:00 - 10:00",
    items: [
      { name: "Oatmeal", amount: 120, calories: 81, protein: 3, carbs: 14, fat: 2, allowChange: true } 
    ]
  },
  {
    id: 2,
    title: "Lunch",
    time: "12:30 - 13:30",
    items: []
  }
];

// --- COMPONENTS ---

function AddMealModal({ isOpen, onClose, onAdd }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const [grams, setGrams] = useState(100); 

  if (!isOpen) return null;

  const filteredFoods = FOOD_DATABASE.filter(food => 
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = () => {
    if (selectedFood) {
      onAdd(selectedFood, grams);
      setSearchTerm('');
      setSelectedFood(null);
      setGrams(100);
      onClose();
    }
  };

  const styles = {
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modal: { backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '400px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', gap: '10px' },
    list: { border: '1px solid #ddd', maxHeight: '150px', overflowY: 'auto', borderRadius: '4px' },
    listItem: { padding: '8px', cursor: 'pointer', borderBottom: '1px solid #eee' },
    selectedItem: { backgroundColor: '#e6f7ff', fontWeight: 'bold' },
    input: { padding: '8px', width: '100%', boxSizing: 'border-box' }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3>Add Food Item</h3>
        <input 
          type="text" 
          placeholder="Search food (e.g. 'chick')..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.input}
          autoFocus
        />
        <div style={styles.list}>
          {filteredFoods.length === 0 ? <div style={{padding:'10px', color:'#999'}}>No items found</div> : filteredFoods.map(food => (
            <div key={food.id} style={{...styles.listItem, ...(selectedFood?.id === food.id ? styles.selectedItem : {})}} onClick={() => setSelectedFood(food)}>
              {food.name} <span style={{fontSize:'0.8em', color:'#666'}}>({food.calories}kcal/100g)</span>
            </div>
          ))}
        </div>
        {selectedFood && (
          <div style={{backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '4px'}}>
            <p style={{margin: '0 0 5px 0'}}>Selected: <strong>{selectedFood.name}</strong></p>
            <label>Amount (grams): </label>
            <input type="number" value={grams} onChange={(e) => setGrams(Number(e.target.value))} style={{width: '60px', padding: '5px'}} />
            <div style={{fontSize: '0.8em', marginTop: '5px', color: '#555'}}>Calculated: {Math.round((grams/100) * selectedFood.calories)} kcal</div>
          </div>
        )}
        <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
          <button onClick={handleSave} disabled={!selectedFood} style={{flex: 1, padding: '10px', cursor: 'pointer', backgroundColor: selectedFood ? '#4CAF50' : '#ccc', color: 'white', border: 'none', borderRadius: '4px'}}>Add to Meal</button>
          <button onClick={onClose} style={{flex: 1, padding: '10px', cursor: 'pointer', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px'}}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function ClientInfoBanner({ client }) {
  const styles = { container: { backgroundColor: '#e0e0e0', padding: '15px', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, button: { backgroundColor: '#f0f0f0', border: '1px solid #999', padding: '5px 10px', cursor: 'pointer', marginLeft: '10px' } };
  // Add local state for date and duration
  const [selectedDate, setSelectedDate] = useState('');
  const [durationDays, setDurationDays] = useState(7);

  return (
    <div style={styles.container}>
      <div>
        <h3>Client: <span style={{color: 'purple'}}>{client.name}</span></h3>
        <p>Start Date: {client.startDate} | Plan Duration: {client.planDuration}</p>
        <p>Goal: <span style={{fontWeight: 'bold', color: 'purple'}}>{client.goal}</span></p>
        {/* Show selected values (optional) */}
        {selectedDate && <p>Selected Date: <strong>{selectedDate}</strong> | Duration: <strong>{durationDays} days</strong></p>}
      </div>
      <div>
        <button style={styles.button}>View Medical Report</button>
        <button style={styles.button}>View Body Measurements</button>
      </div>
      <div>
        {/* Date selection menu */}
        <label style={{display:'block', fontSize:'0.9em', marginBottom:'4px'}}>Select Date:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{padding:'6px', border:'1px solid #999', borderRadius:'4px'}}
        />
        {/* Simple duration dropdown */}
        <label style={{display:'block', fontSize:'0.9em', marginTop:'10px', marginBottom:'4px'}}>Plan Duration (days):</label>
        <select
          value={durationDays}
          onChange={(e) => setDurationDays(Number(e.target.value))}
          style={{padding:'6px', border:'1px solid #999', borderRadius:'4px'}}
        >
          {/* also take input from user */}
          <option value={3}>3</option>
          <option value={7}>7</option>
          <option value={14}>14</option>
          <option value={30}>30</option>
        </select>
      </div>
    </div>
  );
}

// === UPDATED MEAL CARD WITH RADIO/LOCK LOGIC ===
function MealCard({ meal, onOpenAddModal, onDeleteItem, onToggleItem }) {
  // 1. Calculate Totals
  let mealCals = 0, mealPro = 0, mealCarbs = 0, mealFat = 0;
  meal.items.forEach(item => {
    mealCals += item.calories;
    mealPro += item.protein;
    mealCarbs += item.carbs;
    mealFat += item.fat;
  });

  // 2. Logic: If ALL items are strict (red), the whole meal is strict (red).
  // If at least one item is green (allowChange: true) OR there are no items, it's green.
  const isMealStrict = meal.items.length > 0 && meal.items.every(item => !item.allowChange);
  
  // 3. Define the styles based on this logic
  const headerColor = isMealStrict ? '#d32f2f' : '#2e7d32'; // Red vs Green
  const statusMessage = isMealStrict 
    ? "⚠️ Client will not be able to change the meal" 
    : "ℹ️ Client can change a green meal item";
  const statusColor = isMealStrict ? '#ffebee' : '#e8f5e9'; // Background color for message

  const styles = {
    card: { border: '1px solid #ccc', borderRadius: '8px', padding: '15px', marginBottom: '15px', backgroundColor: '#f9f9f9', boxShadow: '2px 2px 5px rgba(0,0,0,0.1)' },
    header: { marginBottom: '10px', borderBottom: '1px solid #ddd', paddingBottom: '5px', display: 'flex', alignItems: 'center', gap: '10px' },
    contentGrid: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' },
    itemRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px dotted #ccc' },
    addButton: { color: 'blue', cursor: 'pointer', marginTop: '10px', display: 'inline-block', fontWeight: 'bold' },
    summaryBox: { backgroundColor: '#e8e8e8', padding: '15px', borderRadius: '8px', fontSize: '0.9em', border: '1px solid #d0d0d0', height: 'fit-content' },
    
    // Status Indicator Circle (Header)
    headerIndicator: {
      width: '20px', height: '20px', borderRadius: '50%',
      backgroundColor: headerColor,
      border: '2px solid white', boxShadow: '0 0 3px rgba(0,0,0,0.3)',
      display: 'inline-block'
    },
    
    // Item Toggle Button (The "Radio Button")
    itemToggle: {
      cursor: 'pointer', marginRight: '10px', fontSize: '1.2em', userSelect: 'none'
    },
    
    // Footer Message
    footerMessage: {
      gridColumn: '2 / 3', marginTop: '10px', padding: '8px', 
      borderRadius: '4px', backgroundColor: statusColor, color: headerColor,
      fontSize: '0.9em', textAlign: 'center', fontStyle: 'italic', border: `1px solid ${headerColor}`
    }
  };

  return (
    <div style={styles.card}>
      {/* HEADER: Shows the Meal Title and the "Master Status" Light */}
      <div style={styles.header}>
        <div style={styles.headerIndicator} title={isMealStrict ? "Meal is Locked" : "Meal is Flexible"}></div>
        <strong>{meal.title} ({meal.time})</strong>
      </div>
      
      <div style={styles.contentGrid}>
        {/* Left Side: Food List */}
        <div>
          {meal.items.length === 0 ? <div style={{color:'#999', fontStyle:'italic'}}>No items yet</div> : null}
          
          {meal.items.map((item, index) => (
            <div key={index} style={styles.itemRow}>
              <div style={{display: 'flex', alignItems: 'center'}}>
                {/* THE RADIO BUTTON / TOGGLE */}
                <span 
                  style={styles.itemToggle} 
                  onClick={() => onToggleItem(meal.id, index)}
                  title="Click to toggle: Green = Changeable, Red = Strict"
                >
                  {item.allowChange ? '🟢' : '🔴'}
                </span>
                
                <span>{item.amount}g {item.name}</span>
              </div>
              
              <button
                onClick={() => onDeleteItem(meal.id, index)}
                style={{color: '#845252ff', border:'1px solid red', background:'none', cursor:'pointer', fontSize:'0.8em'}}
              >
                Remove 🗑️
              </button>
            </div>
          ))}
          <div style={styles.addButton} onClick={() => onOpenAddModal(meal.id)}>[ + Add Meal Item ]</div>
        </div>

        {/* Right Side: Meal Specific Totals */}
        <div style={styles.summaryBox}>
          <div style={{fontWeight:'bold', marginBottom:'5px', borderBottom:'1px solid #bbb', paddingBottom:'5px'}}>Meal Total:</div>
          <div>🔥 {Math.round(mealCals)} kcal</div>
          <div style={{marginTop:'5px', color:'#444'}}>Protein: {Math.round(mealPro)}g</div>
          <div style={{color:'#444'}}>Carbs: {Math.round(mealCarbs)}g</div>
          <div style={{color:'#444'}}>Fat: {Math.round(mealFat)}g</div>
        </div>

        {/* Footer: Dynamic Message based on Logic */}
        <div style={styles.footerMessage}>
          {statusMessage}
        </div>
      </div>
    </div>
  );
}

function GlobalNutritionSummary({ meals }) {
  let totalCals = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;
  meals.forEach(meal => {
    meal.items.forEach(item => {
      totalCals += item.calories;
      totalProtein += item.protein;
      totalCarbs += item.carbs;
      totalFat += item.fat;
    });
  });

  const styles = { container: { backgroundColor: '#333', color: '#fff', padding: '20px', borderRadius: '8px', height: 'fit-content', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' } };

  return (
    <div style={styles.container}>
      <h2 style={{marginTop:0, borderBottom:'1px solid #555', paddingBottom:'10px'}}>Daily Totals</h2>
      <p style={{fontSize:'1.2em'}}><strong>Total Calories:</strong> {Math.round(totalCals)} kcal</p>
      <p><strong>Protein:</strong> {Math.round(totalProtein)} g</p>
      <p><strong>Carbs:</strong> {Math.round(totalCarbs)} g</p>
      <p><strong>Fat:</strong> {Math.round(totalFat)} g</p>
    </div>
  );
}

export default function App() {
  const [meals, setMeals] = useState(INITIAL_MEALS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMealId, setActiveMealId] = useState(null); 

  const handleOpenModal = (mealId) => { setActiveMealId(mealId); setIsModalOpen(true); };
  const handleCloseModal = () => { setIsModalOpen(false); setActiveMealId(null); };

  const handleDeleteItem = (mealId, itemIndex) => {
    setMeals(prevMeals => prevMeals.map(meal => {
      if (meal.id === mealId) {
        const newItems = [...meal.items];
        newItems.splice(itemIndex, 1);
        return { ...meal, items: newItems };
      }
      return meal;
    }));
  };

  // Logic to toggle Green/Red status for a specific item
  const handleToggleItem = (mealId, itemIndex) => {
    setMeals(prevMeals => prevMeals.map(meal => {
      if (meal.id === mealId) {
        const newItems = [...meal.items];
        // Flip the boolean value: true -> false, false -> true
        newItems[itemIndex] = {
          ...newItems[itemIndex],
          allowChange: !newItems[itemIndex].allowChange
        };
        return { ...meal, items: newItems };
      }
      return meal;
    }));
  };

  const handleAddFood = (foodItem, grams) => {
    const ratio = grams / 100;
    const newItem = {
      name: foodItem.name,
      amount: grams,
      calories: foodItem.calories * ratio,
      protein: foodItem.protein * ratio,
      carbs: foodItem.carbs * ratio,
      fat: foodItem.fat * ratio,
      allowChange: true // Default is Green (Changeable)
    };
    setMeals(prevMeals => prevMeals.map(meal => {
      if (meal.id === activeMealId) return { ...meal, items: [...meal.items, newItem] };
      return meal;
    }));
  };

  const styles = {
    layout: { display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '20px', padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1300px', margin: '0 auto' },
    header: { gridColumn: '1 / -1' },
    mainColumn: { display: 'flex', flexDirection: 'column', gap: '20px' },
    sidebar: { display: 'flex', flexDirection: 'column', gap: '20px' }
  };

  return (
    <div style={styles.layout}>
      <div style={styles.header}>
        <h1>Dietitian's Assistant - Prototype</h1>
        <ClientInfoBanner client={MOCK_CLIENT} />
      </div>

      <div style={styles.mainColumn}>
        {meals.map(meal => (
          <MealCard 
            key={meal.id} 
            meal={meal} 
            onOpenAddModal={handleOpenModal} 
            onDeleteItem={handleDeleteItem}
            onToggleItem={handleToggleItem} // Pass the toggle function down
          />
        ))}
        <button style={{padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', alignSelf: 'flex-start'}}>+ Add New Meal Time</button>
      </div>

      <div style={styles.sidebar}>
        <GlobalNutritionSummary meals={meals} />
        
        <div style={{padding: '15px', backgroundColor: '#fff3cd', border: '1px solid #ffeeba', borderRadius: '8px'}}>
          <strong>⚠️ Warnings / History:</strong>
          <p style={{fontSize: '0.9em', margin: '5px 0'}}>Client changed banana with pomegranate 2 times.</p>
        </div>

        <button style={{width: '100%', padding: '15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}}>
          Create Plan (Save)
        </button>
      </div>

      <AddMealModal isOpen={isModalOpen} onClose={handleCloseModal} onAdd={handleAddFood} />
    </div>
  );
}