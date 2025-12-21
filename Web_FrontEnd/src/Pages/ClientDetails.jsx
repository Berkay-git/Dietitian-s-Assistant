import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function ClientDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const passedState = location.state || {}; 
  const clientId = passedState.id; 

  const [clientData, setClientData] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // FETCH DATA
  useEffect(() => {
    if (!clientId) {
      setError("No Client ID provided");
      setLoading(false);
      return;
    }

    const fetchDetails = async () => {
      try {
        // Add random timestamp to prevent caching issues we saw earlier
        const response = await fetch(`http://localhost:5000/api/dietitian/client-details/${clientId}?_t=${Date.now()}`);
        const data = await response.json();

        if (response.ok) {
          setClientData(data);
        } else {
          setError(data.error || "Failed to load details");
        }
      } catch (err) {
        console.error(err);
        setError("Connection error");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [clientId]);


  const handleUpdateClick = () => {
    navigate('/edit-client', { state: clientData });
  };

  // --- ACTION 1: DEACTIVATE (client)---
  const handleDeactivate = async () => {
    if (!window.confirm(`Are you sure you want to deactivate ${clientData.name}?`)) {
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/api/dietitian/clients/${clientData.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        alert("Client deactivated.");
        navigate('/dashboard'); 
      } else {
        const data = await response.json();
        alert("Failed: " + data.error);
      }
    } catch (error) {
      alert("Server error.");
    }
  };

  // --- ACTION 2: REACTIVATE (client) ---
  const handleReactivate = async () => {
    if (!window.confirm(`Reactivate ${clientData.name}? They will appear as Active again.`)) {
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/api/dietitian/clients/${clientData.id}/reactivate`, {
        method: 'PUT',
      });
      if (response.ok) {
        alert("Client reactivated successfully!");
        navigate('/dashboard'); 
      } else {
        const data = await response.json();
        alert("Failed: " + data.error);
      }
    } catch (error) {
      alert("Server error.");
    }
  };

  // --- RENDERING ---
  
  if (loading) return <div style={styles.centerMsg}>Loading...</div>;
  if (error) return <div style={styles.centerMsg}>Error: {error}</div>;
  if (!clientData) return <div style={styles.centerMsg}>Client not found.</div>;

  const isInactive = clientData.status === 'Inactive';

  return (
    <div style={styles.mainContainer}>
      <div style={styles.contentContainer}>
        
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.pageTitle}>Client Profile</h1>
          <button style={styles.closeButton} onClick={() => navigate('/dashboard')}>
            ✕ Close
          </button>
        </div>

        {/* Profile Card */}
        <div style={styles.profileCard}>
          
          {/* TOGGLE BUTTONS: Show based on status */}
          {isInactive ? (
             // SHOW REACTIVATE BUTTON (Green)
             <button 
                style={styles.reactivateButton} 
                onClick={handleReactivate}
                title="Reactivate Client"
             >
                ✅
             </button>
          ) : (
             // SHOW DEACTIVATE BUTTON (Red)
             <button 
                style={styles.deactivateButton} 
                onClick={handleDeactivate}
                title="Deactivate Client"
             >
                🚫
             </button>
          )}

          <div style={styles.avatarPlaceholder}>
            <span style={styles.avatarText}>{clientData.name ? clientData.name.charAt(0) : '?'}</span>
          </div>
          <h2 style={styles.clientName}>{clientData.name}</h2>
          <p style={styles.clientStatus}>
            {isInactive ? <span style={{color:'red'}}>Inactive Member</span> : `${clientData.status} Member`}
          </p>

          <button style={styles.updateButton} onClick={handleUpdateClick} disabled={isInactive}>
              ✏️ Update Details
          </button>

          <div style={styles.sectionHeader}>
             <h3 style={styles.sectionTitle}>Personal Details</h3>
          </div>
          {/* ... (Existing Details) ... */}
          <div style={styles.row}><span style={styles.label}>Date of Birth:</span><span style={styles.value}>{clientData.dob}</span></div>
          <div style={styles.row}><span style={styles.label}>Gender:</span><span style={styles.value}>{clientData.gender}</span></div>
          <div style={styles.row}><span style={styles.label}>🎯 Target Plan:</span><span style={{...styles.value, color: '#007AFF'}}>{clientData.goal || 'Not set'}</span></div>

          <div style={styles.medicalBox}>
             <span style={styles.medicalLabel}>⚠️ Medical Report:</span>
             <span style={styles.medicalValue}>{clientData.medicalReport}</span>
          </div>

          <div style={styles.sectionHeader}>
             <h3 style={styles.sectionTitle}>Body Details</h3>
          </div>

          <div style={styles.gridContainer}>
             <div style={styles.gridItem}><span style={styles.gridLabel}>Weight</span><span style={styles.gridValue}>{clientData.weight} kg</span></div>
             <div style={styles.gridItem}><span style={styles.gridLabel}>Height</span><span style={styles.gridValue}>{clientData.height} cm</span></div>
             <div style={styles.gridItem}><span style={styles.gridLabel}>Body Fat</span><span style={styles.gridValue}>%{clientData.bodyfat}</span></div>
             <div style={styles.gridItem}><span style={styles.gridLabel}>Activity</span><span style={styles.gridValue}>{clientData.activity}</span></div>
          </div>
        </div>

        {/* BUTTON ROW */}
        <div style={styles.actionButtonRow}>
          <button 
            style={{...styles.viewPlanButton, opacity: isInactive ? 0.5 : 1}} 
            onClick={() => navigate('/client-meals', { state: { client: clientData } })}
          >
            <span style={styles.buttonEmoji}>📅</span>
            <span style={styles.buttonText}>View Plans</span>
          </button>

          <button 
            style={{...styles.createPlanButton, opacity: isInactive ? 0.5 : 1, cursor: isInactive ? 'not-allowed' : 'pointer'}} 
            onClick={() => {
                if(!isInactive) navigate('/meal-planner', { state: { client: clientData } });
            }}
            disabled={isInactive}
          >
            <span style={styles.buttonEmoji}>🥗</span>
            <span style={styles.buttonText}>Create Plan</span>
          </button>
        </div>

      </div>
    </div>
  );
}

const styles = {
  mainContainer: { display: 'flex', justifyContent: 'center', padding: '40px 20px', backgroundColor: '#f5f5f5', minHeight: '100vh', fontFamily: 'Arial, sans-serif' },
  contentContainer: { width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  header: { width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  pageTitle: { fontSize: '24px', fontWeight: 'bold', color: '#333', margin: 0 },
  closeButton: { background: 'none', border: 'none', color: '#666', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' },
  
  profileCard: { position: 'relative', width: '100%', backgroundColor: '#fff', borderRadius: '20px', padding: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px', boxSizing: 'border-box' },
  
  // STYLE FOR DEACTIVATE (Red)
  deactivateButton: {
    position: 'absolute', top: '15px', right: '15px',
    background: '#ffebee', border: '1px solid #ffcdd2', borderRadius: '50%',
    width: '35px', height: '35px', display: 'flex', justifyContent: 'center', alignItems: 'center',
    cursor: 'pointer', fontSize: '16px'
  },
  
  // NEW STYLE FOR REACTIVATE (Green)
  reactivateButton: {
    position: 'absolute', top: '15px', right: '15px',
    background: '#e8f5e9', border: '1px solid #c8e6c9', borderRadius: '50%',
    width: '35px', height: '35px', display: 'flex', justifyContent: 'center', alignItems: 'center',
    cursor: 'pointer', fontSize: '16px'
  },

  avatarPlaceholder: { width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#e3f2fd', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '15px' },
  avatarText: { fontSize: '32px', fontWeight: 'bold', color: '#007AFF' },
  clientName: { fontSize: '22px', fontWeight: 'bold', color: '#333', margin: '0 0 5px 0' },
  clientStatus: { fontSize: '14px', color: '#888', margin: '0 0 15px 0' },
  updateButton: { backgroundColor: '#f0f0f0', border: '1px solid #ddd', padding: '8px 20px', borderRadius: '20px', marginBottom: '25px', cursor: 'pointer', color: '#555', fontSize: '14px', fontWeight: 'bold' },
  sectionHeader: { width: '100%', borderBottom: '1px solid #eee', paddingBottom: '5px', marginTop: '15px', marginBottom: '15px', textAlign: 'left' },
  sectionTitle: { fontSize: '18px', fontWeight: 'bold', color: '#333', margin: 0 },
  row: { width: '100%', display: 'flex', justifyContent: 'space-between', marginBottom: '12px' },
  label: { fontSize: '15px', color: '#666' },
  value: { fontSize: '16px', color: '#333', fontWeight: 'bold' },
  medicalBox: { width: '100%', backgroundColor: '#fff5f5', border: '1px solid #ffcdd2', borderRadius: '8px', padding: '12px', marginTop: '10px', marginBottom: '10px', textAlign: 'center', boxSizing: 'border-box' },
  medicalLabel: { fontSize: '14px', color: '#d32f2f', fontWeight: 'bold', marginRight: '5px' },
  medicalValue: { fontSize: '16px', color: '#b71c1c', fontWeight: 'bold' },
  gridContainer: { width: '100%', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '10px' },
  gridItem: { width: '46%', backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxSizing: 'border-box' },
  gridLabel: { fontSize: '14px', color: '#666', marginBottom: '5px' },
  gridValue: { fontSize: '16px', color: '#333', fontWeight: 'bold' },
  actionButtonRow: { width: '100%', display: 'flex', gap: '15px', justifyContent: 'space-between' },
  createPlanButton: { flex: 1, backgroundColor: '#28a745', padding: '15px', borderRadius: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center', border: 'none', cursor: 'pointer', boxShadow: '0 4px 10px rgba(40, 167, 69, 0.3)' },
  viewPlanButton:   { flex: 1, backgroundColor: '#007AFF', padding: '15px', borderRadius: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center', border: 'none', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0, 122, 255, 0.3)' },
  buttonEmoji: { fontSize: '24px', marginBottom: '5px' },
  buttonText: { color: '#fff', fontSize: '16px', fontWeight: 'bold' },
  centerMsg: { marginTop: '50px', fontSize: '18px', color: '#666', textAlign: 'center' }
};