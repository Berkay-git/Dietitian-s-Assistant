import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// --- Yeni Ölçüm Ekleme Popup'ı ---
function AddMeasurementModal({ isOpen, onClose, onSave, clientId }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bodyfat, setBodyfat] = useState('');
  
  // Varsayılan değer (En üstteki)
  const [activity, setActivity] = useState('Sedentary (Little to no exercise)');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!weight || !height) {
      alert("Please enter at least weight and height.");
      return;
    }
    
    setIsSubmitting(true);

    const loggedInDietitianId = localStorage.getItem('user_id');

    // Yeni ölçüm objesi
    const newRecord = {
      client_id: clientId,
      dietitian_id: loggedInDietitianId, // Artık buraya Turab'ın ID'si şak diye oturacak! 🎯
      date: date,
      weight: parseFloat(weight),
      height: parseFloat(height),
      bodyfat: parseFloat(bodyfat) || 0,
      activity: activity
    };

    // Konsoldan test etmek istersen dursun, süper oluyor:
    console.log("Backend'e Giden Paket:", newRecord);

    await onSave(newRecord);
    setIsSubmitting(false);
    onClose();
    
    // Formu temizle
    setWeight(''); setHeight(''); setBodyfat('');
  };
  

  const styles = {
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000 },
    modal: { backgroundColor: 'white', padding: '25px', borderRadius: '12px', width: '320px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', gap: '12px', fontFamily: "'Inter', sans-serif" },
    title: { margin: 0, fontSize: '18px', color: '#333', textAlign: 'center', borderBottom: '1px solid #eee', paddingBottom: '10px' },
    label: { fontSize: '13px', fontWeight: 'bold', color: '#555', marginBottom: '4px', display: 'block' },
    input: { width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #ccc', outline: 'none', backgroundColor: '#f9f9f9', boxSizing: 'border-box' },
    select: { width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #ccc', outline: 'none', backgroundColor: '#f9f9f9' },
    btnRow: { display: 'flex', gap: '10px', marginTop: '10px' },
    saveBtn: { flex: 1, padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
    cancelBtn: { flex: 1, padding: '10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3 style={styles.title}>📏 Add New Record</h3>

        <div><label style={styles.label}>Date</label><input type="date" style={styles.input} value={date} onChange={e => setDate(e.target.value)} /></div>
        
        <div style={{display: 'flex', gap: '10px'}}>
          <div style={{flex: 1}}><label style={styles.label}>Weight (kg)</label><input type="number" step="0.1" style={styles.input} value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 75.5" /></div>
          <div style={{flex: 1}}><label style={styles.label}>Height (cm)</label><input type="number" style={styles.input} value={height} onChange={e => setHeight(e.target.value)} placeholder="e.g. 180" /></div>
        </div>

        <div><label style={styles.label}>Body Fat (%)</label><input type="number" step="0.1" style={styles.input} value={bodyfat} onChange={e => setBodyfat(e.target.value)} placeholder="e.g. 15.5" /></div>
        
        <div>
          <label style={styles.label}>Activity Level</label>
          <select style={styles.select} value={activity} onChange={e => setActivity(e.target.value)}>
            <option value="Sedentary (Little to no exercise)">Sedentary (Little to no exercise)</option>
            <option value="Light (Exercise 1-3 days/week)">Light (Exercise 1-3 days/week)</option>
            <option value="Moderate (Exercise 3-5 days/week)">Moderate (Exercise 3-5 days/week)</option>
            <option value="Heavy (Exercise 6-7 days/week)">Heavy (Exercise 6-7 days/week)</option>
            <option value="Athlete (Physical job or 2x training)">Athlete (Physical job or 2x training)</option>
          </select>
        </div>

        <div style={styles.btnRow}>
          <button style={styles.saveBtn} onClick={handleSubmit} disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save'}</button>
          <button style={styles.cancelBtn} onClick={onClose} disabled={isSubmitting}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
// -----------------------------------------------------------

export default function ClientProgress() {
  const navigate = useNavigate();
  const location = useLocation();
  const clientData = location.state?.client || {}; 
  const clientId = clientData.id || clientData.ClientID;

  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Sekmeler: 'single', 'compare', 'all'
  const [viewMode, setViewMode] = useState('single');
  
  // Seçili tarihler
  const [selectedDate1, setSelectedDate1] = useState('');
  const [selectedDate2, setSelectedDate2] = useState('');

  // Yeni Kayıt Modal State'i
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Verileri Backend'den Çekme Fonksiyonu
  const fetchMeasurements = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/dietitian/client-measurements/${clientId}?_t=${Date.now()}`);
      const data = await response.json();

      if (response.ok) {
        const sortedData = data.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        setMeasurements(sortedData);
        if (data.length > 0) {
          setSelectedDate1(data[0].date); 
          setSelectedDate2(data[data.length - 1].date); 
        }
      } else {
        setError(data.error || "Failed to load measurements");
      }
    } catch (err) {
      console.error(err);
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!clientId) {
      setError("No Client ID provided");
      setLoading(false);
      return;
    }
    fetchMeasurements();
  }, [clientId]);


  // Yeni Ölçümü Backend'e Gönderme (POST metodu ile yeni satır ekler)
  const handleSaveNewRecord = async (newRecord) => {
    try {
      const response = await fetch(`http://localhost:5000/api/dietitian/client-measurements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecord)
      });
      
      if (response.ok) {
        alert("✅ New record added to history successfully!");
        // Kayıt başarılıysa verileri tekrar çekip ekranı güncelliyoruz
        fetchMeasurements();
      } else {
        const data = await response.json();
        alert("Failed to save record: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Server error while saving record.");
    }
  };


  // Fark hesaplama fonksiyonu
  const getDiffUI = (val1, val2, type) => {
    const diff = (val1 - val2).toFixed(1);
    
    // (No change) İngilizce düzeltmesi
    if (diff == 0) return <span style={{color: '#999', fontSize: '14px', fontStyle: 'italic'}}> (No change)</span>;

    const isGood = type === 'weight' || type === 'bodyfat' ? diff < 0 : diff > 0;
    const color = isGood ? '#28a745' : '#dc3545';
    const arrow = diff > 0 ? '↑' : '↓';
    
    return <span style={{color: color, fontWeight: 'bold', fontSize: '16px'}}> {diff > 0 ? '+' : ''}{diff} {arrow}</span>;
  };


  if (loading) return <div style={styles.centerMsg}>Loading progress...</div>;
  if (error) return <div style={styles.centerMsg}>Error: {error}</div>;

  const record1 = measurements.find(m => m.date === selectedDate1) || {};
  const record2 = measurements.find(m => m.date === selectedDate2) || {};

  return (
    <div style={styles.mainContainer}>
      <div style={styles.contentContainer}>
        
        {/* TOPBAR */}
        <div style={styles.header}>
          <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
            <button style={styles.backButton} onClick={() => navigate(-1)}>
              &larr; Back
            </button>
            <div>
              <h1 style={styles.pageTitle}>{clientData.name} - Progress</h1>
              <span style={styles.subTitle}>
                Start Date: {measurements.length > 0 ? measurements[0].date : 'N/A'}
              </span>
            </div>
          </div>
          
          <button style={styles.addRecordBtn} onClick={() => setIsAddModalOpen(true)}>
            + Add New Record
          </button>
        </div>

        {/* EĞER HİÇ ÖLÇÜM YOKSA */}
        {measurements.length === 0 ? (
          <div style={styles.noDataBox}>
            <span style={{fontSize: '40px'}}>📭</span>
            <h3>No measurement records found.</h3>
            <p>This client hasn't added any physical details yet.</p>
            <button style={{...styles.addRecordBtn, marginTop: '15px'}} onClick={() => setIsAddModalOpen(true)}>
              Add First Record
            </button>
          </div>
        ) : (
          <>
            {/* TABS (Görünüm Seçenekleri) */}
            <div style={styles.tabsContainer}>
              <button style={viewMode === 'single' ? styles.activeTab : styles.tab} onClick={() => setViewMode('single')}>
                📅 Single Date
              </button>
              <button style={viewMode === 'compare' ? styles.activeTab : styles.tab} onClick={() => setViewMode('compare')}>
                ⚖️ Compare Dates
              </button>
              <button style={viewMode === 'all' ? styles.activeTab : styles.tab} onClick={() => setViewMode('all')}>
                📜 View All History
              </button>
            </div>

            <div style={styles.card}>
              
              {/* MODE 1: SINGLE DATE */}
              {viewMode === 'single' && (
                <div>
                  <div style={styles.controlsRow}>
                    <label style={styles.label}>Select Date:</label>
                    <select style={styles.select} value={selectedDate1} onChange={e => setSelectedDate1(e.target.value)}>
                      {measurements.map(m => <option key={m.id} value={m.date}>{m.date}</option>)}
                    </select>
                  </div>
                  
                  <div style={styles.gridContainer}>
                    <div style={styles.gridItem}><span style={styles.gridLabel}>Weight</span><span style={styles.gridValue}>{record1.weight} kg</span></div>
                    <div style={styles.gridItem}><span style={styles.gridLabel}>Height</span><span style={styles.gridValue}>{record1.height} cm</span></div>
                    <div style={styles.gridItem}><span style={styles.gridLabel}>Body Fat</span><span style={styles.gridValue}>%{record1.bodyfat}</span></div>
                    <div style={styles.gridItem}><span style={styles.gridLabel}>Activity</span><span style={styles.gridValue}>{record1.activity}</span></div>
                  </div>
                </div>
              )}

              {/* MODE 2: COMPARE DATES */}
              {viewMode === 'compare' && (
                <div>
                  <div style={styles.compareControlsRow}>
                    <div style={{flex: 1}}>
                      <label style={styles.label}>Old Date (Baseline):</label>
                      <select style={styles.select} value={selectedDate2} onChange={e => setSelectedDate2(e.target.value)}>
                        {measurements.map(m => <option key={`old-${m.id}`} value={m.date}>{m.date}</option>)}
                      </select>
                    </div>
                    <div style={{paddingTop: '25px', fontSize: '20px'}}>➡️</div>
                    <div style={{flex: 1}}>
                      <label style={styles.label}>New Date (Target):</label>
                      <select style={styles.select} value={selectedDate1} onChange={e => setSelectedDate1(e.target.value)}>
                        {measurements.map(m => <option key={`new-${m.id}`} value={m.date}>{m.date}</option>)}
                      </select>
                    </div>
                  </div>

                  {record1.date && record2.date ? (
                    <div style={styles.compareGrid}>
                      <div style={styles.compareRow}>
                        <span style={styles.compareLabel}>Weight:</span>
                        <span style={styles.compareValue}>{record2.weight} kg  →  {record1.weight} kg</span>
                        <span style={styles.compareDiff}>{getDiffUI(record1.weight, record2.weight, 'weight')}</span>
                      </div>
                      <div style={styles.compareRow}>
                        <span style={styles.compareLabel}>Body Fat:</span>
                        <span style={styles.compareValue}>%{record2.bodyfat}  →  %{record1.bodyfat}</span>
                        <span style={styles.compareDiff}>{getDiffUI(record1.bodyfat, record2.bodyfat, 'bodyfat')}</span>
                      </div>
                      <div style={styles.compareRow}>
                        <span style={styles.compareLabel}>Height:</span>
                        <span style={styles.compareValue}>{record2.height} cm  →  {record1.height} cm</span>
                        <span style={styles.compareDiff}>{getDiffUI(record1.height, record2.height, 'height')}</span>
                      </div>
                    </div>
                  ) : (
                    <p style={{textAlign: 'center', color: '#666'}}>Please select two valid dates to compare.</p>
                  )}
                </div>
              )}

              {/* MODE 3: VIEW ALL */}
              {viewMode === 'all' && (
                <div style={styles.tableContainer}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Date</th>
                        <th style={styles.th}>Weight</th>
                        <th style={styles.th}>Body Fat</th>
                        <th style={styles.th}>Activity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {measurements.map((m, index) => (
                        <tr key={index} style={index % 2 === 0 ? styles.trEven : styles.trOdd}>
                          <td style={styles.td}><strong>{m.date}</strong></td>
                          <td style={styles.td}>{m.weight} kg</td>
                          <td style={styles.td}>%{m.bodyfat}</td>
                          <td style={styles.td}>{m.activity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          </>
        )}

        {/* MODAL COMPONENT */}
        <AddMeasurementModal 
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)} 
          onSave={handleSaveNewRecord}
          clientId={clientId}
        />

      </div>
    </div>
  );
}

const styles = {
  mainContainer: { display: 'flex', justifyContent: 'center', padding: '40px 20px', backgroundColor: '#f5f5f5', minHeight: '100vh', fontFamily: "'Inter', Arial, sans-serif" },
  contentContainer: { width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column' },
  header: { backgroundColor: '#fff', padding: '20px', borderRadius: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' },
  pageTitle: { fontSize: '22px', fontWeight: 'bold', color: '#333', margin: 0 },
  subTitle: { fontSize: '13px', color: '#888', fontWeight: 'bold' },
  backButton: { padding: '8px 15px', backgroundColor: '#e0e0e0', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', color: '#333' },
  
  addRecordBtn: { padding: '10px 18px', backgroundColor: '#007AFF', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(0,122,255,0.3)' },

  noDataBox: { backgroundColor: '#fff', padding: '50px 20px', borderRadius: '15px', textAlign: 'center', color: '#666', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' },
  
  tabsContainer: { display: 'flex', gap: '10px', marginBottom: '15px' },
  tab: { flex: 1, padding: '12px', border: 'none', borderRadius: '10px', backgroundColor: '#e0e0e0', color: '#555', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' },
  activeTab: { flex: 1, padding: '12px', border: 'none', borderRadius: '10px', backgroundColor: '#ff9800', color: '#fff', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(255,152,0,0.3)' },
  
  card: { backgroundColor: '#fff', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' },
  controlsRow: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px', backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '10px' },
  compareControlsRow: { display: 'flex', justifyContent: 'space-between', gap: '15px', marginBottom: '25px', backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '10px' },
  label: { fontSize: '14px', fontWeight: 'bold', color: '#555', display: 'block', marginBottom: '5px' },
  select: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '15px', outline: 'none' },
  
  gridContainer: { display: 'flex', flexWrap: 'wrap', gap: '15px' },
  gridItem: { flex: '1 1 calc(50% - 15px)', backgroundColor: '#f0f4f8', padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  gridLabel: { fontSize: '14px', color: '#666', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px' },
  gridValue: { fontSize: '24px', color: '#007AFF', fontWeight: 'bold' },

  compareGrid: { display: 'flex', flexDirection: 'column', gap: '10px' },
  compareRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '10px' },
  compareLabel: { width: '100px', fontWeight: 'bold', color: '#555' },
  compareValue: { flex: 1, textAlign: 'center', fontSize: '16px', color: '#333' },
  compareDiff: { width: '80px', textAlign: 'right' },

  tableContainer: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd', color: '#555' },
  td: { padding: '12px', borderBottom: '1px solid #eee', color: '#333' },
  trEven: { backgroundColor: '#fafafa' },
  trOdd: { backgroundColor: '#fff' },
  centerMsg: { marginTop: '50px', fontSize: '18px', color: '#666', textAlign: 'center' }
};