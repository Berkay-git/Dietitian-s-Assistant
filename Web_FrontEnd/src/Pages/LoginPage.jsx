import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// --- IMAGE IMPORTS ---
// Bringing in our logo from the assets folder
import logo from '../assets/logo.png'; 

export default function LoginPage() {
  const navigate = useNavigate();

  // --- BACKEND & FORM STATES ---
  // Keeping track of what the user types and the loading status
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // --- UI STATES ---
  // Controls whether the fruits cover their eyes or not
  const [showPassword, setShowPassword] = useState(false);
  const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Talking to the backend to authenticate the dietitian
      const response = await fetch('http://localhost:5000/api/dietitian/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          user_type: 'dietitian'
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Storing the token so the user stays logged in
        localStorage.setItem('token', data.token);
        localStorage.setItem('user_id', data.user.id);
        localStorage.setItem('user_name', data.user.name);
        navigate('/dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      setError('Server error. Is the backend running?');
    } finally {
      setIsLoading(false);
    }
  };

  // --- MOUSE TRACKING LOGIC ---
  // Calculates where the eyes should look based on the cursor position
  useEffect(() => {
    const handleMouseMove = (e) => {
      // If the password is shown (eyes covered), don't track the mouse
      if (showPassword) return;

      const limit = 8; // Limits how far the pupils can move
      const x = Math.min(Math.max((e.clientX / window.innerWidth) * limit * 2 - limit, -limit), limit);
      const y = Math.min(Math.max((e.clientY / window.innerHeight) * limit * 2 - limit, -limit), limit);
      setEyePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [showPassword]);

  // --- STYLES ---
  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      // Using a radial gradient for that modern, deep look
      background: 'radial-gradient(circle at 10% 20%, rgb(0, 107, 141) 0%, rgb(0, 69, 94) 90%)',
      fontFamily: "'Inter', sans-serif",
      padding: '20px'
    },
    wrapper: {
      display: 'flex',
      width: '100%',
      maxWidth: '900px',
      backgroundColor: '#fff',
      borderRadius: '24px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      overflow: 'hidden',
      flexWrap: 'wrap'
    },
    leftSide: {
      flex: 1,
      minWidth: '320px',
      backgroundColor: '#e0f2f1', 
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      padding: '20px',
      overflow: 'hidden'
    },
    rightSide: {
      flex: 1.2,
      minWidth: '320px',
      padding: '50px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      backgroundColor: '#ffffff'
    },
    logo: {
      width: '100%',
      maxWidth: '250px',
      height: 'auto',
      display: 'block',
      margin: '0 auto 30px auto',
      objectFit: 'contain',
      filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.15))' 
    },
    title: { 
      color: '#1e293b', marginBottom: '10px', fontSize: '28px', 
      fontWeight: '800', textAlign: 'center', letterSpacing: '-0.5px' 
    },
    subtitle: { 
      color: '#64748b', marginBottom: '30px', textAlign: 'center', fontSize: '15px' 
    },
    inputGroup: { marginBottom: '20px', position: 'relative' },
    label: { display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '14px' },
    input: {
      width: '100%', padding: '14px 16px', border: '2px solid #e2e8f0',
      borderRadius: '12px', boxSizing: 'border-box', fontSize: '16px',
      backgroundColor: '#f8fafc', color: '#334155',
      outline: 'none', transition: 'border-color 0.2s'
    },
    passwordInput: {
      width: '100%', padding: '14px 50px 14px 16px', border: '2px solid #e2e8f0',
      borderRadius: '12px', boxSizing: 'border-box', fontSize: '16px',
      backgroundColor: '#f8fafc', color: '#334155',
      outline: 'none', transition: 'border-color 0.2s'
    },
    eyeButton: {
      position: 'absolute', right: '15px', top: '40px',
      background: 'none', border: 'none', cursor: 'pointer',
      color: '#64748b', padding: '5px'
    },
    button: {
      width: '100%', padding: '16px', 
      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', 
      color: 'white', border: 'none', borderRadius: '12px', 
      fontSize: '16px', fontWeight: '700', cursor: 'pointer', marginTop: '10px',
      boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)',
      transition: 'transform 0.1s'
    },
    errorBox: {
      backgroundColor: '#fee2e2', color: '#991b1b', padding: '12px',
      borderRadius: '8px', marginBottom: '20px', fontSize: '14px', 
      border: '1px solid #fecaca', textAlign: 'center'
    },
    linkText: { marginTop: '24px', fontSize: '14px', color: '#64748b', textAlign: 'center' },
    link: { color: '#2563eb', cursor: 'pointer', fontWeight: '700' }
  };

  // --- ICONS ---
  const EyeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
  );
  const EyeOffIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M1 1l22 22"></path><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"></path></svg>
  );

  // --- CUSTOM SVG COMPONENT: HEALTHY TRIO ---
  // A custom drawing of Pear, Broccoli, and Apple to avoid copyright issues.
  const HealthyTrio = () => (
    <svg width="340" height="250" viewBox="0 0 340 250" style={{ overflow: 'visible' }}>
      
      {/* --- FRUIT BODIES --- */}
      
      {/* Pear (Left) */}
      <g transform="translate(20, 50)">
         <path d="M50,150 C20,150 0,110 15,70 C25,40 45,30 50,10 C55,30 75,40 85,70 C100,110 80,150 50,150 Z" fill="#d4e157" stroke="#c0ca33" strokeWidth="3"/>
         <path d="M50,10 L50,0 M50,5 Q65,0 60,15" stroke="#795548" strokeWidth="3" fill="none" strokeLinecap="round"/>
         <path d="M50,5 Q35,0 40,15 Q45,25 50,5" fill="#aed581" />
         <ellipse cx="35" cy="85" rx="10" ry="12" fill="white" />
         <ellipse cx="65" cy="85" rx="10" ry="12" fill="white" />
         {/* Smiling mouth */}
         <path d="M40,105 Q50,115 60,105" stroke="#263238" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>

      {/* Broccoli (Middle) */}
      <g transform="translate(130, 40)">
         <path d="M40,160 C30,160 25,120 30,100 C35,80 45,80 50,80 C55,80 65,80 70,100 C75,120 70,160 60,160 Z" fill="#aed581" stroke="#9ccc65" strokeWidth="3"/>
         <circle cx="30" cy="70" r="25" fill="#66bb6a" stroke="#43a047" strokeWidth="3"/>
         <circle cx="70" cy="70" r="25" fill="#66bb6a" stroke="#43a047" strokeWidth="3"/>
         <circle cx="50" cy="50" r="30" fill="#66bb6a" stroke="#43a047" strokeWidth="3"/>
         <ellipse cx="40" cy="110" rx="8" ry="10" fill="white" />
         <ellipse cx="60" cy="110" rx="8" ry="10" fill="white" />
         {/* Smiling mouth */}
         <path d="M42,128 Q50,135 58,128" stroke="#263238" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>

      {/* Apple (Right) */}
      <g transform="translate(240, 60)">
         <path d="M50,140 C20,140 10,100 10,70 C10,40 30,30 50,40 C70,30 90,40 90,70 C90,100 80,140 50,140 Z M50,40 Q50,50 50,40" fill="#ef5350" stroke="#e53935" strokeWidth="3"/>
         <path d="M50,40 L50,25" stroke="#795548" strokeWidth="3" strokeLinecap="round"/>
         <path d="M50,30 Q70,20 65,40 Q60,50 50,30" fill="#66bb6a" />
         <ellipse cx="35" cy="80" rx="10" ry="12" fill="white" />
         <ellipse cx="65" cy="80" rx="10" ry="12" fill="white" />
         {/* Smiling mouth */}
         <path d="M40,100 Q50,110 60,100" stroke="#263238" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>


      {/* --- PUPILS (ANIMATED) --- */}
      {/* These move according to eyePosition state */}
      <g style={{ 
          transform: `translate(${eyePosition.x}px, ${eyePosition.y}px)`, 
          transition: 'transform 0.1s ease-out' 
      }}>
         {/* Pear Pupils */}
         <circle cx="55" cy="135" r="5" fill="#263238" />
         <circle cx="85" cy="135" r="5" fill="#263238" />
         {/* Broccoli Pupils */}
         <circle cx="170" cy="150" r="4" fill="#263238" />
         <circle cx="190" cy="150" r="4" fill="#263238" />
         {/* Apple Pupils */}
         <circle cx="275" cy="140" r="5" fill="#263238" />
         <circle cx="305" cy="140" r="5" fill="#263238" />
      </g>


      {/* --- HANDS / LEAVES (COVER EYES) --- */}
      {/* These fade in and move up when the password is shown */}
      <g style={{ 
        transform: showPassword ? 'translateY(0)' : 'translateY(150px)', 
        opacity: showPassword ? 1 : 0, 
        transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }}>
        {/* Pear Hands */}
        <g transform="translate(20, 50)">
            <circle cx="35" cy="85" r="15" fill="#d4e157" stroke="#c0ca33" strokeWidth="2" />
            <circle cx="65" cy="85" r="15" fill="#d4e157" stroke="#c0ca33" strokeWidth="2" />
        </g>

        {/* Broccoli Hands */}
        <g transform="translate(130, 40)">
             <circle cx="40" cy="110" r="12" fill="#66bb6a" stroke="#43a047" strokeWidth="2" />
             <circle cx="60" cy="110" r="12" fill="#66bb6a" stroke="#43a047" strokeWidth="2" />
        </g>

        {/* Apple Hands */}
        <g transform="translate(240, 60)">
            <circle cx="35" cy="80" r="15" fill="#ef5350" stroke="#e53935" strokeWidth="2" />
            <circle cx="65" cy="80" r="15" fill="#ef5350" stroke="#e53935" strokeWidth="2" />
        </g>
      </g>

    </svg>
  );

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        
        {/* LEFT SIDE: Artwork */}
        <div style={styles.leftSide}>
            <HealthyTrio />
        </div>

        {/* RIGHT SIDE: Login Form */}
        <div style={styles.rightSide}>
          
          <img 
            src={logo} 
            alt="Dietitian Logo" 
            style={styles.logo} 
          />
          
          <h1 style={styles.title}>Dietitian Assistant</h1>
          <p style={styles.subtitle}>Welcome back! Please login to your account.</p>

          {error && <div style={styles.errorBox}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                placeholder="dietitian@example.com"
                required 
                style={styles.input}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              
              <input 
                type={showPassword ? "text" : "password"} 
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
                placeholder="Enter your password"
                required 
                style={styles.passwordInput}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
              
              <button 
                type="button" 
                style={styles.eyeButton}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>

            </div>

            <button 
              type="submit" 
              style={styles.button} 
              disabled={isLoading}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <p style={styles.linkText}>
            Don't have an account? 
            <span style={styles.link} onClick={() => navigate('/register')}> Create one</span>
          </p>
        </div>
      </div>
    </div>
  );
}