import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // VALIDATION STATE
  const [validations, setValidations] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    match: false,
    noRestrictedChars: true // True means "Good" (doesn't contain bad chars)
  });

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // REAL-TIME CHECKER
  useEffect(() => {
    const { password, confirmPassword } = formData;
    
    setValidations({
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /\d/.test(password),
      match: password !== '' && password === confirmPassword,
      // Check for '*' and 'SELECT' (case insensitive for SELECT)
      noRestrictedChars: !password.includes('*') && !password.toUpperCase().includes('SELECT')
    });
  }, [formData.password, formData.confirmPassword]);

  // Check if form is valid to enable button
  const isFormValid = Object.values(validations).every(Boolean) && formData.name && formData.email;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return; // Double check

    setError('');
    setIsLoading(true);

    try {
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
        navigate('/'); 
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Server error. Is the backend running?');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper component for the requirement line
  const Requirement = ({ met, text }) => (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '8px', 
      color: met ? '#2e7d32' : '#d32f2f', // Green or Red
      fontSize: '13px',
      marginBottom: '4px',
      transition: 'color 0.3s'
    }}>
      <span>{met ? '✓' : '✗'}</span>
      <span style={{ textDecoration: met ? 'none' : 'none', opacity: met ? 1 : 0.7 }}>{text}</span>
    </div>
  );

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#FFF9C4', 
      fontFamily: 'Arial, sans-serif'
    },
    card: {
      backgroundColor: 'white',
      padding: '40px',
      borderRadius: '15px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
      width: '100%',
      maxWidth: '450px', // Slightly wider for validation text
      textAlign: 'center'
    },
    title: { color: '#FBC02D', marginBottom: '10px', fontSize: '28px' },
    subtitle: { color: '#666', marginBottom: '30px' },
    inputGroup: { marginBottom: '15px', textAlign: 'left' },
    label: { display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555', fontSize: '14px' },
    input: {
      width: '100%', padding: '12px', border: '1px solid #ddd',
      borderRadius: '8px', boxSizing: 'border-box', fontSize: '16px'
    },
    button: {
      width: '100%', padding: '14px', backgroundColor: '#FBC02D', color: 'white',
      border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold',
      cursor: isFormValid ? 'pointer' : 'not-allowed', 
      marginTop: '10px', transition: 'background 0.3s',
      opacity: isFormValid ? 1 : 0.5 // Fade out if invalid
    },
    errorBox: {
      backgroundColor: '#ffebee', color: '#c62828', padding: '10px',
      borderRadius: '6px', marginBottom: '20px', fontSize: '14px', border: '1px solid #ffcdd2'
    },
    validationBox: {
      textAlign: 'left',
      backgroundColor: '#f9f9f9',
      padding: '15px',
      borderRadius: '8px',
      marginTop: '10px',
      border: '1px solid #eee'
    },
    linkText: { marginTop: '20px', fontSize: '14px', color: '#666' },
    link: { color: '#FBC02D', cursor: 'pointer', fontWeight: 'bold' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Join Us</h1>
        <p style={styles.subtitle}>Create your Dietitian Account</p>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name</label>
            <input 
              type="text" name="name" value={formData.name} onChange={handleChange} 
              placeholder="Dr. John Doe" required style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input 
              type="email" name="email" value={formData.email} onChange={handleChange} 
              placeholder="dietitian@example.com" required style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input 
              type="password" name="password" value={formData.password} onChange={handleChange} 
              required style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm Password</label>
            <input 
              type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} 
              required style={styles.input}
            />
          </div>

          {/* REAL-TIME VALIDATION BOX */}
          <div style={styles.validationBox}>
             <strong style={{fontSize:'12px', color:'#555', display:'block', marginBottom:'8px'}}>Password Requirements:</strong>
             <Requirement met={validations.length} text="At least 8 characters" />
             <Requirement met={validations.upper} text="At least one uppercase letter (A-Z)" />
             <Requirement met={validations.lower} text="At least one lowercase letter (a-z)" />
             <Requirement met={validations.number} text="At least one number (0-9)" />
             <Requirement met={validations.noRestrictedChars} text="Cannot contain '*' or 'SELECT'" />
             <div style={{borderTop:'1px solid #ddd', margin:'5px 0'}}></div>
             <Requirement met={validations.match} text="Passwords match" />
          </div>

          <button type="submit" style={styles.button} disabled={!isFormValid || isLoading}>
            {isLoading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p style={styles.linkText}>
          Already have an account? 
          <span style={styles.link} onClick={() => navigate('/')}> Sign In</span>
        </p>
      </div>
    </div>
  );
}