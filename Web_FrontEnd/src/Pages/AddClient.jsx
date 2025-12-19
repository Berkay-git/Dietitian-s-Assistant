import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AddClient() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    dob: '',
    gender: 'Female' // Default value
  });
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Get the logged-in Dietitian's ID
    const dietitianId = localStorage.getItem('user_id');
    if (!dietitianId) {
      setError("You must be logged in to add a client.");
      setIsLoading(false);
      return;
    }

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
        alert("Client Added Successfully! 🎉");
        navigate('/dashboard'); // Go back to dashboard to see the new client
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
    container: {
      minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center',
      backgroundColor: '#f5f5f5', fontFamily: 'Arial, sans-serif'
    },
    card: {
      backgroundColor: 'white', padding: '30px', borderRadius: '15px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)', width: '100%', maxWidth: '500px'
    },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    title: { margin: 0, color: '#333' },
    closeBtn: { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#666' },
    
    inputGroup: { marginBottom: '15px' },
    label: { display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555', fontSize: '14px' },
    input: { width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' },
    select: { width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box', backgroundColor: 'white' },
    
    submitBtn: {
      width: '100%', padding: '12px', backgroundColor: '#007AFF', color: 'white',
      border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold',
      cursor: 'pointer', marginTop: '10px', transition: 'background 0.2s'
    },
    errorBox: { backgroundColor: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '6px', marginBottom: '15px', textAlign: 'center' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Add New Client</h2>
          <button style={styles.closeBtn} onClick={() => navigate('/dashboard')}>✕</button>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit}>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name</label>
            <input name="name" type="text" placeholder="e.g. John Doe" required value={formData.name} onChange={handleChange} style={styles.input} />
          </div>

          <div style={{display:'flex', gap:'15px'}}>
             <div style={{...styles.inputGroup, flex:1}}>
                <label style={styles.label}>Date of Birth</label>
                <input name="dob" type="date" required value={formData.dob} onChange={handleChange} style={styles.input} />
             </div>
             <div style={{...styles.inputGroup, flex:1}}>
                <label style={styles.label}>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} style={styles.select}>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                </select>
             </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input name="email" type="email" placeholder="client@example.com" required value={formData.email} onChange={handleChange} style={styles.input} />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Initial Password</label>
            <input name="password" type="text" placeholder="Create a temporary password" required value={formData.password} onChange={handleChange} style={styles.input} />
          </div>

          <button type="submit" style={styles.submitBtn} disabled={isLoading}>
            {isLoading ? 'Adding Client...' : 'Add Client'}
          </button>
        </form>
      </div>
    </div>
  );
}