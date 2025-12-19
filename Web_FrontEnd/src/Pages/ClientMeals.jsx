import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// --- MOCK DATA: Different Plans for the Client ---
const MOCK_PLAN_HISTORY = [
  {
    id: 'p1',
    startDate: '25 Oct 2025',
    endDate: '31 Oct 2025',
    status: 'Active',
    avgCalories: 1850,
    goal: 'Weight Loss',
    // The meals inside this plan
    days: [
      {
        day: 'Monday',
        meals: [
          { title: 'Breakfast', items: ['Oatmeal (120g)', 'Banana (80g)'] },
          { title: 'Lunch', items: ['Grilled Chicken (150g)', 'Rice (100g)'] },
          { title: 'Dinner', items: ['Salmon (120g)', 'Salad (200g)'] }
        ]
      },
      {
        day: 'Tuesday',
        meals: [
          { title: 'Breakfast', items: ['Boiled Eggs (2)', 'Toast (1 slice)'] },
          { title: 'Lunch', items: ['Turkey Sandwich', 'Apple'] },
        ]
      }
    ]
  },
  {
    id: 'p2',
    startDate: '18 Oct 2025',
    endDate: '24 Oct 2025',
    status: 'Completed',
    avgCalories: 2100,
    goal: 'Maintenance',
    days: [
      {
        day: 'Monday',
        meals: [
          { title: 'Breakfast', items: ['Pancakes (2)', 'Honey'] },
          { title: 'Lunch', items: ['Pasta (200g)', 'Tomato Sauce'] },
        ]
      }
    ]
  }
];

export default function ClientMeals() {
  const navigate = useNavigate();
  const location = useLocation();
  // 1. Receive the Client Data passed from the previous page
  const client = location.state?.client || { name: 'Unknown Client' };

  // State to track which plan is expanded (open)
  const [expandedPlanId, setExpandedPlanId] = useState(null);

  const togglePlan = (id) => {
    if (expandedPlanId === id) {
      setExpandedPlanId(null); // Close if already open
    } else {
      setExpandedPlanId(id); // Open the clicked one
    }
  };

  return (
    <div style={styles.mainContainer}>
      <div style={styles.contentContainer}>
        
        {/* --- HEADER --- */}
        <div style={styles.header}>
          <button style={styles.backButton} onClick={() => navigate(-1)}>
            &larr; Back
          </button>
          <h1 style={styles.pageTitle}>Assigned Meal Plans</h1>
        </div>

        {/* --- CLIENT BANNER --- */}
        <div style={styles.clientBanner}>
          <div style={styles.avatarPlaceholder}>
            {client.name ? client.name.charAt(0) : '?'}
          </div>
          <div>
            <h2 style={{margin:0, color:'#333'}}>{client.name}</h2>
            <p style={{margin:'5px 0', color:'#666'}}>{client.status} Member</p>
          </div>
        </div>

        {/* --- PLAN LIST --- */}
        <div style={styles.listContainer}>
          {MOCK_PLAN_HISTORY.map((plan) => {
            const isExpanded = expandedPlanId === plan.id;
            const isActive = plan.status === 'Active';

            return (
              <div key={plan.id} style={styles.planCard}>
                
                {/* Card Header (Always Visible) */}
                <div style={styles.cardHeader} onClick={() => togglePlan(plan.id)}>
                  <div>
                    <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                      <h3 style={{margin:0, fontSize:'18px'}}>
                        {plan.startDate} - {plan.endDate}
                      </h3>
                      {isActive && <span style={styles.activeBadge}>Active Now</span>}
                    </div>
                    <p style={{margin:'5px 0 0 0', color:'#666', fontSize:'14px'}}>
                      Goal: {plan.goal} | Avg Cals: {plan.avgCalories}
                    </p>
                  </div>
                  <div style={{fontSize:'20px', color:'#999'}}>
                    {isExpanded ? '▲' : '▼'}
                  </div>
                </div>

                {/* Card Body (Visible only if Expanded) */}
                {isExpanded && (
                  <div style={styles.cardBody}>
                    <div style={styles.divider}></div>
                    {plan.days.map((day, idx) => (
                      <div key={idx} style={styles.dayBlock}>
                        <h4 style={styles.dayTitle}>{day.day}</h4>
                        <div style={styles.mealGrid}>
                          {day.meals.map((meal, mIdx) => (
                            <div key={mIdx} style={styles.mealBox}>
                              <strong>{meal.title}</strong>
                              <ul style={{margin:'5px 0 0 0', paddingLeft:'20px', color:'#555', fontSize:'0.9em'}}>
                                {meal.items.map((item, i) => <li key={i}>{item}</li>)}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    
                    {/* Action Button */}
                    <button 
                       style={styles.editButton}
                       onClick={(e) => {
                         e.stopPropagation(); // Don't collapse the card
                         // Navigate to editor with this plan (future functionality)
                         navigate('/meal-planner', { state: { client: client } });
                       }}
                    >
                      ✏️ Edit this Plan
                    </button>
                  </div>
                )}

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

const styles = {
  mainContainer: { display: 'flex', justifyContent: 'center', padding: '40px 20px', backgroundColor: '#f5f5f5', minHeight: '100vh', fontFamily: 'Arial, sans-serif' },
  contentContainer: { width: '100%', maxWidth: '800px' }, // Wider than profile card for better list view
  
  header: { display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' },
  backButton: { background: '#ddd', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
  pageTitle: { margin: 0, fontSize: '24px', color: '#333' },

  clientBanner: { backgroundColor: 'white', padding: '20px', borderRadius: '15px', display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
  avatarPlaceholder: { width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#e3f2fd', color: '#007AFF', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '24px', fontWeight: 'bold' },
  
  listContainer: { display: 'flex', flexDirection: 'column', gap: '20px' },
  
  planCard: { backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' },
  
  cardHeader: { padding: '20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', transition: 'background 0.2s' },
  activeBadge: { backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' },
  
  cardBody: { padding: '0 20px 20px 20px', backgroundColor: '#fafafa' },
  divider: { height: '1px', backgroundColor: '#eee', marginBottom: '15px' },
  
  dayBlock: { marginBottom: '15px' },
  dayTitle: { margin: '0 0 10px 0', color: '#007AFF', fontSize: '16px' },
  
  mealGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' },
  mealBox: { backgroundColor: 'white', padding: '10px', borderRadius: '8px', border: '1px solid #eee' },
  
  editButton: { marginTop: '15px', padding: '10px 20px', backgroundColor: '#007AFF', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }
};