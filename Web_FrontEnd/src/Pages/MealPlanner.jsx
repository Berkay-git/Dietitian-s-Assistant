import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const INITIAL_MEALS = [
  {
    id: 1,
    title: "Breakfast",
    time: "08:00 - 10:00",
    items: []
  },
  {
    id: 2,
    title: "Lunch",
    time: "12:30 - 13:30",
    items: []
  }
];

// --- HELPER COMPONENTS ---

const getMinutesFromTime = (timeStr) => {
  if (!timeStr || timeStr === "Flexible") return 9999; 
  try {
    const startPart = timeStr.split('-')[0].trim(); 
    const [hours, minutes] = startPart.split(':').map(Number);
    return (hours * 60) + minutes;
  } catch (e) { return 9999; }
};

function InfoModal({ isOpen, onClose, title, content, type }) {
  if (!isOpen) return null;
  const styles = {
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 },
    modal: { backgroundColor: 'white', padding: '25px', borderRadius: '12px', width: '350px', maxWidth: '90%', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', position: 'relative' },
    header: { marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    title: { margin: 0, fontSize: '18px', color: type === 'medical' ? '#d32f2f' : '#007AFF' },
    closeBtn: { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#999' },
    content: { fontSize: '16px', lineHeight: '1.5', color: '#333' }
  };
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h3 style={styles.title}>{title}</h3>
          <button style={styles.closeBtn} onClick={onClose}>&times;</button>
        </div>
        <div style={styles.content}>{content}</div>
      </div>
    </div>
  );
}

function AddMealModal({ isOpen, onClose, onAdd }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const [grams, setGrams] = useState(100); 
  const [dbItems, setDbItems] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/dietitian/items');
        const data = await response.json();

        if (response.ok) {
          // 3. MAP: Convert Backend Keys (ItemName) -> Frontend Keys (name)
          // This ensures your UI doesn't break!
          const mappedItems = data.map(item => ({
            id: item.ItemID,
            name: item.ItemName,
            calories: item.ItemCalories,
            protein: item.ItemProtein,
            carbs: item.ItemCarb,
            fat: item.ItemFat,
            amount: 100,     // Default value for UI
            unit: 'g'        // Default unit
          }));
          
          setDbItems(mappedItems);
        }
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    fetchItems();
  }, []);

  if (!isOpen) return null;
  const filteredFoods = dbItems.filter(food => food.name.toLowerCase().includes(searchTerm.toLowerCase()));

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
        <input type="text" placeholder="Search food..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={styles.input} autoFocus />
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

function ClientInfoBanner({ client, selectedDate, setSelectedDate, durationDays, setDurationDays }) {
  const [modalType, setModalType] = useState(null); 
  const renderModalContent = () => {
    if (modalType === 'medical') return <InfoModal isOpen={true} onClose={() => setModalType(null)} title="⚠️ Medical Report" type="medical" content={<div><p style={{fontWeight: 'bold'}}>{client.medicalReport}</p></div>} />;
    if (modalType === 'body') return <InfoModal isOpen={true} onClose={() => setModalType(null)} title="📏 Body Details" type="body" content={<div> <p>DOB: {client.dob}</p><p>Gender: {client.gender}</p><p>Weight: {client.weight}</p><p>Height: {client.height}</p><p>Body Fat: %{client.bodyfat}</p><p>Activity: {client.activity}</p></div>} />;
    return null;
  };
  const styles = { 
    container: { backgroundColor: '#e0e0e0', padding: '20px', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }, 
    buttonGroup: { display: 'flex', gap: '10px', marginTop:'5px' }, 
    button: { backgroundColor: '#f8f9fa', border: '1px solid #ccc', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' } 
  };
  return (
    <div style={styles.container}>
      <div>
        <h2 style={{marginTop: 0, marginBottom: '5px', color: '#333'}}>Client: <span style={{color: 'purple'}}>{client.name}</span></h2>
        <div style={{fontSize: '0.9em', color: '#444', marginBottom: '8px', justifyContent:'center', alignSelf:'center'}}>Start Date: <strong>{selectedDate}</strong> | Plan Duration: <strong>{durationDays} days</strong></div>
        <p style={{margin: '0', fontSize:'1.1em'}}>Goal: <span style={{fontWeight: 'bold', color: 'purple'}}>{client.goal}</span></p>
      </div>
      <div style={{display:'flex', flexDirection:'row', alignItems:'center', justifyContent:'center', alignSelf:'center'}}>
          <div style={styles.buttonGroup}>
            <button style={styles.button} onClick={() => setModalType('medical')}>View Medical Report</button>
            <button style={styles.button} onClick={() => setModalType('body')}>View Body Measurements</button>
          </div>
      </div>  
      <div style={{textAlign:'right'}}>
        <label style={{display:'block', fontSize:'0.8em', marginBottom:'4px', color:'#666'}}>Select Date:</label>
        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} style={{padding:'6px', border:'1px solid #999', borderRadius:'4px', marginBottom:'10px'}} />
        <br />
        <label style={{display:'block', fontSize:'0.8em', marginBottom:'4px', color:'#666'}}>Plan Duration (days):</label>
        <select value={durationDays} onChange={(e) => setDurationDays(Number(e.target.value))} style={{padding:'6px', border:'1px solid #999', borderRadius:'4px', width:'100%'}}>
          <option value={1}>1</option>
          <option value={7}>7</option>
          <option value={14}>14</option>
          <option value={30}>30</option>
        </select>
      </div>
      {renderModalContent()}
    </div>
  );
}

function MealCard({ meal, onOpenAddModal, onDeleteItem, onToggleItem, onEditMeal, onDeleteMeal }) {
  let mealCals = 0, mealPro = 0, mealCarbs = 0, mealFat = 0;
  meal.items.forEach(item => { mealCals += item.calories; mealPro += item.protein; mealCarbs += item.carbs; mealFat += item.fat; });

  const hasItems = meal.items.length > 0;
  const allItemsStrict = hasItems && meal.items.every(item => !item.allowChange);
  const headerColor = allItemsStrict ? '#d32f2f' : '#2e7d32'; 
  const footerMessage = allItemsStrict ? "⚠️ Client will not be able to change the meal" : "ℹ️ Client can change a green meal item";
  const footerStyle = allItemsStrict ? { border: '1px solid #ef9a9a', backgroundColor: '#ffebee', color: '#c62828' } : { border: '1px solid #a5d6a7', backgroundColor: '#e8f5e9', color: '#2e7d32' };

  const [isEditing, setIsEditing] = useState(false);
  
  // FIX: Handle parsing DB time "08:00:00" -> "08:00" or Input "08:00"
  const splitTime = (meal.time || "").split('-').map(t => t.trim().substring(0, 5)); 
  
  const [titleDraft, setTitleDraft] = useState(meal.title);
  const [startTimeDraft, setStartTimeDraft] = useState(splitTime[0] || '');
  const [endTimeDraft, setEndTimeDraft] = useState(splitTime[1] || '');

  const styles = {
    card: { border: '1px solid #ccc', borderRadius: '8px', padding: '15px', marginBottom: '15px', backgroundColor: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
    header: { marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' },
    headerIndicator: { width: '16px', height: '16px', borderRadius: '50%', backgroundColor: headerColor },
    contentGrid: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' },
    itemRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px dotted #eee' },
    toggleBtn: { cursor: 'pointer', marginRight: '10px', fontSize: '1.2em' },
    addButton: { color: '#007bff', cursor: 'pointer', marginTop: '15px', display: 'inline-block', fontWeight: 'bold', fontSize:'0.9em' },
    summaryBox: { backgroundColor: '#eee', padding: '15px', borderRadius: '8px', fontSize: '0.9em', height: 'fit-content' },
    totalTitle: { fontWeight: 'bold', borderBottom:'1px solid #ccc', paddingBottom:'5px', marginBottom:'8px' },
    macroLine: { color: '#444', marginBottom: '4px' },
    footerBox: { gridColumn: '2 / 3', marginTop: '10px', padding: '10px', borderRadius: '4px', fontSize: '0.85em', textAlign: 'center', fontStyle:'italic', ...footerStyle }
  };

  const handleSaveEdit = () => {
    const newTitle = titleDraft.trim() || meal.title;
    const newTime = startTimeDraft && endTimeDraft ? `${startTimeDraft} - ${endTimeDraft}` : meal.time;
    onEditMeal(meal.id, { title: newTitle, time: newTime });
    setIsEditing(false);
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.headerIndicator} title={allItemsStrict ? "Strict" : "Flexible"}></div>
        {!isEditing ? (
          <>
            <strong style={{fontSize:'1.1em'}}>{meal.title} ({meal.time})</strong>
            <div style={{marginLeft:'auto', display:'flex', gap:'10px'}}>
                <button style={{padding:'4px 8px', fontSize:'0.8em', cursor:'pointer', border:'1px solid #ccc', borderRadius:'4px', background:'#f9f9f9'}} onClick={() => setIsEditing(true)}>Edit Time</button>
                <button style={{padding:'4px 8px', fontSize:'0.8em', cursor:'pointer', border:'1px solid #ffcdd2', borderRadius:'4px', background:'#ffebee', color:'#c62828'}} onClick={() => {if(window.confirm(`Delete ${meal.title}?`)) onDeleteMeal(meal.id);}}>Delete Meal 🗑️</button>
            </div>
          </>
        ) : (
          <div style={{display:'flex', gap:'5px', alignItems:'center'}}>
            <input value={titleDraft} onChange={(e) => setTitleDraft(e.target.value)} placeholder="Name" style={{width:'100px', padding:'4px'}} />
            <input type="time" value={startTimeDraft} onChange={(e) => setStartTimeDraft(e.target.value)} />
            <input type="time" value={endTimeDraft} onChange={(e) => setEndTimeDraft(e.target.value)} />
            <button onClick={handleSaveEdit} style={{background:'green', color:'white', border:'none', padding:'4px 8px', borderRadius:'4px', cursor:'pointer'}}>Save</button>
            <button onClick={() => setIsEditing(false)} style={{background:'#ccc', border:'none', padding:'4px 8px', borderRadius:'4px', cursor:'pointer'}}>Cancel</button>
          </div>
        )}
      </div>
      
      <div style={styles.contentGrid}>
        <div>
          {meal.items.map((item, index) => (
            <div key={index} style={styles.itemRow}>
               <div style={{display: 'flex', alignItems: 'center'}}>
                <span style={styles.toggleBtn} onClick={() => onToggleItem(meal.id, index)}>{item.allowChange ? '🟢' : '🔴'}</span>
                <span>{item.amount}g {item.name}</span>
              </div>
              <button onClick={() => onDeleteItem(meal.id, index)} style={{color: '#dc3545', border:'1px solid #dc3545', background:'white', borderRadius:'4px', padding:'2px 8px', cursor:'pointer', fontSize:'0.8em'}}>Remove 🗑️</button>
            </div>
          ))}
          <div style={styles.addButton} onClick={() => onOpenAddModal(meal.id)}>[ + Add Meal Item ]</div>
        </div>
        <div>
            <div style={styles.summaryBox}>
              <div style={styles.totalTitle}>Meal Total:</div>
              <div style={{color:'#d35400', fontWeight:'bold', marginBottom:'5px'}}>🔥 {Math.round(mealCals)} kcal</div>
              <div style={styles.macroLine}>Protein: {Math.round(mealPro)}g</div>
              <div style={styles.macroLine}>Carbs: {Math.round(mealCarbs)}g</div>
              <div style={styles.macroLine}>Fat: {Math.round(mealFat)}g</div>
            </div>
            {hasItems && <div style={styles.footerBox}>{footerMessage}</div>}
        </div>
      </div>
    </div>
  );
}

function GlobalNutritionSummary({ meals }) {
  let totalCals = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;
  meals.forEach(meal => { meal.items.forEach(item => { totalCals += item.calories; totalProtein += item.protein; totalCarbs += item.carbs; totalFat += item.fat; }); });
  const styles = { container: { backgroundColor: '#222', color: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }, header: { marginTop:0, borderBottom:'1px solid #555', paddingBottom:'10px', marginBottom:'15px' }, row: { marginBottom: '8px', fontSize: '1em' } }
  return (
    <div style={styles.container}>
      <h3 style={styles.header}>Daily Totals</h3>
      <p style={{fontSize:'1.2em', fontWeight:'bold', marginBottom:'15px'}}>Total Calories: {Math.round(totalCals)} kcal</p>
      <div style={styles.row}>Protein: {Math.round(totalProtein)} g</div>
      <div style={styles.row}>Carbs: {Math.round(totalCarbs)} g</div>
      <div style={styles.row}>Fat: {Math.round(totalFat)} g</div>
    </div>
  );
}

// === MAIN PAGE COMPONENT ===
export default function MealPlanner() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMealId, setActiveMealId] = useState(null); 
  const [durationDays, setDurationDays] = useState(7);
  const [isSaving, setIsSaving] = useState(false);

  // --- LOGIC INJECTION STARTS HERE ---
  const location = useLocation();
  const navigate = useNavigate();
  
  const clientData = location.state?.client || { name: 'Guest', goal: 'General Health' };
  const planToEdit = location.state?.planToEdit; // Check if we are editing

  // 1. Initialize Date based on Edit Mode
  const [selectedDate, setSelectedDate] = useState(() => {
     return planToEdit ? planToEdit.date : new Date().toISOString().split('T')[0];
  });

  // 2. Initialize Meals based on Edit Mode
  const [meals, setMeals] = useState(() => {
    if (planToEdit && planToEdit.meals) {
        return planToEdit.meals.map((m, index) => {
            // Fix DB time (08:00:00) to Input time (08:00)
            const cleanTime = (m.time || "").split('-').map(t => t.trim().substring(0,5)).join(' - ');
            return {
                id: Date.now() + index, // Generate temporary ID for React keys
                title: m.title,
                time: cleanTime,
                items: m.items.map(i => ({
                    name: i.name,
                    amount: i.amount,
                    calories: i.calories,
                    protein: i.protein,
                    carbs: i.carbs,
                    fat: i.fat,
                    allowChange: i.allowChange ?? true
                }))
            };
        });
    }
    return INITIAL_MEALS;
  });
  // --- LOGIC INJECTION ENDS ---

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

  const handleToggleItem = (mealId, itemIndex) => {
    setMeals(prevMeals => prevMeals.map(meal => {
      if (meal.id === mealId) {
        const newItems = [...meal.items];
        newItems[itemIndex] = { ...newItems[itemIndex], allowChange: !newItems[itemIndex].allowChange };
        return { ...meal, items: newItems };
      }
      return meal;
    }));
  };

  const handleDeleteMeal = (mealId) => { setMeals(prev => prev.filter(m => m.id !== mealId)); };

  const handleAddFood = (foodItem, grams) => {
    const ratio = grams / 100;
    const newItem = {
      name: foodItem.name,
      amount: grams,
      calories: foodItem.calories * ratio,
      protein: foodItem.protein * ratio,
      carbs: foodItem.carbs * ratio,
      fat: foodItem.fat * ratio,
      allowChange: true 
    };
    setMeals(prevMeals => prevMeals.map(meal => {
      if (meal.id === activeMealId) return { ...meal, items: [...meal.items, newItem] };
      return meal;
    }));
  };

  const handleEditMeal = (mealId, updates) => {
    setMeals(prev => prev.map(m => (m.id === mealId ? { ...m, title: updates.title ?? m.title, time: updates.time ?? m.time } : m)));
  };

  const handleAddNewMealTime = () => {
    const newId = meals.length > 0 ? Math.max(...meals.map(m => m.id)) + 1 : 1;
    setMeals([...meals, { id: newId, title: "New Meal", time: "12:00 - 13:00", items: [] }]);
  };

  const sortedMeals = [...meals].sort((a, b) => {
    return getMinutesFromTime(a.time) - getMinutesFromTime(b.time);
  });

  const handleSavePlan = async () => {
    if (!clientData.id) {
        alert("Error: No Client ID found. Please access this page from the Dashboard.");
        return;
    }
    setIsSaving(true);
    const payload = {
        client_id: clientData.id,
        date: selectedDate,
        meals: meals
    };

    try {
        const response = await fetch('http://localhost:5000/api/dietitian/meal-plans', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (response.ok) {
            alert(planToEdit ? "✅ Plan Updated Successfully!" : "✅ Plan Created Successfully!");
            navigate('/client-meals', { state: { client: clientData } });
        } else {
            alert("Failed to save plan: " + (data.error || "Unknown error"));
        }
    } catch (error) {
        console.error("Save error:", error);
        alert("Server error while saving.");
    } finally {
        setIsSaving(false);
    }
  };

  const styles = {
    layout: { display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '20px', padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1300px', margin: '0 auto' },
    header: { gridColumn: '1 / -1' },
    mainColumn: { display: 'flex', flexDirection: 'column', gap: '20px' },
    sidebar: { display: 'flex', flexDirection: 'column', gap: '20px' },
    backBar: { display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px' },
    backButton: { padding:'8px 15px', cursor:'pointer', border:'none', backgroundColor:'#6c757d', color:'white', borderRadius:'4px', fontWeight:'bold' },
    warningBox: { backgroundColor: '#fff3cd', border: '1px solid #ffeeba', borderRadius: '8px', padding: '15px', color: '#856404' }
  };

  return (
    <div style={styles.layout}>
      <div style={styles.header}>
         <div style={styles.backBar}>
           <button style={styles.backButton} onClick={() => navigate(-1)}>&larr; Back</button>
           <h2 style={{margin:0}}>Dietitian's Assistant - Prototype</h2>
        </div>
        <ClientInfoBanner client={clientData} selectedDate={selectedDate} setSelectedDate={setSelectedDate} durationDays={durationDays} setDurationDays={setDurationDays} />
      </div>

      <div style={styles.mainColumn}>
        {sortedMeals.map(meal => (
          <MealCard 
            key={meal.id} 
            meal={meal} 
            onOpenAddModal={handleOpenModal} 
            onDeleteItem={handleDeleteItem}
            onToggleItem={handleToggleItem}
            onEditMeal={handleEditMeal}
            onDeleteMeal={handleDeleteMeal}
          />
        ))}
        <button style={{padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', alignSelf: 'flex-start'}} onClick={handleAddNewMealTime}>
            + Add New Meal Time
        </button>
      </div>

      <div style={styles.sidebar}>
         <GlobalNutritionSummary meals={meals} />
         <div style={styles.warningBox}><strong>⚠️ Warnings / History:</strong><p style={{fontSize: '0.9em', marginTop: '5px'}}>Client changed banana with pomegranate 2 times.</p></div>
         <button onClick={handleSavePlan} disabled={isSaving} style={{width: '100%', padding: '15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}}>
          {isSaving ? 'Saving...' : (planToEdit ? 'Update Plan' : 'Create Plan')}
        </button>
      </div>

      <AddMealModal isOpen={isModalOpen} onClose={handleCloseModal} onAdd={handleAddFood} />
    </div>
  );
}