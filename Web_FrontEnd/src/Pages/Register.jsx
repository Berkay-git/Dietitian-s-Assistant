import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();

  // Form verilerini tutacak state'ler
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Kayıt Ol butonuna basınca çalışacak fonksiyon
  const handleRegister = () => {
    // 1. Boş Alan Kontrolü
    if (!name || !surname || !email || !password || !confirmPassword) {
      alert("Please fill in all fields.");
      return;
    }

    // 2. Şifre Eşleşme Kontrolü
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    // 3. Şifre Güvenlik Kontrolü
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[.,!@#$%^&*]).{8,}$/;
    
    if (!passwordRegex.test(password)) {
      alert("Password must be at least 8 characters long, contain 1 uppercase letter, 1 number, and 1 special character (.,!@# etc).");
      return;
    }

    // 4. Email Kullanımda mı Kontrolü (Simülasyon)
    if (email === "test@gmail.com") {
      alert("This email is already in use!");
      return;
    }

    // Her şey yolundaysa
    alert("Registration Successful! Redirecting to login...");
    
    // İşlem başarılıysa giriş sayfasına geri gönder
    navigate('/'); 
  };

  return (
    <div style={styles.mainContainer}>
      <div style={styles.formCard}>
        
        {/* Başlıklar */}
        <h1 style={styles.title}>New Dietitian Registration</h1>
        <p style={styles.subtitle}>Join us to manage your patients better</p>

        <div style={styles.formContent}>
            
            {/* İsim */}
            <div style={styles.inputWrapper}>
                <input
                    style={styles.input}
                    placeholder="Dietitian's Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>

            {/* Soyisim */}
            <div style={styles.inputWrapper}>
                <input
                    style={styles.input}
                    placeholder="Dietitian's Surname"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                />
            </div>

            {/* Email */}
            <div style={styles.inputWrapper}>
                <input
                    style={styles.input}
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            {/* Şifre */}
            <div style={styles.inputWrapper}>
                <input
                    style={styles.input}
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            {/* Şifre Tekrar */}
            <div style={styles.inputWrapper}>
                <input
                    style={styles.input}
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
            </div>

            {/* Kayıt Butonu */}
            <button style={styles.registerButton} onClick={handleRegister}>
                REGISTER
            </button>

            {/* Geri Dön Linki */}
            <div style={styles.loginLinkContainer}>
                <span style={styles.loginLinkText}>Already have an account? </span>
                <button style={styles.loginLink} onClick={() => navigate('/')}>
                    Log In
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
  formCard: {
    width: '100%',
    maxWidth: '450px',
    backgroundColor: '#fff',
    borderRadius: '15px',
    padding: '30px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    textAlign: 'center'
  },
  title: {
    fontSize: '26px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '5px',
    marginTop: 0
  },
  subtitle: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '30px',
    marginTop: 0
  },
  formContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  inputWrapper: {
    width: '100%'
  },
  input: {
    width: '100%',
    padding: '12px 15px',
    fontSize: '16px',
    color: '#333',
    borderRadius: '10px',
    border: '1px solid #ddd',
    backgroundColor: '#fff',
    outline: 'none',
    boxSizing: 'border-box'
  },
  registerButton: {
    width: '100%',
    backgroundColor: '#28a745', 
    padding: '15px',
    borderRadius: '10px',
    border: 'none',
    color: '#fff',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px',
    transition: 'background-color 0.3s'
  },
  loginLinkContainer: {
    marginTop: '20px',
    fontSize: '14px',
    color: '#666'
  },
  loginLinkText: {
    color: '#666'
  },
  loginLink: {
    background: 'none',
    border: 'none',
    color: '#007AFF',
    fontWeight: 'bold',
    cursor: 'pointer',
    padding: 0,
    fontSize: '14px'
  }
};