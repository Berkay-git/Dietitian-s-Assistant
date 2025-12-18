import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();

  // MOCK DATA (Veriler aynen duruyor)
  const clients = [
    { id: '1', name: 'Ahmet Yılmaz', dob: '12/05/1990', gender: 'Male', medicalReport: 'Tip 2 Diyabet', goal: 'Weight Loss', weight: '85', height: '180', bodyfat: '22', activity: 'Sedentary', status: 'Active', lastVisit: '12.12.2025' },
    { id: '2', name: 'Ayşe Demir', dob: '24/08/1995', gender: 'Female', medicalReport: 'Çölyak', goal: 'Muscle Gain', weight: '62', height: '165', bodyfat: '28', activity: 'Moderately Active', status: 'Pending', lastVisit: '10.12.2025' },
    { id: '3', name: 'Mehmet Kaya', dob: '01/01/1980', gender: 'Male', medicalReport: 'Yok', goal: 'Healthy Living', weight: '95', height: '175', bodyfat: '30', activity: 'Active', status: 'Active', lastVisit: '09.12.2025' },
  ];

  const handleClientClick = (client) => {
    navigate('/client-details', { state: client });
  };

  // Logout Fonksiyonu 
  const handleLogout = () => {
    navigate('/'); 
  };

  return (
    <div style={styles.mainContainer}>
      <div style={styles.contentContainer}>
        
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>My Clients</h1>
          <div style={styles.headerButtons}>
               {}
               <button style={styles.logoutButton} onClick={handleLogout}>
                 Logout
               </button>
               <button style={styles.addButton} onClick={() => navigate('/add-client')}>
                 + Insert Client
               </button>
          </div>
        </div>

        {}
        <div style={styles.list}>
          {clients.map((client) => (
            <div 
              key={client.id} 
              style={styles.card} 
              onClick={() => handleClientClick(client)}
            >
              <div>
                <h3 style={styles.clientName}>{client.name}</h3>
                <p style={styles.clientDate}>Last Visit: {client.lastVisit}</p>
              </div>
              
              <span style={{
                ...styles.statusBadge,
                backgroundColor: client.status === 'Active' ? '#e3f2fd' : '#fff3e0',
                color: client.status === 'Active' ? '#007AFF' : '#FF9800'
              }}>
                {client.status}
              </span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

const styles = {
  mainContainer: {
    padding: '40px 20px',
    backgroundColor: '#f5f5f5',
    minHeight: '100vh',
    fontFamily: 'Arial, sans-serif',
    display: 'flex',          
    justifyContent: 'center'  // YATAYDA ORTALA
  },
  contentContainer: {
    width: '100%',            
    maxWidth: '800px',        // GENİŞLİĞİ SINIRLA (Çok yayılmasın)
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px'
  },
  headerButtons: {
    display: 'flex',
    gap: '10px'
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    margin: 0
  },
  logoutButton: {
    padding: '12px 20px',
    backgroundColor: '#ff4d4f', // Kırmızı
    color: 'white',
    borderRadius: '8px',
    border: 'none',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '14px',
    transition: '0.3s'
  },
  addButton: {
    padding: '12px 20px',
    backgroundColor: '#007AFF', // Mavi
    color: 'white',
    borderRadius: '8px',
    border: 'none',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '14px',
    transition: '0.3s'
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  card: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '15px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
    cursor: 'pointer',
    transition: 'transform 0.2s'
  },
  clientName: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#333',
    margin: '0 0 5px 0'
  },
  clientDate: {
    fontSize: '14px',
    color: '#888',
    margin: 0
  },
  statusBadge: {
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: 'bold'
  }
};