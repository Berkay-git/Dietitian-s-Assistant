import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// --- 1. DATABASE & MOCK DATA ---
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
  planDuration: "7 days",
  medicalReport: "No significant issues recorded.",
  weight: "70",
  height: "175",
  bodyfat: "18"
};

const INITIAL_MEALS = [
  { id: 1, title: "Breakfast", time: "08:00 - 10:00", items: [{ name: "Oatmeal", amount: 120, calories: 81, protein: 3, carbs: 14, fat: 2, allowChange: true }] },
  { id: 2, title: "Lunch", time: "12:30 - 13:30", items: [] }
];

// --- 2. INFO POPUP ---
function InfoModal({ isOpen, onClose, title, content, type }) {
  if (!isOpen) return null;

  const styles = {
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 },
    modal: { backgroundColor: 'white', padding: '30px', borderRadius: '15px', width: '400px', boxShadow: '0 10px 40px rgba(0,0,0,0.25)', textAlign: 'center' },
    title: { margin: '0 0 15px 0', color: type === 'medical' ? '#d32f2f' : '#007AFF', fontSize: '22px' },
    contentBox: { backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '10px', border: '1px solid #eee', color: '#555', fontSize: '16px', lineHeight: '1.5', marginBottom: '20px' },
    closeButton: { padding: '10px 25px', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3 style={styles.title}>{title}</h3>
        <div style={styles.contentBox}>{content}</div>
        <button style={styles.closeButton} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

// --- 3. ADD MEAL MODAL ---
function AddMealModal({ isOpen, onClose, onAdd }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const [grams, setGrams] = useState(100);

  if (!isOpen) return null;

  const filteredFoods = FOOD_DATABASE.filter(food => food.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSave = () => {
    if (selectedFood) {
      onAdd(selectedFood, grams);
      setSearchTerm(''); setSelectedFood(null); setGrams(100); onClose();
    }
  };

  const styles = {
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modal: { backgroundColor: 'white', padding: '30px', borderRadius: '15px', width: '450px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow:'0 10px 40px rgba(0,0,0,0.2)' },
    list: { border: '1px solid #eee', maxHeight: '200px', overflowY: 'auto', borderRadius: '8px', backgroundColor:'#f9f9f9' },
    listItem: { padding: '12px', cursor: 'pointer', borderBottom: '1px solid #eee', display:'flex', justifyContent:'space-between', alignItems:'center' },
    selectedItem: { backgroundColor: '#e3f2fd', fontWeight: 'bold', color:'#007AFF' },
    input: { padding: '12px', width: '100%', boxSizing: 'border-box', borderRadius:'8px', border:'1px solid #ddd', fontSize:'16px', outline:'none' }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3 style={{margin:0, color:'#333', fontSize:'22px'}}>Add Food Item</h3>
        <input type="text" placeholder="Search food (e.g. apple)..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={styles.input} autoFocus />
        
        <div style={styles.list}>
          {filteredFoods.length === 0 ? <div style={{padding:'15px', color:'#999', textAlign:'center'}}>No items found</div> : filteredFoods.map(food => (
            <div key={food.id} style={{ ...styles.listItem, ...(selectedFood?.id === food.id ? styles.selectedItem : {}) }} onClick={() => setSelectedFood(food)}>
              <span>{food.name}</span>
              <span style={{ fontSize: '0.9em', color: selectedFood?.id === food.id ? '#007AFF' : '#999' }}>{food.calories} kcal/100g</span>
            </div>
          ))}
        </div>

        {selectedFood && (
            <div style={{ backgroundColor: '#f0f0f0', padding: '15px', borderRadius: '8px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div>
                    <strong style={{display:'block', color:'#333'}}>{selectedFood.name}</strong>
                    <span style={{fontSize:'0.8em', color:'#666'}}>Calculated: {Math.round((grams/100) * selectedFood.calories)} kcal</span>
                </div>
                <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
                    <input type="number" value={grams} onChange={(e) => setGrams(Number(e.target.value))} style={{ width: '60px', padding: '8px', borderRadius:'5px', border:'1px solid #ddd', outline:'none', textAlign:'center' }} />
                    <span style={{fontSize:'0.9em', color:'#555'}}>g</span>
                </div>
            </div>
        )}
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleSave} disabled={!selectedFood} style={{ flex: 2, padding: '12px', backgroundColor: selectedFood ? '#28a745' : '#ccc', color: 'white', border:'none', borderRadius:'8px', fontWeight:'bold', cursor: selectedFood ? 'pointer' : 'default', fontSize:'16px' }}>Add to Meal</button>
          <button onClick={onClose} style={{ flex: 1, padding: '12px', backgroundColor: '#dc3545', color: 'white', border:'none', borderRadius:'8px', fontWeight:'bold', cursor:'pointer', fontSize:'16px' }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// --- 4. CLIENT INFO BANNER ---
function ClientInfoBanner({ client }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [durationDays, setDurationDays] = useState(7);
  const [modalType, setModalType] = useState(null);

  const renderModalContent = () => {
    if (modalType === 'medical') return <InfoModal isOpen={true} onClose={() => setModalType(null)} title="⚠️ Medical Report" type="medical" content={client.medicalReport || "No medical issues reported."} />;
    if (modalType === 'body') return <InfoModal isOpen={true} onClose={() => setModalType(null)} title="📏 Body Measurements" type="body" content={<div style={{textAlign:'left'}}><p><strong>Weight:</strong> {client.weight || '-'} kg</p><p><strong>Height:</strong> {client.height || '-'} cm</p><p><strong>Body Fat:</strong> %{client.bodyfat || '-'}</p></div>} />;
    return null;
  };

  const styles = { 
      container: { backgroundColor: 'white', padding: '25px', borderRadius: '15px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' },
      infoGroup: { display:'flex', flexDirection:'column', gap:'5px' },
      buttonGroup: { display:'flex', gap:'10px', marginTop:'10px' },
      infoButton: { padding:'8px 12px', backgroundColor:'#f0f0f0', border:'1px solid #ddd', borderRadius:'8px', cursor:'pointer', fontSize:'13px', fontWeight:'bold', color:'#555', transition:'0.2s' },
      selectInput: { padding:'8px', border:'1px solid #ddd', borderRadius:'8px', color:'#555', outline:'none' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.infoGroup}>
        <h2 style={{margin:0, color: '#333'}}>Diet Plan for <span style={{color: '#007AFF'}}>{client.name}</span></h2>
        <p style={{margin:0, color:'#666'}}>Goal: <strong>{client.goal || MOCK_CLIENT.goal}</strong></p>
        <div style={styles.buttonGroup}>
            <button style={styles.infoButton} onClick={() => setModalType('medical')}>View Medical Report</button>
            <button style={styles.infoButton} onClick={() => setModalType('body')}>View Body Measurements</button>
        </div>
      </div>
      <div style={{display:'flex', gap:'15px', alignItems:'flex-end'}}>
        <div><label style={{fontSize:'0.85em', color:'#888', display:'block', marginBottom:'3px'}}>Start Date</label><input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} style={styles.selectInput} /></div>
        <div><label style={{fontSize:'0.85em', color:'#888', display:'block', marginBottom:'3px'}}>Duration</label><select value={durationDays} onChange={(e) => setDurationDays(Number(e.target.value))} style={styles.selectInput}><option value={7}>7 Days</option><option value={14}>14 Days</option><option value={30}>30 Days</option></select></div>
      </div>
      {renderModalContent()}
    </div>
  );
}

// --- 5. MEAL CARD ( EDIT HEADER + DELETE MEAL) ---
function MealCard({ meal, onOpenAddModal, onDeleteItem, onToggleItem, onDeleteMeal, onUpdateHeader }) {
  // STATE Düzenleme Modu
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(meal.title);
  const [tempTime, setTempTime] = useState(meal.time);

  let mealCals = 0, mealPro = 0, mealCarbs = 0, mealFat = 0;
  meal.items.forEach(item => {
    mealCals += item.calories; mealPro += item.protein; mealCarbs += item.carbs; mealFat += item.fat;
  });

  const isMealStrict = meal.items.length > 0 && meal.items.every(item => !item.allowChange);
  const headerColor = isMealStrict ? '#d32f2f' : '#2e7d32'; 
  const statusMessage = isMealStrict ? "⚠️ Client will not be able to change the meal" : "ℹ️ Client can change a green meal item";
  const statusBg = isMealStrict ? '#ffebee' : '#e8f5e9';
  const statusText = isMealStrict ? '#c62828' : '#2e7d32';

  const handleSaveHeader = () => {
      onUpdateHeader(meal.id, tempTitle, tempTime);
      setIsEditing(false);
  };

  const styles = {
    card: { border: '1px solid #eee', borderRadius: '15px', padding: '25px', marginBottom: '25px', backgroundColor: 'white', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', position: 'relative' },
    header: { marginBottom: '20px', borderBottom: '2px solid #f5f5f5', paddingBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    headerLeft: { display: 'flex', alignItems: 'center', gap: '12px', flex: 1 },
    headerIndicator: { width: '18px', height: '18px', borderRadius: '50%', backgroundColor: headerColor, boxShadow: '0 0 8px rgba(0,0,0,0.2)' },
    itemToggle: { cursor: 'pointer', marginRight: '15px', fontSize: '1.2em', userSelect: 'none' },
    itemRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px dashed #eee', fontSize:'16px' },
    summaryBox: { backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '10px', fontSize: '0.9em', marginTop:'20px', display:'flex', justifyContent:'space-between', alignItems:'center' },
    footerMessage: { marginTop: '15px', padding: '10px', borderRadius: '8px', backgroundColor: statusBg, color: statusText, fontSize: '0.9em', fontWeight:'bold', textAlign:'center' },
    
    // BUTONLAR
    actionBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#999', transition: '0.2s', padding:'5px' },
    editInput: { padding:'5px', borderRadius:'5px', border:'1px solid #ddd', fontSize:'14px', outline:'none' }
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
            <div style={styles.headerIndicator}></div>
            
            {isEditing ? (
                // DÜZENLEME MODU
                <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                    <input style={styles.editInput} value={tempTitle} onChange={e => setTempTitle(e.target.value)} placeholder="Meal Name" />
                    <input style={styles.editInput} value={tempTime} onChange={e => setTempTime(e.target.value)} placeholder="Time (e.g. 08:00 - 09:00)" />
                    <button style={{...styles.actionBtn, color:'#28a745'}} onClick={handleSaveHeader}>💾</button>
                </div>
            ) : (
                // GÖRÜNTÜLEME MODU
                <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                    <strong style={{fontSize:'20px', color:'#333'}}>{meal.title}</strong>
                    <span style={{color:'#999', fontSize:'0.9em', fontWeight:'normal'}}>({meal.time})</span>
                    <button style={styles.actionBtn} onClick={() => setIsEditing(true)} title="Edit Name & Time">✏️</button>
                </div>
            )}
        </div>
        
        {/* ÖĞÜN SİLME BUTONU */}
        <button style={styles.actionBtn} onClick={() => onDeleteMeal(meal.id)} title="Delete Meal">🗑️</button>
      </div>
      
      <div>
        {meal.items.map((item, index) => (
          <div key={index} style={styles.itemRow}>
            <div style={{display: 'flex', alignItems: 'center'}}>
              <span style={styles.itemToggle} onClick={() => onToggleItem(meal.id, index)} title="Toggle Strict/Flexible">
                {item.allowChange ? '🟢' : '🔴'}
              </span>
              <span><strong>{item.amount}g</strong> {item.name}</span>
            </div>
            <button onClick={() => onDeleteItem(meal.id, index)} style={{color: '#dc3545', border:'1px solid #f8d7da', backgroundColor:'white', cursor:'pointer', padding:'5px 12px', borderRadius:'6px', fontSize:'12px', fontWeight:'bold'}}>Remove</button>
          </div>
        ))}
        
        <div 
            style={{color: '#007AFF', cursor: 'pointer', marginTop: '15px', fontWeight: 'bold', padding:'12px', backgroundColor:'#f0f7ff', borderRadius:'8px', textAlign:'center', border:'1px dashed #007AFF'}} 
            onClick={() => onOpenAddModal(meal.id)}
        >
            + Add Item to {meal.title}
        </div>
      </div>

      <div style={styles.summaryBox}>
          <div><strong>Total:</strong> {Math.round(mealCals)} kcal</div>
          <div style={{display:'flex', gap:'15px', color:'#666'}}>
              <span>P: {Math.round(mealPro)}g</span>
              <span>C: {Math.round(mealCarbs)}g</span>
              <span>F: {Math.round(mealFat)}g</span>
          </div>
      </div>
      <div style={styles.footerMessage}>{statusMessage}</div>
    </div>
  );
}

// --- 6. GLOBAL SUMMARY ---
function GlobalNutritionSummary({ meals }) {
  let totalCals = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;
  meals.forEach(meal => {
    meal.items.forEach(item => {
      totalCals += item.calories; totalProtein += item.protein; totalCarbs += item.carbs; totalFat += item.fat;
    });
  });

  const styles = { container: { backgroundColor: '#333', color: '#fff', padding: '30px', borderRadius: '15px', boxShadow: '0 8px 25px rgba(0,0,0,0.2)' } };

  return (
    <div style={styles.container}>
      <h3 style={{marginTop:0, borderBottom:'1px solid #555', paddingBottom:'15px', fontSize:'20px', color:'#eee'}}>Daily Targets</h3>
      <div style={{marginBottom:'20px'}}>
        <div style={{fontSize:'14px', color:'#aaa', marginBottom:'5px'}}>TOTAL CALORIES</div>
        <div style={{fontSize:'32px', fontWeight:'bold', color:'#4CAF50'}}>{Math.round(totalCals)} kcal</div>
      </div>
      <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
          <div style={{display:'flex', justifyContent:'space-between', borderBottom:'1px solid #444', paddingBottom:'5px'}}><span style={{color:'#ddd'}}>Protein</span> <strong>{Math.round(totalProtein)}g</strong></div>
          <div style={{display:'flex', justifyContent:'space-between', borderBottom:'1px solid #444', paddingBottom:'5px'}}><span style={{color:'#ddd'}}>Carbs</span> <strong>{Math.round(totalCarbs)}g</strong></div>
          <div style={{display:'flex', justifyContent:'space-between', borderBottom:'1px solid #444', paddingBottom:'5px'}}><span style={{color:'#ddd'}}>Fat</span> <strong>{Math.round(totalFat)}g</strong></div>
      </div>
    </div>
  );
}

// === MAIN COMPONENT ===
export default function MealPlanner() {
  const navigate = useNavigate();
  const location = useLocation();
  const client = location.state || MOCK_CLIENT;

  const [meals, setMeals] = useState(INITIAL_MEALS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMealId, setActiveMealId] = useState(null);

  const handleOpenModal = (mealId) => { setActiveMealId(mealId); setIsModalOpen(true); };
  const handleCloseModal = () => { setIsModalOpen(false); setActiveMealId(null); };

  // ÖĞÜN EKLEME
  const handleAddMeal = () => {
    const newMeal = {
        id: Date.now(),
        title: "New Meal",
        time: "00:00 - 00:00",
        items: []
    };
    setMeals([...meals, newMeal]);
  };

  // ÖĞÜN SİLME
  const handleDeleteMeal = (mealId) => {
    if (window.confirm("Are you sure you want to delete this meal?")) {
        setMeals(meals.filter(meal => meal.id !== mealId));
    }
  };

  // ÖĞÜN BAŞLIĞI VE SAATİ GÜNCELLEME
  const handleUpdateHeader = (mealId, newTitle, newTime) => {
      setMeals(prevMeals => prevMeals.map(meal => {
          if (meal.id === mealId) {
              return { ...meal, title: newTitle, time: newTime };
          }
          return meal;
      }));
  };

  const handleDeleteItem = (mealId, itemIndex) => {
    setMeals(prevMeals => prevMeals.map(meal => {
      if (meal.id === mealId) {
        const newItems = [...meal.items]; newItems.splice(itemIndex, 1); return { ...meal, items: newItems };
      } return meal;
    }));
  };

  const handleToggleItem = (mealId, itemIndex) => {
    setMeals(prevMeals => prevMeals.map(meal => {
      if (meal.id === mealId) {
        const newItems = [...meal.items]; newItems[itemIndex] = { ...newItems[itemIndex], allowChange: !newItems[itemIndex].allowChange }; return { ...meal, items: newItems };
      } return meal;
    }));
  };

  const handleAddFood = (foodItem, grams) => {
    const ratio = grams / 100;
    const newItem = { name: foodItem.name, amount: grams, calories: foodItem.calories * ratio, protein: foodItem.protein * ratio, carbs: foodItem.carbs * ratio, fat: foodItem.fat * ratio, allowChange: true };
    setMeals(prevMeals => prevMeals.map(meal => {
      if (meal.id === activeMealId) return { ...meal, items: [...meal.items, newItem] }; return meal;
    }));
  };

  const handleSavePlan = () => { alert(`Diet plan for ${client.name} saved successfully!`); };

  const styles = {
    mainContainer: { padding: '40px 20px', backgroundColor: '#f5f5f5', minHeight: '100vh', fontFamily: 'Arial, sans-serif', display: 'flex', justifyContent: 'center' },
    contentContainer: { maxWidth: '1200px', width: '100%' },
    headerRow: { display:'flex', alignItems:'center', marginBottom:'20px' },
    backButton: { padding: '10px 15px', backgroundColor: 'transparent', color: '#666', border: 'none', cursor: 'pointer', fontWeight:'bold', fontSize:'16px', display:'flex', alignItems:'center', gap:'5px' },
    layoutGrid: { display:'grid', gridTemplateColumns: '7fr 3fr', gap:'30px', alignItems:'start' },
    saveButton: { width: '100%', padding: '18px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '12px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)', marginTop:'20px', transition:'transform 0.2s' }
  };

  return (
    <div style={styles.mainContainer}>
      <div style={styles.contentContainer}>
        <div style={styles.headerRow}>
            <button style={styles.backButton} onClick={() => navigate(-1)}><span>←</span> Back to Profile</button>
        </div>
        <ClientInfoBanner client={client} />
        <div style={styles.layoutGrid}>
            <div>
                {meals.map(meal => (
                <MealCard 
                    key={meal.id} 
                    meal={meal} 
                    onOpenAddModal={handleOpenModal} 
                    onDeleteItem={handleDeleteItem} 
                    onToggleItem={handleToggleItem}
                    onDeleteMeal={handleDeleteMeal}
                    onUpdateHeader={handleUpdateHeader}
                />
                ))}
                 <button 
                    style={{padding: '20px', backgroundColor: '#e9ecef', color: '#555', border: '2px dashed #ccc', borderRadius: '15px', cursor: 'pointer', width:'100%', fontWeight:'bold', fontSize:'16px', transition:'0.3s'}}
                    onClick={handleAddMeal}
                 >
                    + Add New Meal Time
                 </button>
            </div>
            <div>
                <GlobalNutritionSummary meals={meals} />
                <div style={{padding: '20px', backgroundColor: '#fff3cd', border: '1px solid #ffeeba', borderRadius: '15px', marginTop:'20px'}}>
                  <strong style={{color:'#856404', display:'block', marginBottom:'5px'}}>⚠️ Client History</strong>
                  <p style={{fontSize: '0.95em', margin: 0, color:'#856404', lineHeight:'1.4'}}>Client previously requested to change bananas with pomegranate. Keep an eye on fruit selection.</p>
                </div>
                <button style={styles.saveButton} onClick={handleSavePlan}>Save Plan ✓</button>
            </div>
        </div>
      </div>
      <AddMealModal isOpen={isModalOpen} onClose={handleCloseModal} onAdd={handleAddFood} />
    </div>
  );
}