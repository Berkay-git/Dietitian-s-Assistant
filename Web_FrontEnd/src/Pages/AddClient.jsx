import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AddClient() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    name: '', dob: '', gender: 'Male', medicalReport: '', weight: '', height: '', bodyfat: '', activity: '',
  });

  const updateForm = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleNext = () => {
    if (!formData.name || !formData.dob) {
      alert("Please fill in the required fields (Name, Date of Birth).");
      return;
    }
    setStep(2);
  };

  const handleSubmit = () => {
    console.log("Kayıt:", formData);
    alert("Client successfully added!");
    navigate('/dashboard');
  };

  return (
    <div style={styles.pageBackground}>
      <div style={styles.formCard}>
        
        <button style={styles.topBackButton} onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>

        <div style={styles.stepIndicator}>
            <span style={step === 1 ? styles.activeStep : styles.stepText}>1. Personal Details</span>
            <span style={styles.stepArrow}>→</span>
            <span style={step === 2 ? styles.activeStep : styles.stepText}>2. Body Details</span>
        </div>

        {step === 1 && (
          <div>
            <h2 style={styles.sectionTitle}>Personal Details</h2>
            <label style={styles.label}>Name</label>
            <input style={styles.input} placeholder="e.g. John Doe" value={formData.name} onChange={(e) => updateForm('name', e.target.value)} />
            
            <label style={styles.label}>Date of Birth</label>
            <input style={styles.input} placeholder="DD/MM/YYYY" value={formData.dob} onChange={(e) => updateForm('dob', e.target.value)} />
            
            <label style={styles.label}>Gender</label>
            <div style={styles.genderContainer}>
              {/* MALE BUTONU*/}
              <button 
                style={formData.gender === 'Male' ? styles.maleActive : styles.genderButton} 
                onClick={() => updateForm('gender', 'Male')}
              >
                ♂ Male
              </button>

              {/* FEMALE BUTONU */}
              <button 
                style={formData.gender === 'Female' ? styles.femaleActive : styles.genderButton} 
                onClick={() => updateForm('gender', 'Female')}
              >
                ♀ Female
              </button>
            </div>

            <label style={styles.label}>Medical Report</label>
            <textarea style={{...styles.input, ...styles.textArea}} placeholder="Details..." value={formData.medicalReport} onChange={(e) => updateForm('medicalReport', e.target.value)} />
            
            <button style={styles.greenButton} onClick={handleNext}>Proceed to Body Details →</button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 style={styles.sectionTitle}>Body Details</h2>
            <label style={styles.label}>Weight (kg)</label>
            <input style={styles.input} type="number" placeholder="75" value={formData.weight} onChange={(e) => updateForm('weight', e.target.value)} />
            
            <label style={styles.label}>Height (cm)</label>
            <input style={styles.input} type="number" placeholder="180" value={formData.height} onChange={(e) => updateForm('height', e.target.value)} />
            
            <label style={styles.label}>Bodyfat (%)</label>
            <input style={styles.input} type="number" placeholder="20" value={formData.bodyfat} onChange={(e) => updateForm('bodyfat', e.target.value)} />
            
            <label style={styles.label}>Activity</label>
            <input style={styles.input} placeholder="Active..." value={formData.activity} onChange={(e) => updateForm('activity', e.target.value)} />
            
            <div style={styles.buttonRow}>
                <button style={styles.backButton} onClick={() => setStep(1)}>← Back</button>
                <button style={styles.greenButton} onClick={handleSubmit}>Submit Client ✓</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  pageBackground: {
    width: '100%', minHeight: '100vh', backgroundColor: '#f5f5f5', display: 'flex', justifyContent: 'center', padding: '40px 20px', boxSizing: 'border-box'
  },
  formCard: {
    width: '100%', maxWidth: '600px', backgroundColor: '#fff', borderRadius: '15px', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', height: 'fit-content'
  },
  topBackButton: { background: 'none', border: 'none', color: '#666', cursor: 'pointer', marginBottom: '20px', fontWeight: 'bold', fontSize: '14px', padding: 0, display: 'block' },
  stepIndicator: { display: 'flex', justifyContent: 'center', marginBottom: '30px', color: '#aaa', fontWeight:'bold' },
  activeStep: { color: '#333', textDecoration: 'underline' },
  stepArrow: { margin: '0 10px' },
  sectionTitle: { fontSize: '24px', fontWeight: 'bold', color: '#333', marginBottom: '25px', textAlign: 'center', marginTop: 0 },
  label: { fontSize: '14px', fontWeight: 'bold', color: '#444', marginBottom: '8px', marginTop: '20px', display: 'block' },
  input: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px', boxSizing: 'border-box' },
  textArea: { height: '100px', resize: 'vertical' },
  
  genderContainer: { display: 'flex', gap: '15px' },
  
 
  genderButton: { 
    flex: 1, padding: '12px', border: '1px solid #ddd', backgroundColor: '#f9f9f9', borderRadius: '8px', cursor: 'pointer', color: '#666' 
  },
  
  
  maleActive: { 
    flex: 1, padding: '12px', border: '1px solid #007AFF', backgroundColor: '#e3f2fd', color: '#007AFF', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer' 
  },

  
  femaleActive: { 
    flex: 1, padding: '12px', border: '1px solid #e91e63', backgroundColor: '#fce4ec', color: '#e91e63', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer' 
  },

  greenButton: { width: '100%', padding: '15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '30px', fontSize: '16px' },
  buttonRow: { display: 'flex', gap: '15px', marginTop: '20px' },
  backButton: { flex: 1, padding: '15px', backgroundColor: '#e9ecef', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', color:'#333', marginTop: '0', fontSize: '16px' }
};