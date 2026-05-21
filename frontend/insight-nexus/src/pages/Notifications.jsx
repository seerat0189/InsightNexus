import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import API from '../services/api';
import { 
  Bell, CheckCircle2, AlertTriangle, Info, Trash2, 
  Filter, Check, MoreVertical, Loader2, Sparkles,
  Package, DollarSign, Cpu, Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await API.get('/notifications');
      setNotifications(res.data.notifications);
    } catch (err) {
      console.error("Failed to sync notifications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markRead = async (id) => {
    try {
      await API.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error("Failed to update notification", err);
    }
  };

  const markAllRead = async () => {
    try {
      await API.patch('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error("Failed to update all", err);
    }
  };

  const deleteNotify = async (id) => {
    try {
      await API.delete(`/notifications/${id}`);
      setNotifications(notifications.filter(n => n._id !== id));
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  const getIcon = (source, type) => {
    if (type === 'low_stock') return <Package className="text-warning" size={20} />;
    if (type === 'supplier_risk') return <AlertTriangle className="text-error" size={20} />;
    if (source === 'finance') return <DollarSign className="text-success" size={20} />;
    if (source === 'ai') return <Sparkles className="text-primary" size={20} />;
    return <Info className="text-info" size={20} />;
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(date).toLocaleDateString();
  };

  const filtered = notifications.filter(n => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unread') return !n.read;
    return n.source === activeFilter;
  });

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content">
        <header className="page-header flex-header">
          <div>
            <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              Activity Center
            </motion.h1>
            <p>Real-time alerts and system events from across your microservices.</p>
          </div>
          <div className="header-actions">
            <button className="btn-secondary-outline" onClick={markAllRead} disabled={!notifications.some(n => !n.read)}>
              <Check size={18} /> Mark all as read
            </button>
          </div>
        </header>

        <section className="notification-layout">
          {/* Sidebar Filters */}
          <aside className="notify-sidebar glass-card">
            <div className="filter-group">
              <label>Status</label>
              <button className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>
                <Bell size={18} /> All Activity
              </button>
              <button className={`filter-btn ${activeFilter === 'unread' ? 'active' : ''}`} onClick={() => setActiveFilter('unread')}>
                <Filter size={18} /> Unread Only
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="count-badge">{notifications.filter(n => !n.read).length}</span>
                )}
              </button>
            </div>

            <div className="filter-group">
              <label>Source</label>
              <button className={`filter-btn ${activeFilter === 'inventory' ? 'active' : ''}`} onClick={() => setActiveFilter('inventory')}>
                <Package size={18} /> Inventory
              </button>
              <button className={`filter-btn ${activeFilter === 'finance' ? 'active' : ''}`} onClick={() => setActiveFilter('finance')}>
                <DollarSign size={18} /> Finance
              </button>
              <button className={`filter-btn ${activeFilter === 'ai' ? 'active' : ''}`} onClick={() => setActiveFilter('ai')}>
                <Cpu size={18} /> AI & Insights
              </button>
              <button className={`filter-btn ${activeFilter === 'system' ? 'active' : ''}`} onClick={() => setActiveFilter('system')}>
                <Settings size={18} /> System
              </button>
            </div>
          </aside>

          {/* Feed */}
          <div className="notify-feed">
            {loading ? (
              <div className="feed-loading">
                <Loader2 className="spinner" size={40} />
                <p>Syncing activity feed...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty-feed glass-card">
                <div className="empty-icon"><CheckCircle2 size={48} /></div>
                <h3>All caught up!</h3>
                <p>No notifications found for the selected filter.</p>
              </div>
            ) : (
              <div className="feed-list">
                <AnimatePresence mode="popLayout">
                  {filtered.map((n) => (
                    <motion.div 
                      key={n._id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      className={`notify-card glass-card ${n.read ? 'read' : 'unread'}`}
                      onClick={() => !n.read && markRead(n._id)}
                    >
                      <div className="card-icon">
                        {getIcon(n.source, n.type)}
                      </div>
                      <div className="card-body">
                        <div className="card-header-row">
                          <span className="source-label">{n.source.toUpperCase()}</span>
                          <span className="time-label">{timeAgo(n.createdAt)}</span>
                        </div>
                        <p className="message">{n.message}</p>
                      </div>
                      <div className="card-actions">
                        {!n.read && (
                          <button className="action-btn check" onClick={(e) => { e.stopPropagation(); markRead(n._id); }} title="Mark as read">
                            <Check size={16} />
                          </button>
                        )}
                        <button className="action-btn delete" onClick={(e) => { e.stopPropagation(); deleteNotify(n._id); }} title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </section>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .notification-layout { display: grid; grid-template-columns: 280px 1fr; gap: 32px; margin-top: 32px; align-items: flex-start; }
        
        .notify-sidebar { padding: 24px; position: sticky; top: 32px; display: flex; flex-direction: column; gap: 32px; }
        .filter-group { display: flex; flex-direction: column; gap: 8px; }
        .filter-group label { font-size: 0.75rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; padding-left: 12px; margin-bottom: 4px; }
        
        .filter-btn { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 12px; font-weight: 600; color: #64748b; transition: all 0.2s; position: relative; width: 100%; text-align: left; }
        .filter-btn:hover { background: #f8fafc; color: var(--primary); }
        .filter-btn.active { background: #eef2ff; color: var(--primary); }
        .filter-btn .count-badge { position: absolute; right: 12px; background: var(--primary); color: #fff; font-size: 0.7rem; padding: 2px 6px; border-radius: 6px; font-weight: 800; }

        .notify-feed { display: flex; flex-direction: column; gap: 16px; min-height: 400px; }
        .feed-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 100px 0; color: #94a3b8; gap: 16px; }
        
        .empty-feed { padding: 80px 40px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 20px; }
        .empty-icon { width: 80px; height: 80px; background: #f0fdf4; color: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
        .empty-feed h3 { font-size: 1.4rem; color: #1e293b; margin: 0; }
        .empty-feed p { color: #64748b; margin: 0; }

        .feed-list { display: flex; flex-direction: column; gap: 16px; }
        
        .notify-card { display: flex; gap: 20px; padding: 20px; border-radius: 20px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; position: relative; border: 1px solid var(--surface-border); }
        .notify-card.unread { background: #fff; border-left: 4px solid var(--primary); box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.05); }
        .notify-card.read { opacity: 0.7; background: rgba(255,255,255,0.5); }
        .notify-card:hover { transform: translateY(-2px); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.05); }

        .card-icon { width: 48px; height: 48px; border-radius: 14px; background: #f8fafc; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .notify-card.unread .card-icon { background: #eef2ff; }

        .card-body { flex: 1; min-width: 0; }
        .card-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
        .source-label { font-size: 0.7rem; font-weight: 800; color: #94a3b8; letter-spacing: 0.05em; }
        .time-label { font-size: 0.75rem; color: #94a3b8; font-weight: 500; }
        .message { font-size: 0.95rem; color: #1e293b; line-height: 1.5; margin: 0; font-weight: 500; }
        .notify-card.unread .message { font-weight: 600; color: #0f172a; }

        .card-actions { display: flex; gap: 8px; opacity: 0; transition: opacity 0.2s; }
        .notify-card:hover .card-actions { opacity: 1; }
        
        .action-btn { padding: 8px; border-radius: 10px; transition: all 0.2s; }
        .action-btn.check { color: #10b981; background: #ecfdf5; }
        .action-btn.delete { color: #ef4444; background: #fef2f2; }
        .action-btn:hover { transform: scale(1.1); }

        .text-warning { color: #f59e0b; }
        .text-error { color: #ef4444; }
        .text-success { color: #10b981; }
        .text-info { color: #3b82f6; }
        .text-primary { color: var(--primary); }

        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spinner { animation: spin 1.5s linear infinite; }
      `}} />
    </div>
  );
};

export default Notifications;
