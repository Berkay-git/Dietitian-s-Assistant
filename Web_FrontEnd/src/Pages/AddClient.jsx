import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// --- CUSTOM SVG: THE HEALTHY TRIO (Peeking Version) ---
// Same cute SVG header we used before
const HealthyTrioHeader = () => (
  <svg width="200" height="100" viewBox="0 0 340 160" style={{ display: 'block', margin: '0 auto -10px auto', overflow: 'visible', zIndex: 0, position: 'relative' }}>
     <defs>
      <linearGradient id="appleGrad" x1="0.5" y1="0" x2="0.5" y2="1"><stop offset="0" stopColor="#ff5252"/><stop offset="1" stopColor="#c62828"/></linearGradient>
      <linearGradient id="brocGrad" x1="0.5" y1="0" x2="0.5" y2="1"><stop offset="0" stopColor="#66bb6a"/><stop offset="1" stopColor="#2e7d32"/></linearGradient>
      <linearGradient id="pearGrad" x1="0.5" y1="0" x2="0.5" y2="1"><stop offset="0" stopColor="#d4e157"/><stop offset="1" stopColor="#9e9d24"/></linearGradient>
     </defs>

      {/* Pear (Left) */}
      <g transform="translate(20, 50) rotate(-10)">
         <path d="M50,150 C20,150 0,110 15,70 C25,40 45,30 50,10 C55,30 75,40 85,70 C100,110 80,150 50,150 Z" fill="url(#pearGrad)" stroke="#c0ca33" strokeWidth="3"/>
         <path d="M50,10 L50,0 M50,5 Q65,0 60,15" stroke="#795548" strokeWidth="3" fill="none" strokeLinecap="round"/>
         <path d="M50,5 Q35,0 40,15 Q45,25 50,5" fill="#aed581" />
         <circle cx="35" cy="85" r="4" fill="#263238" />
         <circle cx="65" cy="85" r="4" fill="#263238" />
         <path d="M40,105 Q50,115 60,105" stroke="#263238" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>

      {/* Broccoli (Middle) */}
      <g transform="translate(130, 30)">
         <path d="M40,160 C30,160 25,120 30,100 C35,80 45,80 50,80 C55,80 65,80 70,100 C75,120 70,160 60,160 Z" fill="url(#brocGrad)" stroke="#9ccc65" strokeWidth="3"/>
         <circle cx="30" cy="70" r="25" fill="#66bb6a" stroke="#43a047" strokeWidth="3"/>
         <circle cx="70" cy="70" r="25" fill="#66bb6a" stroke="#43a047" strokeWidth="3"/>
         <circle cx="50" cy="50" r="30" fill="#66bb6a" stroke="#43a047" strokeWidth="3"/>
         <circle cx="40" cy="110" r="3" fill="white" /> <circle cx="40" cy="110" r="1.5" fill="black" />
         <circle cx="60" cy="110" r="3" fill="white" /> <circle cx="60" cy="110" r="1.5" fill="black" />
         <path d="M42,128 Q50,135 58,128" stroke="#263238" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>

      {/* Apple (Right) */}
      <g transform="translate(240, 50) rotate(10)">
         <path d="M50,140 C20,140 10,100 10,70 C10,40 30,30 50,40 C70,30 90,40 90,70 C90,100 80,140 50,140 Z M50,40 Q50,50 50,40" fill="url(#appleGrad)" stroke="#e53935" strokeWidth="3"/>
         <path d="M50,40 L50,25" stroke="#795548" strokeWidth="3" strokeLinecap="round"/>
         <path d="M50,30 Q70,20 65,40 Q60,50 50,30" fill="#66bb6a" />
         <circle cx="35" cy="80" r="4" fill="#263238" />
         <circle cx="65" cy="80" r="4" fill="#263238" />
         <path d="M40,100 Q50,110 60,100" stroke="#263238" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
  </svg>
);

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

  const handleNext = (e) => {   /*go to next step*/
    e.preventDefault();
    setStep(prev => prev + 1);
  };

  const handleBack = (e) => {   /*go to previous step*/
    e.preventDefault();
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {   /*submit client form*/
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const dietitianId = localStorage.getItem('user_id');
    if (!dietitianId) {
      setError("You must be logged in.");
      setIsLoading(false);
      return;
    }

    /*here we assign dietitianID to the client, now clinet can be reached only by this dietitian*/
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

  // --- STYLES ---
  const styles = {
    container: {
      minHeight: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      background: 'radial-gradient(circle at 10% 20%, rgb(0, 107, 141) 0%, rgb(0, 69, 94) 90%)',
      fontFamily: "'Inter', sans-serif",
      padding: '20px'
    },
    // Main card wrapper
    card: {
      backgroundColor: 'white', 
      padding: '40px', 
      borderRadius: '24px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)', 
      width: '100%', 
      maxWidth: '500px',
      position: 'relative',
      zIndex: 10 
    },
    header: { 
      textAlign: 'center', 
      marginBottom: '20px' 
    },
    title: { 
      margin: 0, 
      color: '#1e293b', 
      fontSize: '24px', 
      fontWeight: '800' 
    },
    closeBtn: { 
      position: 'absolute',
      top: '20px',
      right: '20px',
      background: '#f1f5f9', 
      border: 'none', 
      width: '32px', height: '32px',
      borderRadius: '50%',
      fontSize: '16px', 
      cursor: 'pointer', 
      color: '#64748b',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all 0.2s'
    },
    
    // --- PROGRESS BAR STYLES ---
    progressContainer: {
      width: '100%',
      height: '6px',
      backgroundColor: '#f1f5f9',
      borderRadius: '3px',
      marginBottom: '30px',
      overflow: 'hidden'
    },
    progressBar: {
      height: '100%',
      backgroundColor: '#007AFF',
      width: `${(step / 3) * 100}%`, // Dynamic width based on step
      transition: 'width 0.3s ease-in-out'
    },
    stepText: {
      textAlign: 'center',
      fontSize: '12px',
      color: '#64748b',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      marginTop: '5px'
    },

    inputGroup: { marginBottom: '20px' },
    label: { 
      display: 'block', marginBottom: '8px', fontWeight: '600', 
      color: '#475569', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' 
    },
    input: { 
      width: '100%', padding: '14px', borderRadius: '12px', 
      border: '2px solid #e2e8f0', boxSizing: 'border-box', fontSize: '15px',
      backgroundColor: '#f8fafc', color: '#334155', outline: 'none',
      transition: 'border-color 0.2s' 
    },
    textarea: { 
      width: '100%', padding: '14px', borderRadius: '12px', 
      border: '2px solid #e2e8f0', boxSizing: 'border-box', minHeight:'100px', 
      fontFamily:"'Inter', sans-serif", fontSize:'15px',
      backgroundColor: '#f8fafc', color: '#334155', outline: 'none'
    },
    select: { 
      width: '100%', padding: '14px', borderRadius: '12px', 
      border: '2px solid #e2e8f0', boxSizing: 'border-box', 
      backgroundColor: '#f8fafc', color: '#334155', fontSize:'15px', outline:'none' 
    },
    
    // Buttons
    btnRow: { display:'flex', gap:'15px', marginTop:'30px' },
    primaryBtn: { 
      flex:1, padding: '16px', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', 
      color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '700', 
      cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)', transition: 'transform 0.1s' 
    },
    secondaryBtn: { 
      flex:1, padding: '16px', backgroundColor: '#f1f5f9', 
      color: '#475569', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '700', 
      cursor: 'pointer', transition: 'background 0.2s' 
    },
    errorBox: { 
      backgroundColor: '#fee2e2', color: '#991b1b', padding: '12px', 
      borderRadius: '8px', marginBottom: '20px', textAlign: 'center', fontSize: '14px', border: '1px solid #fecaca' 
    },
    infoBox: {
        backgroundColor: '#e0f2f1', color: '#00695c', padding: '15px',
        borderRadius: '12px', marginBottom: '20px', fontSize: '14px',
        border: '1px solid #b2dfdb', display: 'flex', gap: '10px', alignItems: 'center'
    }
  };

  return (
    <div style={styles.container}>
      
      {/* Wrapper for stacking SVG */}
      <div style={{ position: 'relative', width: '100%', maxWidth: '500px' }}>
        
        {/* Cute Header SVG */}
        <HealthyTrioHeader />

        <div style={styles.card}>
          <div style={styles.header}>
            <h2 style={styles.title}>Add New Client</h2>
            <button 
                style={styles.closeBtn} 
                onClick={() => navigate('/dashboard')}
                onMouseEnter={(e) => e.target.style.background = '#e2e8f0'}
                onMouseLeave={(e) => e.target.style.background = '#f1f5f9'}
            >✕</button>
          </div>

          {/* VISUAL PROGRESS BAR */}
          <div>
              <div style={styles.progressContainer}>
                  <div style={styles.progressBar}></div>
              </div>
              <p style={styles.stepText}>Step {step} of 3</p>
          </div>

          {error && <div style={styles.errorBox}>{error}</div>}

          <form onSubmit={step === 3 ? handleSubmit : handleNext}>
            
            {/* --- STEP 1: PERSONAL INFO --- */}
            {step === 1 && (
              <>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Full Name</label>
                  <input name="name" type="text" placeholder="e.g. Name Surname" required value={formData.name} onChange={handleChange} style={styles.input} 
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Date of Birth</label>
                  <input name="dob" type="date" required value={formData.dob} onChange={handleChange} style={styles.input} 
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  />
                 </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} style={styles.select}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </select>
                </div>
                
                <div style={styles.btnRow}>
                   <button type="submit" style={styles.primaryBtn}
                     onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                   >
                       Next: Body Details →
                   </button>
                </div>
              </>
            )}
            
            {/* --- STEP 2: BODY & MEDICAL INFO --- */}
            {step === 2 && (
              <>
                <div style={{display:'flex', gap:'15px'}}>
                   <div style={{...styles.inputGroup, flex:1}}>
                      <label style={styles.label}>Weight (kg)</label>
                      <input name="weight" type="number" placeholder="70.5" required value={formData.weight} onChange={handleChange} style={styles.input} 
                        onFocus={(e) => e.target.style.borderColor = '#3b82f6'} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                      />
                   </div>
                   <div style={{...styles.inputGroup, flex:1}}>
                      <label style={styles.label}>Height (cm)</label>
                      <input name="height" type="number" placeholder="175" required value={formData.height} onChange={handleChange} style={styles.input} 
                        onFocus={(e) => e.target.style.borderColor = '#3b82f6'} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                      />
                   </div>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Body Fat (%)</label>
                  <input name="bodyFat" type="number" placeholder="e.g. 18.5" value={formData.bodyFat} onChange={handleChange} style={styles.input} 
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Activity Status</label>
                  <select name="activityStatus" value={formData.activityStatus} onChange={handleChange} style={styles.select}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  >
                    <option value="SEDENTARY">Sedentary (Little to no exercise)</option>
                    <option value="LIGHT">Light (Exercise 1-3 days/week)</option>
                    <option value="MODERATE">Moderate (Exercise 3-5 days/week)</option>
                    <option value="HEAVY">Heavy (Exercise 6-7 days/week)</option>
                    <option value="ATHELETE">Athlete (Physical job or 2x training)</option>
                  </select>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Medical Details / Notes</label>
                  <textarea name="medicalDetails" placeholder="Allergies, Diabetes, Injuries..." value={formData.medicalDetails} onChange={handleChange} style={styles.textarea} 
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  />
                </div>

                <div style={styles.btnRow}>
                   <button type="button" onClick={handleBack} style={styles.secondaryBtn}>← Back</button>
                   <button type="submit" style={styles.primaryBtn}
                     onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                   >
                       Next: Login Info →
                   </button>
                </div>
              </>
            )}

            {/* --- STEP 3: ACCOUNT INFO --- */}
            {step === 3 && (
              <>
                <div style={styles.infoBox}>
                  <span>ℹ️</span>
                  <span>The client will use these credentials to log into the mobile app.</span>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Client Email</label>
                  <input name="email" type="email" placeholder="client@example.com" required value={formData.email} onChange={handleChange} style={styles.input} 
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Temporary Password</label>
                  <input name="password" type="text" placeholder="e.g. Welcome2025!" required value={formData.password} onChange={handleChange} style={styles.input} 
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  />
                </div>

                <div style={styles.btnRow}>
                   <button type="button" onClick={handleBack} style={styles.secondaryBtn}>← Back</button>
                   <button type="submit" style={styles.primaryBtn} disabled={isLoading}
                     onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                   >
                      {isLoading ? 'Creating Client...' : 'Finish & Add Client ✅'}
                   </button>
                </div>
              </>
            )}

          </form>
        </div>
      </div>
    </div>
  );
}