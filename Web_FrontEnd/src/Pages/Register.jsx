import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// --- IMAGE IMPORTS ---
import logo from '../assets/logo.png'; 

// This is our custom SVG component drawn with code to avoid copyright issues.
// It replaces the traditional wings/ball with our fruits (Apple, Broccoli, Pear).
const NewCaduceusSVG = ({ style }) => (
  <svg 
    width="280" 
    height="280" 
    viewBox="0 0 200 200" 
    style={{ overflow: 'visible', ...style }}
  >
    <defs>
      {/* Gradients for the rod, fruits, and snakes */}
      <linearGradient id="medGrad" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#004d40" /><stop offset="100%" stopColor="#4db6ac" /></linearGradient>
      <linearGradient id="appleGrad" x1="0.5" y1="0" x2="0.5" y2="1"><stop offset="0" stopColor="#ff5252"/><stop offset="1" stopColor="#c62828"/></linearGradient>
      <linearGradient id="brocGrad" x1="0.5" y1="0" x2="0.5" y2="1"><stop offset="0" stopColor="#66bb6a"/><stop offset="1" stopColor="#2e7d32"/></linearGradient>
      <linearGradient id="pearGrad" x1="0.5" y1="0" x2="0.5" y2="1"><stop offset="0" stopColor="#d4e157"/><stop offset="1" stopColor="#9e9d24"/></linearGradient>
      <linearGradient id="stemGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#795548"/><stop offset="1" stopColor="#5d4037"/></linearGradient>

      {/* Adding a soft shadow to make it pop out a bit */}
      <filter id="softShadow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur"/>
        <feOffset in="blur" dx="0" dy="4" result="offsetBlur"/>
        <feComponentTransfer in="offsetBlur"><feFuncA type="linear" slope="0.3"/></feComponentTransfer>
        <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>

    {/* Main Drawing Group with Shadow */}
    <g filter="url(#softShadow)">

        {/* 1. THE ROD (Center Pillar) */}
        <rect x="96" y="60" width="8" height="130" rx="4" fill="url(#medGrad)" />
        <path d="M96,185 L104,185 L100,200 Z" fill="url(#medGrad)" />

        {/* 2. THE SNAKES (Wrapped around the rod) */}
        {/* Left Snake */}
        <path d="M96,170 C70,150 70,120 96,100 C120,80 110,60 90,55" fill="none" stroke="url(#medGrad)" strokeWidth="7" strokeLinecap="round"/>
        <path d="M92,56 Q80,50 85,38 Q95,35 102,42 Z" fill="url(#medGrad)"/>
        <circle cx="90" cy="44" r="1.5" fill="white"/>

        {/* Right Snake */}
        <path d="M104,170 C130,150 130,120 104,100 C80,80 90,60 110,55" fill="none" stroke="url(#medGrad)" strokeWidth="7" strokeLinecap="round"/>
        <path d="M108,56 Q120,50 115,38 Q105,35 98,42 Z" fill="url(#medGrad)"/>
        <circle cx="110" cy="44" r="1.5" fill="white"/>

        {/* 3. THE FRUIT CLUSTER (Top part) */}
        <g transform="translate(100, 35)">
            {/* Broccoli sitting in the back */}
            <g transform="translate(0, -5)">
                <circle cx="0" cy="0" r="14" fill="url(#brocGrad)"/>
                <circle cx="-10" cy="8" r="11" fill="url(#brocGrad)"/>
                <circle cx="10" cy="8" r="11" fill="url(#brocGrad)"/>
            </g>

            {/* Apple on the left */}
            <g transform="translate(-28, 10) rotate(-15)">
                <path d="M0,15 C-12,15 -18,5 -15,-5 C-12,-18 0,-18 0,-10 C0,-18 12,-18 15,-5 C18,5 12,15 0,15 Z" fill="url(#appleGrad)"/>
                <path d="M0,-10 L0,-18" stroke="url(#stemGrad)" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M0,-18 Q8,-22 10,-12" fill="none" stroke="#43a047" strokeWidth="2"/>
            </g>

            {/* Pear on the right */}
            <g transform="translate(28, 10) rotate(15)">
                <path d="M0,18 C-10,18 -16,8 -14,-5 C-12,-15 -5,-20 0,-20 C5,-20 12,-15 14,-5 C16,8 10,18 0,18 Z" fill="url(#pearGrad)"/>
                <path d="M0,-20 L0,-28" stroke="url(#stemGrad)" strokeWidth="2.5" strokeLinecap="round"/>
            </g>
        </g>
    </g>
  </svg>
);

export default function Register() {
  const navigate = useNavigate();
  
  // Storing form inputs here to send them to the backend later
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // These booleans track if the password meets our security rules (length, upper, etc.)
  const [validations, setValidations] = useState({
    length: false, upper: false, lower: false, number: false, match: false,
  });

  // Simple handler to update state when user types in any input field
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // This runs automatically every time the password fields change.
  // It checks the rules in real-time so we can show green ticks or red dots.
  useEffect(() => {
    const { password, confirmPassword } = formData;
    setValidations({
      length: password.length >= 8 && password.length<=14,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /\d/.test(password),
      match: password !== '' && password === confirmPassword,
    });
  }, [formData.password, formData.confirmPassword]);

  // Only enable the register button if all rules are met and fields aren't empty
  const isFormValid = Object.values(validations).every(Boolean) && formData.name && formData.email;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return; 

    setError('');
    setIsLoading(true);

    try {
      // Hitting the Flask backend API to create a new dietitian user
      const response = await fetch('http://localhost:5000/api/dietitian/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registration Successful! Please login.");
        navigate('/'); // Redirect to login page on success
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Server error. Is the backend running?');
    } finally {
      setIsLoading(false);
    }
  };

  // --- STYLES ---
  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 10% 20%, rgb(0, 107, 141) 0%, rgb(0, 69, 94) 90%)',
      fontFamily: "'Inter', sans-serif",
      padding: '20px'
    },
    wrapper: {
      display: 'flex',
      width: '100%',
      maxWidth: '1000px',
      backgroundColor: '#fff',
      borderRadius: '24px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      overflow: 'hidden',
      flexWrap: 'wrap'
    },
    leftSide: {
      flex: 1,
      minWidth: '320px',
      background: 'linear-gradient(135deg, #e0f2f1 0%, #b2dfdb 100%)', 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      padding: '40px',
      overflow: 'hidden'
    },
    rightSide: {
      flex: 1.3,
      minWidth: '350px',
      padding: '50px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      backgroundColor: '#ffffff'
    },
    logo: {
      width: '100%',
      maxWidth: '200px',
      height: 'auto',
      display: 'block',
      margin: '0 auto 20px auto',
      objectFit: 'contain',
      filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.15))' 
    },
    caduceusSvgStyle: {
      marginBottom: '20px',
      filter: 'drop-shadow(0 10px 20px rgba(0,77,64,0.2))'
    },
    title: { 
      color: '#1e293b', marginBottom: '5px', fontSize: '28px', 
      fontWeight: '800', textAlign: 'center', letterSpacing: '-0.5px' 
    },
    subtitle: { 
      color: '#64748b', marginBottom: '25px', textAlign: 'center', fontSize: '15px' 
    },
    inputGroup: { marginBottom: '15px' },
    label: { display: 'block', marginBottom: '6px', fontWeight: '600', color: '#475569', fontSize: '13px' },
    input: {
      width: '100%', padding: '12px 16px', border: '2px solid #e2e8f0',
      borderRadius: '10px', boxSizing: 'border-box', fontSize: '15px',
      backgroundColor: '#f8fafc', color: '#334155',
      outline: 'none', transition: 'border-color 0.2s'
    },
    button: {
      width: '100%', padding: '16px', 
      background: isFormValid ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : '#cbd5e1', 
      color: 'white', border: 'none', borderRadius: '12px', 
      fontSize: '16px', fontWeight: '700', 
      cursor: isFormValid ? 'pointer' : 'not-allowed', 
      marginTop: '20px',
      boxShadow: isFormValid ? '0 4px 6px -1px rgba(37, 99, 235, 0.2)' : 'none',
      transition: 'all 0.3s'
    },
    errorBox: {
      backgroundColor: '#fee2e2', color: '#991b1b', padding: '12px',
      borderRadius: '8px', marginBottom: '20px', fontSize: '13px', 
      border: '1px solid #fecaca', textAlign: 'center'
    },
    validationContainer: {
        backgroundColor: '#f1f5f9', padding: '15px', borderRadius: '12px', marginTop: '10px', fontSize: '13px'
    },
    validationItem: (met) => ({
        display: 'flex', alignItems: 'center', gap: '8px',
        color: met ? '#166534' : '#94a3b8', marginBottom: '4px',
        transition: 'color 0.3s', fontWeight: met ? '600' : '400'
    }),
    linkText: { marginTop: '20px', fontSize: '14px', color: '#64748b', textAlign: 'center' },
    link: { color: '#2563eb', cursor: 'pointer', fontWeight: '700' },
    welcomeText: {
        fontSize: '26px', fontWeight: '800', color: '#00695c', 
        textAlign: 'center', letterSpacing: '-0.5px'
    },
    welcomeSubText: {
        fontSize: '15px', color: '#004d40', 
        marginTop: '8px', textAlign: 'center', opacity: 0.8, maxWidth: '80%'
    }
  };

  // Little helper for the validation lines (checkmarks)
  const Requirement = ({ met, text }) => (
    <div style={styles.validationItem(met)}>
      <span>{met ? '✓' : '•'}</span><span>{text}</span>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        
        {/* LEFT SIDE: Visuals & Welcome Message */}
        <div style={styles.leftSide}>
            <NewCaduceusSVG style={styles.caduceusSvgStyle} />
            
            <div style={styles.welcomeText}>Join the Professionals</div>
            <div style={styles.welcomeSubText}>
                Create your account to start managing your diet plans efficiently.
            </div>
        </div>

        {/* RIGHT SIDE: Registration Form */}
        <div style={styles.rightSide}>
          <img src={logo} alt="Dietitian Logo" style={styles.logo} />
          <h1 style={styles.title}>Create Account</h1>
          <p style={styles.subtitle}>Please fill in the details to register.</p>

          {error && <div style={styles.errorBox}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Dr. John Doe" required style={styles.input} onFocus={(e) => e.target.style.borderColor = '#3b82f6'} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="dietitian@example.com" required style={styles.input} onFocus={(e) => e.target.style.borderColor = '#3b82f6'} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required style={styles.input} onFocus={(e) => e.target.style.borderColor = '#3b82f6'} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Confirm Password</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required style={styles.input} onFocus={(e) => e.target.style.borderColor = '#3b82f6'} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} />
            </div>

            {/* Validation Feedback Box */}
            <div style={styles.validationContainer}>
               <strong style={{color:'#64748b', display:'block', marginBottom:'8px', fontSize:'12px', textTransform:'uppercase', letterSpacing:'0.5px'}}>Password Strength</strong>
               <Requirement met={validations.length} text="8-14 Characters" />
               <Requirement met={validations.upper} text="One Uppercase Letter" />
               <Requirement met={validations.lower} text="One Lowercase Letter" />
               <Requirement met={validations.number} text="One Number" />
               <div style={{borderTop:'1px solid #e2e8f0', margin:'8px 0'}}></div>
               <Requirement met={validations.match} text="Passwords Match" />
            </div>

            <button type="submit" style={styles.button} disabled={!isFormValid || isLoading} onMouseEnter={(e) => {if(isFormValid) e.target.style.transform = 'translateY(-2px)'}} onMouseLeave={(e) => {if(isFormValid) e.target.style.transform = 'translateY(0)'}}>
              {isLoading ? 'Creating Account...' : 'Register'}
            </button>
          </form>

          <p style={styles.linkText}>
            Already have an account? <span style={styles.link} onClick={() => navigate('/')}> Sign In</span>
          </p>
        </div>
      </div>
    </div>
  );
}