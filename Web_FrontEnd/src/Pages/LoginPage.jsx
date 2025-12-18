import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    
    console.log("Login Attempt:", email);
    
    
    navigate('/dashboard', { replace: true });
  };

  const handleRegisterRedirect = () => {
    navigate('/register');
  };

  return (
    <div style={styles.mainContainer}>
      {/* İçeriği ortalayan kapsayıcı */}
      <div style={styles.contentContainer}>
        
        {/* Başlıklar */}
        <h1 style={styles.title}>Welcome To Dietitian's Assistant</h1>
        <p style={styles.subtitle}>Please log in to your account</p>

        {/* Form Alanı */}
        <div style={styles.formArea}>
            
            {/* Email Input */}
            <div style={styles.inputWrapper}>
                <input
                    style={styles.input}
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            {/* Password Input */}
            <div style={styles.inputWrapper}>
                <input
                    style={styles.input}
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            {/* Login Button */}
            <button style={styles.loginButton} onClick={handleLogin}>
                LOG IN
            </button>

            {/* Register Link */}
            <div style={styles.registerContainer}>
                <span style={styles.registerText}>Don't have an account?</span>
                <button style={styles.registerLink} onClick={handleRegisterRedirect}>
                    Sign Up
                </button>
            </div>

        </div>
      </div>
    </div>
  );
}

const styles = {
  mainContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center', 
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  },
  contentContainer: {
    width: '100%',
    maxWidth: '450px', 
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center'
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '10px',
    marginTop: 0
  },
  subtitle: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '40px',
    marginTop: 0
  },
  formArea: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  inputWrapper: {
    width: '100%',
    marginBottom: '15px',
    backgroundColor: '#fff',
    borderRadius: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)', 
  },
  input: {
    width: '100%',
    height: '50px', 
    padding: '0 15px',
    fontSize: '16px',
    color: '#333',
    border: 'none',
    borderRadius: '10px',
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: 'transparent'
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#007AFF',
    padding: '15px',
    borderRadius: '10px',
    border: 'none',
    color: '#fff',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    transition: 'background-color 0.3s'
  },
  registerContainer: {
    marginTop: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '5px'
  },
  registerText: {
    color: '#666',
    fontSize: '14px'
  },
  registerLink: {
    background: 'none',
    border: 'none',
    color: '#007AFF',
    fontWeight: 'bold',
    fontSize: '14px',
    cursor: 'pointer',
    padding: 0
  }
};