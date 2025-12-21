import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function EditClient() {
  const navigate = useNavigate();
  const location = useLocation();
    // Get the existing client data passed from ClientDetails
  const client = location.state || {};

  const [formData, setFormData] = useState({
    goal: client.goal || '', // Note: Goal isn't in DB yet, but we keep it in UI
    weight: client.weight || '',
    height: client.height || '',
    bodyfat: client.bodyfat || '',
    activity: client.activity || '',
    //status: client.status || 'Active'
    medicalReport: client.medicalReport || '',
    // We keep basic info for display, but usually don't edit name here
    name: client.name || ''
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);

    try {
      // 1. Send Update to Backend
      const response = await fetch(`http://localhost:5000/api/dietitian/clients/${client.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weight: formData.weight,
          height: formData.height,
          bodyfat: formData.bodyfat,
          activity: formData.activity,
          medicalReport: formData.medicalReport,
          goal: formData.goal 
        })
      });

      if (response.ok) {
        // 2. SUCCESS: Go back to Details Page
        // We pass the ID so ClientDetails can fetch the NEW updated data
        navigate('/client-details', { state: { id: client.id } });
      } else {
        alert("Failed to update client.");
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("Server error.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.mainContainer}>
      <div style={styles.formCard}>
        <h2 style={styles.title}>Update Details</h2>
        <p style={styles.subtitle}>Edit information for {formData.name}</p>

        <div style={styles.formContent}>
            <label style={styles.label}>🎯 Target Plan / Goal</label>
            <input style={styles.input} placeholder="e.g. Weight Loss..." value={formData.goal} onChange={e => setFormData({...formData, goal: e.target.value})} />

            <label style={styles.label}>Weight (kg)</label>
            <input style={styles.input} type="number" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} />

            <label style={styles.label}>Height (cm)</label>
            <input style={styles.input} type="number" value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} />

            <label style={styles.label}>Body Fat (%)</label>
            <input style={styles.input} type="number" value={formData.bodyfat} onChange={e => setFormData({...formData, bodyfat: e.target.value})} />

            <label style={styles.label}>Activity Status</label>
            <select style={styles.input} value={formData.activity} onChange={e => setFormData({...formData, activity: e.target.value})}>
               <option value="SEDENTARY">SEDENTARY</option>
               <option value="LIGHT">LIGHT</option>
               <option value="MODERATE">MODERATE</option>
               <option value="HEAVY">HEAVY</option>
               <option value="ATHELETE">ATHELETE</option>
            </select>

            <label style={styles.label}>Medical Report</label>
            <textarea style={styles.textArea} value={formData.medicalReport} onChange={e => setFormData({...formData, medicalReport: e.target.value})} />

            <div style={styles.buttonRow}>
                <button style={styles.cancelButton} onClick={() => navigate(-1)}>Cancel</button>
                <button style={styles.saveButton} onClick={handleSave} disabled={isLoading}>
                   {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  mainContainer: { display: 'flex', justifyContent: 'center', padding: '40px 20px', backgroundColor: '#f5f5f5', minHeight: '100vh', fontFamily: 'Arial, sans-serif' },
  formCard: { width: '100%', maxWidth: '500px', backgroundColor: '#fff', borderRadius: '15px', padding: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' },
  title: { fontSize: '24px', fontWeight: 'bold', color: '#333', margin: '0 0 5px 0', textAlign: 'center' },
  subtitle: { fontSize: '16px', color: '#666', marginBottom: '25px', textAlign: 'center' },
  formContent: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: '14px', fontWeight: 'bold', color: '#444', marginBottom: '8px', marginTop: '15px', display: 'block' },
  input: { width: '100%', padding: '12px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px', color: '#333', boxSizing: 'border-box', outline: 'none' },
  textArea: { width: '100%', height: '80px', padding: '12px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px', color: '#333', boxSizing: 'border-box', outline: 'none', fontFamily: 'Arial, sans-serif', resize: 'vertical' },
  buttonRow: { display: 'flex', justifyContent: 'space-between', gap: '15px', marginTop: '30px' },
  cancelButton: { flex: 1, padding: '15px', backgroundColor: 'transparent', color: '#666', border: '1px solid #ddd', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' },
  saveButton: { flex: 2, padding: '15px', backgroundColor: '#007AFF', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }
};