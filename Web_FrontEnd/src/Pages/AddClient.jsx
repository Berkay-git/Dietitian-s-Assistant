import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AddClient() {
  const navigate = useNavigate();
  
  // Track which step we are on (1, 2, or 3)
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Store ALL form data in one big state object
  const [formData, setFormData] = useState({
    // Step 1
    name: '',
    dob: '',
    gender: 'Female', // default value -> female
    // Step 2
    weight: '',
    height: '',
    bodyFat: '',
    activityStatus: 'SEDENTARY',
    medicalDetails: '',
    // Step 3
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = (e) => {   {/*go to next step*/}
    e.preventDefault();
    setStep(prev => prev + 1);
  };

  const handleBack = (e) => {   {/*go to previous step*/}
    e.preventDefault();
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {   {/*submit client form*/}
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const dietitianId = localStorage.getItem('user_id');
    if (!dietitianId) {
      setError("You must be logged in.");
      setIsLoading(false);
      return;
    }

    {/*here we assign dietitianID to the client, now clinet can be reached only by this dietitian*/}
    try {
      const response = await fetch('http://localhost:5000/api/dietitian/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...formData,
          dietitian_id: dietitianId // Sending the ID here
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert("Client Created Successfully! 🎉");
        navigate('/dashboard');
      } else {
        setError(data.error || "Failed to add client");
      }
    } catch (err) {
      console.error(err);
      setError("Server connection error");
    } finally {
      setIsLoading(false);
    }
  };

  const styles = {
    container: { minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5', fontFamily: 'Arial, sans-serif' },
    card: { backgroundColor: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', width: '100%', maxWidth: '500px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
    title: { margin: 0, color: '#333' },
  
    stepIndicator: { fontSize: '14px', color: '#007AFF', fontWeight: 'bold', marginBottom:'20px' },
    inputGroup: { marginBottom: '15px' },
    label: { display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555', fontSize: '14px' },
    input: { width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' },
    textarea: { width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box', minHeight:'80px', fontFamily:'Arial' },
    select: { width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box', backgroundColor: 'white' },
    
    //buttons
    btnRow: { display:'flex', gap:'10px', marginTop:'20px' },
    primaryBtn: { flex:1, padding: '12px', backgroundColor: '#007AFF', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' },
    secondaryBtn: { flex:1, padding: '12px', backgroundColor: '#e0e0e0', color: '#333', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' },
    errorBox: { backgroundColor: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '6px', marginBottom: '15px', textAlign: 'center' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Add New Client</h2>
          <button style={{background:'none', border:'none', fontSize:'20px', cursor:'pointer'}} onClick={() => navigate('/dashboard')}>✕</button>
        </div>

        <div style={styles.stepIndicator}>Step {step} of 3</div>
        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={step === 3 ? handleSubmit : handleNext}>
          
          {/* --- STEP 1: PERSONAL INFO --- */}
          {step === 1 && (
            <>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Full Name</label>
                <input name="name" type="text" placeholder="e.g. Name Surname" required value={formData.name} onChange={handleChange} style={styles.input} />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Date of Birth</label>
                <input name="dob" type="date" required value={formData.dob} onChange={handleChange} style={styles.input} />
               </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} style={styles.select}>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                </select>
             </div>
              
              <div style={styles.btnRow}>
                 <button type="submit" style={styles.primaryBtn}>Enter Body Details →</button>
              </div>
            </>
          )}
          
          {/* --- STEP 2: BODY & MEDICAL INFO --- */}
          {step === 2 && (
            <>
              <div style={{display:'flex', gap:'10px'}}>
                 <div style={{...styles.inputGroup, flex:1}}>
                    <label style={styles.label}>Weight (kg)</label>
                    <input name="weight" type="number" placeholder="70.5" required value={formData.weight} onChange={handleChange} style={styles.input} />
                 </div>
                 <div style={{...styles.inputGroup, flex:1}}>
                    <label style={styles.label}>Height (cm)</label>
                    <input name="height" type="number" placeholder="175" required value={formData.height} onChange={handleChange} style={styles.input} />
                 </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Body Fat (%)</label>
                <input name="bodyFat" type="number" placeholder="e.g. 18.5" value={formData.bodyFat} onChange={handleChange} style={styles.input} />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Activity Status</label>
                <select name="activityStatus" value={formData.activityStatus} onChange={handleChange} style={styles.select}>
                  <option value="SEDENTARY">Sedentary (Little to no exercise)</option>
                  <option value="LIGHT">Light (Exercise 1-3 days/week)</option>
                  <option value="MODERATE">Moderate (Exercise 3-5 days/week)</option>
                  <option value="HEAVY">Heavy (Exercise 6-7 days/week)</option>
                  <option value="ATHELETE">Athlete (Physical job or 2x training)</option>
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Medical Details / Notes</label>
                <textarea name="medicalDetails" placeholder="Allergies, Diabetes, Injuries..." value={formData.medicalDetails} onChange={handleChange} style={styles.textarea} />
              </div>

              <div style={styles.btnRow}>
                 <button type="button" onClick={handleBack} style={styles.secondaryBtn}>← Back</button>
                 <button type="submit" style={styles.primaryBtn}>Proceed to Login Details →</button>
              </div>
            </>
          )}

          {/* --- STEP 3: ACCOUNT INFO --- */}
          {step === 3 && (
            <>
              <div style={{backgroundColor:'#e3f2fd', padding:'10px', borderRadius:'8px', marginBottom:'15px', color:'#0d47a1', fontSize:'14px'}}>
                ℹ️ The client will use these credentials to log into the mobile app.
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Client Email</label>
                <input name="email" type="email" placeholder="client@example.com" required value={formData.email} onChange={handleChange} style={styles.input} />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Temporary Password</label>
                <input name="password" type="text" placeholder="e.g. Welcome2025!" required value={formData.password} onChange={handleChange} style={styles.input} />
              </div>

              <div style={styles.btnRow}>
                 <button type="button" onClick={handleBack} style={styles.secondaryBtn}>← Back</button>
                 <button type="submit" style={styles.primaryBtn} disabled={isLoading}>
                    {isLoading ? 'Creating Client...' : 'Finish & Add Client ✅'}
                 </button>
              </div>
            </>
          )}

        </form>
      </div>
    </div>
  );
}