import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();

  // 1. STATE MANAGEMENT
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 2. FETCH REAL DATA ON LOAD
  useEffect(() => {
    const fetchClients = async () => {
      // Get the Dietitian ID saved during Login
      const dietitianId = localStorage.getItem('user_id');

      if (!dietitianId) {
        // If no ID, they aren't logged in -> Send to Login
        navigate('/'); 
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/dietitian/clients?dietitian_id=${dietitianId}&_t=${Date.now()}`);
        const data = await response.json();

        if (response.ok) {
          setClients(data); // Set the real data!
        } else {
          setError('Failed to load clients.');
        }
      } catch (err) {
        console.error(err);
        setError('Error connecting to server.');
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [navigate]);

  // Logout Logic
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_name');
    navigate('/'); 
  };

  // Navigation Handlers
  const handleClientClick = (client) => {
    // We pass the entire client object to the next page
    navigate('/client-details', { state: client });
  };


  if (loading) return <div style={styles.centerMsg}>Loading your clients...</div>;
  if (error) return <div style={styles.centerMsg}>Error: {error}</div>;

  // --- SORTING LOGIC: Active first, Inactive last(at the bottom) ---
  const sortedClients = [...clients].sort((a, b) => {
      if (a.status === 'Inactive' && b.status !== 'Inactive') return 1;
      if (a.status !== 'Inactive' && b.status === 'Inactive') return -1;
      return 0; // Keep original order otherwise
  });

  console.log("DASHBOARD RENDER DATA:", sortedClients);

  return (
    <div style={styles.mainContainer}>
      <div style={styles.contentContainer}>
        
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>My Clients</h1>
          <div style={styles.headerButtons}>
               <button style={styles.logoutButton} onClick={handleLogout}>Logout</button>
               <button style={styles.addButton} onClick={() => navigate('/add-client')}>
                 + Insert Client
               </button>
          </div>
        </div>

        {/* Client List */}
        <div style={styles.list}>
          {sortedClients.length === 0 ? (
            <div style={{textAlign:'center', color:'#999', marginTop:'20px'}}>
              No clients found. Click "+ Insert Client" to add one!
            </div>
          ) : (
            sortedClients.map((client) => {
              const isInactive = client.status === 'Inactive';
              
              return (
                <div 
                  key={client.id} 
                  style={{
                      ...styles.card,
                      // CONDITIONAL STYLING FOR INACTIVE. Inactive is kind of grey and transparent.
                      backgroundColor: isInactive ? '#f5f5f5' : 'white',
                      opacity: isInactive ? 0.7 : 1,
                      border: isInactive ? '1px solid #ddd' : 'none'
                  }} 
                  onClick={() => handleClientClick(client)}
                >
                  <div>
                    <h3 style={{...styles.clientName, color: isInactive ? '#666' : '#333'}}>
                        {client.name}
                    </h3>
                    <p style={styles.clientDate}>DOB: {client.dob || 'N/A'}</p>
                  </div>
                  
                  <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: isInactive ? '#e0e0e0' : (client.status === 'Active' ? '#e3f2fd' : '#fff3e0'),
                      color: isInactive ? '#666' : (client.status === 'Active' ? '#007AFF' : '#FF9800')
                    }}>
                      {client.status || 'Active'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}

const styles = {
  mainContainer: { padding: '40px 20px', backgroundColor: '#f5f5f5', minHeight: '100vh', fontFamily: 'Arial, sans-serif', display: 'flex', justifyContent: 'center' },
  contentContainer: { width: '100%', maxWidth: '800px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  headerButtons: { display: 'flex', gap: '10px' },
  title: { fontSize: '28px', fontWeight: 'bold', color: '#333', margin: 0 },
  logoutButton: { padding: '12px 20px', backgroundColor: '#ff4d4f', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', transition: '0.3s' },
  addButton: { padding: '12px 20px', backgroundColor: '#007AFF', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', transition: '0.3s' },
  list: { display: 'flex', flexDirection: 'column', gap: '15px' },
  card: { backgroundColor: 'white', padding: '25px', borderRadius: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'transform 0.2s' },
  clientName: { fontSize: '18px', fontWeight: '600', color: '#333', margin: '0 0 5px 0' },
  clientDate: { fontSize: '14px', color: '#888', margin: 0 },
  statusBadge: { padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' },
  planButton: { padding: '8px 12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', marginRight: '10px' },
  centerMsg: { textAlign: 'center', marginTop: '50px', fontSize: '18px', color: '#666' }
};