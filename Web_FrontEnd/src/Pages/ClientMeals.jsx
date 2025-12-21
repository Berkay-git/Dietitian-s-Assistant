import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// --- HELPER: TIME SORTER ---
const getMinutesFromTime = (timeStr) => {
  if (!timeStr || timeStr === "Flexible") return 9999; 
  try {
    const startPart = timeStr.split('-')[0].trim(); 
    const [hours, minutes] = startPart.split(':').map(Number);
    return (hours * 60) + minutes;
  } catch (e) {
    return 9999;
  }
};

export default function ClientMeals() {
  const navigate = useNavigate();
  const location = useLocation();
  const client = location.state?.client || {};
  
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedPlanId, setExpandedPlanId] = useState(null);

  useEffect(() => {
    if (!client.id) {
        setError("No Client ID found.");
        setLoading(false);
        return;
    }

    const fetchPlans = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/dietitian/meal-plans?client_id=${client.id}`);
            const data = await response.json();

            if (response.ok) {
                setPlans(data);
            } else {
                setError("Failed to load plans.");
            }
        } catch (err) {
            console.error(err);
            setError("Server connection error.");
        } finally {
            setLoading(false);
        }
    };

    fetchPlans();
  }, [client.id]);

  const togglePlan = (id) => {
    setExpandedPlanId(expandedPlanId === id ? null : id);
  };

  // --- RENDERING ---
  if (loading) return <div style={styles.centerMsg}>Loading meal plans...</div>;
  if (error) return <div style={styles.centerMsg}>Error: {error}</div>;

  return (
    <div style={styles.mainContainer}>
      <div style={styles.contentContainer}>
        
        {/* HEADER */}
        <div style={styles.header}>
          <button style={styles.backButton} onClick={() => navigate(-1)}>&larr; Back</button>
          <h1 style={styles.pageTitle}>Assigned Meal Plans</h1>
        </div>

        {/* CLIENT BANNER */}
        <div style={styles.clientBanner}>
          <div style={styles.avatarPlaceholder}>{client.name ? client.name.charAt(0) : '?'}</div>
          <div>
            <h2 style={{margin:0, color:'#333'}}>{client.name}</h2>
            <p style={{margin:'5px 0', color:'#666'}}>{client.status || 'Active'} Member</p>
          </div>
        </div>

        {/* PLAN LIST */}
        <div style={styles.listContainer}>
          {plans.length === 0 ? (
             <div style={{textAlign:'center', color:'#888', fontStyle:'italic'}}>No meal plans assigned yet.</div>
          ) : (
             plans.map((plan) => {
                const isExpanded = expandedPlanId === plan.id;
                const isActive = plan.status === 'Active'; 
                
                // Sort meals by time
                const sortedMeals = [...plan.meals].sort((a, b) => {
                    return getMinutesFromTime(a.time) - getMinutesFromTime(b.time);
                });

                return (
                  <div key={plan.id} style={styles.planCard}>
                    {/* Card Header */}
                    <div style={styles.cardHeader} onClick={() => togglePlan(plan.id)}>
                      <div>
                        <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                          <h3 style={{margin:0, fontSize:'18px'}}>📅 {plan.date}</h3>
                          {isActive && <span style={styles.activeBadge}>Active</span>}
                        </div>
                        <p style={{margin:'5px 0 0 0', color:'#666', fontSize:'14px'}}>Total Calories: <strong>{plan.avgCalories} kcal</strong></p>
                      </div>
                      <div style={{fontSize:'20px', color:'#999'}}>{isExpanded ? '▲' : '▼'}</div>
                    </div>

                    {/* Card Body */}
                    {isExpanded && (
                      <div style={styles.cardBody}>
                        <div style={styles.divider}></div>
                        <div style={styles.mealGrid}>
                          {sortedMeals.map((meal, mIdx) => (
                            <div key={mIdx} style={styles.mealBox}>
                              <div style={{display:'flex', justifyContent:'space-between', marginBottom:'5px'}}>
                                  <strong style={{color:'#007AFF'}}>{meal.title}</strong>
                                  <span style={{fontSize:'0.8em', color:'#666'}}>
                                    {(meal.time || "").split('-').map(t => t.trim().substring(0, 5)).join(' - ')}
                                  </span>
                              </div>
                              <ul style={{margin:'0', paddingLeft:'20px', color:'#555', fontSize:'0.9em'}}>
                                {meal.items.map((item, i) => (
                                    <li key={i}>{item.amount}g {item.name} <span style={{color:'#999', fontSize:'0.8em'}}>({item.calories} kcal)</span></li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                        
                        {/* EDIT BUTTON (Inside Card) */}
                        <button 
                          style={styles.editButton}
                          onClick={(e) => {
                            e.stopPropagation(); // Stop the card from collapsing
                            // HERE IS THE MAGIC: We pass 'planToEdit' along with the client
                            navigate('/meal-planner', { 
                                state: { 
                                    client: client, 
                                    planToEdit: plan 
                                } 
                            });
                          }}
                        >
                          ✏️ Edit Meal Plan
                        </button>
                      </div>
                    )}
                  </div>
                );
             })
          )}

          {/* ADD NEW PLAN BUTTON (At the Bottom) */}
          <button 
             style={styles.addNewButton}
             onClick={() => navigate('/meal-planner', { state: { client: client } })} // No planToEdit, so it starts fresh
          >
             + Create New Meal Plan
          </button>

        </div>
      </div>
    </div>
  );
}

const styles = {
  mainContainer: { display: 'flex', justifyContent: 'center', padding: '40px 20px', backgroundColor: '#f5f5f5', minHeight: '100vh', fontFamily: 'Arial, sans-serif' },
  contentContainer: { width: '100%', maxWidth: '800px' },
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
  mealGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' },
  mealBox: { backgroundColor: 'white', padding: '15px', borderRadius: '8px', border: '1px solid #eee', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' },
  
  // Button Styles
  editButton: { marginTop: '20px', padding: '12px', backgroundColor: '#FF9800', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', width: '100%', fontSize: '16px' },
  addNewButton: { padding: '15px', backgroundColor: '#007AFF', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '18px', boxShadow: '0 4px 10px rgba(0,122,255,0.3)', marginTop: '10px' },
  centerMsg: { textAlign: 'center', marginTop: '50px', fontSize: '18px', color: '#666' }
};