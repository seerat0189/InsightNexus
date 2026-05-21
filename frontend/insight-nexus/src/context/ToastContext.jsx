import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto-remove toast after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const getToastIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="toast-icon text-success" size={20} />;
      case 'error':
        return <XCircle className="toast-icon text-error" size={20} />;
      case 'warning':
        return <AlertTriangle className="toast-icon text-warning" size={20} />;
      default:
        return <Info className="toast-icon text-info" size={20} />;
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Portal Container */}
      <div className="toast-portal">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              className={`toast-card glass-card toast-${toast.type}`}
            >
              <div className="toast-body">
                {getToastIcon(toast.type)}
                <span className="toast-message">{toast.message}</span>
              </div>
              <button className="toast-close" onClick={() => removeToast(toast.id)}>
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .toast-portal {
          position: fixed;
          top: 24px;
          right: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          z-index: 9999;
          pointer-events: none;
        }
        
        .toast-card {
          pointer-events: auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-radius: 16px;
          min-width: 320px;
          max-width: 420px;
          background: rgba(255, 255, 255, 0.85) !important;
          border: 1px solid rgba(226, 232, 240, 0.8);
          box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08),
                      0 8px 16px -6px rgba(15, 23, 42, 0.04);
          overflow: hidden;
        }

        .toast-card::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
        }

        .toast-success::before { background: #10b981; }
        .toast-error::before { background: #ef4444; }
        .toast-warning::before { background: #f59e0b; }
        .toast-info::before { background: #3b82f6; }

        .toast-body {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .toast-icon {
          flex-shrink: 0;
        }

        .toast-message {
          font-size: 0.9rem;
          font-weight: 600;
          color: #1e293b;
          line-height: 1.4;
        }

        .toast-close {
          background: transparent;
          color: #94a3b8;
          padding: 4px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: 12px;
          transition: all 0.2s;
        }

        .toast-close:hover {
          background: rgba(15, 23, 42, 0.05);
          color: #475569;
        }

        .text-success { color: #10b981; }
        .text-error { color: #ef4444; }
        .text-warning { color: #f59e0b; }
        .text-info { color: #3b82f6; }
      `}} />
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
