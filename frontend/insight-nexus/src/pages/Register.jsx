import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, Building, Globe, Hash, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    action: 'create', // create or join
    companyName: '',
    industry: '',
    companyCode: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Clean payload based on action
    const payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      action: formData.action,
      ...(formData.action === 'create' 
        ? { companyName: formData.companyName, industry: formData.industry } 
        : { companyCode: formData.companyCode })
    };

    try {
      await register(payload);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(typeof msg === 'object' ? (msg.message || JSON.stringify(msg)) : (msg || 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Decorative Orbs for background */}
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="auth-card glass-card"
      >
        <div className="card-accent-bar"></div>

        <div className="auth-header">
          <div className="logo">Insight<span>Nexus</span></div>
          <h2>Create account</h2>
          <p>Join the future of business intelligence</p>
        </div>

        {error && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="error-alert"
          >
            {error}
          </motion.div>
        )}

        <div className="tabs">
          <button 
            type="button"
            className={formData.action === 'create' ? 'active' : ''} 
            onClick={() => setFormData({...formData, action: 'create'})}
          >
            Create Company
          </button>
          <button 
            type="button"
            className={formData.action === 'join' ? 'active' : ''} 
            onClick={() => setFormData({...formData, action: 'join'})}
          >
            Join Company
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-row">
            <div className="input-group">
              <label>Full Name</label>
              <div className="input-wrapper">
                <UserPlus className="input-icon" size={18} />
                <input type="text" name="name" placeholder="Yash" onChange={handleChange} required />
              </div>
            </div>
            <div className="input-group">
              <label>Email</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={18} />
                <input type="email" name="email" placeholder="yash@test.com" onChange={handleChange} required />
              </div>
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input type="password" name="password" placeholder="••••••••" onChange={handleChange} required />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {formData.action === 'create' ? (
              <motion.div 
                key="create-fields"
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="input-row"
                style={{ overflow: 'hidden' }}
              >
                <div className="input-group">
                  <label>Company Name</label>
                  <div className="input-wrapper">
                    <Building className="input-icon" size={18} />
                    <input type="text" name="companyName" placeholder="Insight Corp" onChange={handleChange} required />
                  </div>
                </div>
                <div className="input-group">
                  <label>Industry</label>
                  <div className="input-wrapper">
                    <Globe className="input-icon" size={18} />
                    <input type="text" name="industry" placeholder="SaaS" onChange={handleChange} required />
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="join-fields"
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="input-group"
                style={{ overflow: 'hidden' }}
              >
                <label>Company Code</label>
                <div className="input-wrapper">
                  <Hash className="input-icon" size={18} />
                  <input type="text" name="companyCode" placeholder="NEXUS123" onChange={handleChange} required />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button type="submit" className="btn-primary auth-btn" disabled={loading}>
            {loading ? <Loader2 className="spinner" size={20} /> : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </motion.div>

      <style dangerouslySetInnerHTML={{ __html: `
        .auth-container {
          position: relative;
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 12px;
          background: linear-gradient(135deg, #f5f7ff 0%, #fef2f7 50%, #f0f4ff 100%);
          overflow: hidden;
        }

        /* Ambient glowing background elements */
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.45;
          z-index: 0;
          pointer-events: none;
        }
        .orb-1 {
          width: 400px;
          height: 400px;
          background: #4f46e5;
          top: -100px;
          left: -100px;
        }
        .orb-2 {
          width: 500px;
          height: 500px;
          background: #db2777;
          bottom: -150px;
          right: -100px;
        }
        .orb-3 {
          width: 300px;
          height: 300px;
          background: #7c3aed;
          top: 30%;
          right: 20%;
        }

        .auth-card {
          position: relative;
          width: 100%;
          max-width: 540px;
          padding: 40px;
          background: rgba(255, 255, 255, 0.75) !important;
          border: 1px solid rgba(255, 255, 255, 0.7);
          box-shadow: 0 20px 40px -15px rgba(15, 23, 42, 0.08), 
                      0 0 0 1px rgba(15, 23, 42, 0.03);
          border-radius: 24px;
          z-index: 10;
        }
        .card-accent-bar {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 6px;
          background: linear-gradient(90deg, #4f46e5, #7c3aed, #db2777);
          border-radius: 24px 24px 0 0;
        }
        
        .auth-header {
          text-align: center;
          margin-bottom: 24px;
        }
        .auth-header .logo {
          margin-bottom: 8px;
          font-size: 2.1rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: #0f172a;
        }
        .auth-header .logo span {
          background: linear-gradient(135deg, #4f46e5, #db2777);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .auth-header h2 {
          font-size: 1.6rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 6px;
          letter-spacing: -0.01em;
        }
        .auth-header p {
          color: #64748b;
          font-size: 0.95rem;
          font-weight: 500;
        }

        .input-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        
        .tabs {
          display: flex;
          background: rgba(15, 23, 42, 0.05);
          padding: 6px;
          border-radius: 14px;
          margin-bottom: 24px;
        }
        .tabs button {
          flex: 1;
          padding: 10px;
          border-radius: 10px;
          font-size: 0.9rem;
          font-weight: 600;
          color: #64748b;
          background: transparent;
          transition: all 0.25s ease;
        }
        .tabs button.active {
          background: #ffffff;
          color: #4f46e5;
          box-shadow: 0 4px 10px -2px rgba(15, 23, 42, 0.05);
        }

        .input-wrapper {
          position: relative;
        }
        .input-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          transition: color 0.3s;
        }
        .input-wrapper input {
          width: 100%;
          padding: 14px 16px 14px 48px !important;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          color: #0f172a;
          font-size: 0.95rem;
          font-weight: 500;
          outline: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .input-wrapper input::placeholder {
          color: #cbd5e1;
        }
        .input-wrapper input:focus {
          border-color: #4f46e5;
          box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.12);
        }
        .input-wrapper input:focus + .input-icon {
          color: #4f46e5;
        }

        .auth-btn {
          width: 100%;
          justify-content: center;
          margin-top: 12px;
          padding: 14px !important;
          border-radius: 14px;
          font-size: 1rem;
          font-weight: 600;
          border: none;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          color: white;
          box-shadow: 0 10px 20px -5px rgba(79, 70, 229, 0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .auth-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px -5px rgba(79, 70, 229, 0.45);
        }
        .auth-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .auth-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .auth-footer {
          margin-top: 24px;
          text-align: center;
          font-size: 0.9rem;
          color: #64748b;
          font-weight: 500;
        }
        .auth-footer a {
          color: #4f46e5;
          font-weight: 700;
          transition: color 0.2s;
        }
        .auth-footer a:hover {
          color: #db2777;
        }

        .error-alert {
          background: #fef2f2;
          border: 1px solid #fee2e2;
          color: #b91c1c;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 24px;
          text-align: center;
          box-shadow: 0 4px 6px -1px rgba(220, 38, 38, 0.05);
        }

        .spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 600px) {
          .input-row {
            grid-template-columns: 1fr;
            gap: 0;
          }
        }
      `}} />
    </div>
  );
};

export default Register;
