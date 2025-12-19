import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();
  
  // State for form fields
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {   // sets the form data
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 1. Call your Flask Backend
      const response = await fetch('http://localhost:5000/api/dietitian/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          user_type: 'dietitian' // We hardcode this for the Web Portal
        })
      });

      const data = await response.json();

      if (response.ok) {
        // 2. SUCCESS: Save token & user info to LocalStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user_id', data.user.id);
        localStorage.setItem('user_name', data.user.name);

        // 3. Navigate to Dashboard
        navigate('/dashboard');
      } else {
        // 4. ERROR: Show message from backend
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      setError('Server error. Is the backend running?');
    } finally {
      setIsLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#FFF9C4', // Yellowish background
      fontFamily: 'Arial, sans-serif'
    },
    card: {
      backgroundColor: 'white',
      padding: '40px',
      borderRadius: '15px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
      width: '100%',
      maxWidth: '400px',
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
      cursor: 'pointer', marginTop: '10px', transition: 'background 0.3s'
    },
    errorBox: {
      backgroundColor: '#ffebee', color: '#c62828', padding: '10px',
      borderRadius: '6px', marginBottom: '20px', fontSize: '14px', border: '1px solid #ffcdd2'
    },
    linkText: { marginTop: '20px', fontSize: '14px', color: '#666' },
    link: { color: '#FBC02D', cursor: 'pointer', fontWeight: 'bold' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Welcome to the Dietitian's Assistant</h1>
        <p style={styles.subtitle}>Sign in to manage your clients</p>

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
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input 
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              placeholder="Enter your password"
              required 
              style={styles.input}
            />
          </div>

          <button type="submit" style={styles.button} disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p style={styles.linkText}>
          Don't have an account? 
          <span style={styles.link} onClick={() => navigate('/register')}> Create one</span>
        </p>
      </div>
    </div>
  );
}