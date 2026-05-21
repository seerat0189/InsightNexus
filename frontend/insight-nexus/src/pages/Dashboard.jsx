import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import { 
  TrendingUp, Package, Wallet, AlertCircle, ArrowUpRight, ArrowDownRight,
  ShoppingCart, Users, Plus, Loader2, Sparkles,
  CheckCircle2, Activity, ArrowRight, ShieldCheck, Zap, Clock,
  Box, DollarSign, Truck, Calendar, RefreshCw, Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [inventoryList, setInventoryList] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const fetchDashboardData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setSyncing(true);

      const [reportRes, notifyRes, invRes, procRes] = await Promise.all([
        API.get('/reports/dashboard'),
        API.get('/notifications'),
        API.get('/inventory'),
        API.get('/procurement')
      ]);

      setData(reportRes.data);
      setNotifications(notifyRes.data.notifications?.slice(0, 5) || []);
      setInventoryList(invRes.data.items || []);
      setOrdersList(procRes.data.orders || []);
    } catch (err) {
      console.error("Dashboard sync failed", err);
      showToast('Failed to sync dashboard analytics', 'error');
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  useEffect(() => { 
    fetchDashboardData(); 
  }, []);

  const criticalItems = inventoryList.filter(i => i.quantity <= i.reorderLevel).slice(0, 3);
  const pendingOrders = ordersList.filter(o => o.status !== 'delivered').slice(0, 3);

  const quickActions = [
    { title: 'Restock Item', icon: Plus, path: '/inventory', color: '#4f46e5', desc: 'Add new stock' },
    { title: 'Issue PO', icon: ShoppingCart, path: '/procurement', color: '#10b981', desc: 'Purchase from vendor' },
    { title: 'Log Expense', icon: DollarSign, path: '/finance', color: '#f59e0b', desc: 'Record a payout' },
    { title: 'Add Vendor', icon: Users, path: '/suppliers', color: '#db2777', desc: 'Register supplier' },
  ];

  // Check if system is completely empty
  const isSystemEmpty = !inventoryList.length && !ordersList.length && !data?.supplier?.totalSuppliers;

  // Process data for the SVG Chart (income vs expense trends)
  const getChartDataPoints = () => {
    const transactions = data?.finance?.transactions || [];
    if (transactions.length === 0) return { incomePoints: '', expensePoints: '', dates: [] };
    
    // Sort transactions by date asc
    const sortedTxs = [...transactions]
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .slice(-6); // last 6 transactions for clean layout
    
    if (sortedTxs.length < 2) {
      // Mock some points if very few transactions
      return {
        incomePoints: '0,80 150,50 300,70 450,30 600,60',
        expensePoints: '0,90 150,85 300,60 450,80 600,75',
        dates: ['Start', 'Today']
      };
    }

    const width = 600;
    const height = 120;
    const padding = 15;
    
    const maxAmount = Math.max(...sortedTxs.map(t => t.amount), 1000);
    const stepX = (width - padding * 2) / (sortedTxs.length - 1);
    
    let incomePointsArray = [];
    let expensePointsArray = [];
    let dates = [];

    sortedTxs.forEach((tx, idx) => {
      const x = padding + idx * stepX;
      // map amount to height (higher amount = smaller y coordinate)
      const y = height - padding - (tx.amount / maxAmount) * (height - padding * 2);
      
      if (tx.type === 'income') {
        incomePointsArray.push(`${x},${y}`);
        // Add matching fallback point for expense at standard baseline
        expensePointsArray.push(`${x},${height - padding}`);
      } else {
        expensePointsArray.push(`${x},${y}`);
        incomePointsArray.push(`${x},${height - padding}`);
      }
      
      const date = new Date(tx.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      dates.push(date);
    });

    return {
      incomePoints: incomePointsArray.join(' '),
      expensePoints: expensePointsArray.join(' '),
      dates
    };
  };

  const { incomePoints, expensePoints, dates } = getChartDataPoints();

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <div className="loading-state-full">
          <Loader2 className="spinner text-indigo" size={48} />
          <p>Analyzing company operations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content">
        <header className="page-header flex-header">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Operations Hub
            </motion.h1>
            <p>Real-time analytics and vital operations indicators.</p>
          </div>
          
          <div className="header-actions">
            <button 
              className={`btn-sync-refresh ${syncing ? 'syncing' : ''}`} 
              onClick={() => fetchDashboardData(true)}
              disabled={syncing}
              title="Sync analytics"
            >
              <RefreshCw size={16} />
              <span>{syncing ? 'Syncing...' : 'Sync Live'}</span>
            </button>
            <div className="hub-status shadow-sm">
              <Activity size={14} className="pulse-activity" />
              <span>System: <strong>Online</strong></span>
            </div>
          </div>
        </header>

        {/* Empty State Banner */}
        {isSystemEmpty && (
          <motion.div 
            initial={{ opacity: 0, y: -15 }} 
            animate={{ opacity: 1, y: 0 }}
            className="empty-system-banner glass-card"
          >
            <div className="banner-icon-wrapper">
              <Sparkles size={24} className="text-purple animate-bounce" />
            </div>
            <div className="banner-content">
              <h3>Get Started with InsightNexus</h3>
              <p>Welcome! Your workspace is currently empty. Go to the Settings panel to seed your database with comprehensive demo suppliers, inventory products, transaction ledgers, and purchase orders.</p>
            </div>
            <button className="btn-primary" onClick={() => navigate('/settings')}>
              Go to Settings <ArrowRight size={16} />
            </button>
          </motion.div>
        )}

        {/* Pulse KPIs */}
        <section className="pulse-grid">
          <motion.div whileHover={{ y: -3 }} className="pulse-card shadow-sm border-top-indigo">
            <div className="pulse-icon primary"><Zap size={20} /></div>
            <div className="pulse-info">
              <span className="label">Operating Margin</span>
              <p className="val">
                {data?.finance?.totalRevenue > 0 
                  ? ((data?.finance?.profit / data?.finance?.totalRevenue) * 100).toFixed(1) 
                  : '0.0'}%
              </p>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -3 }} className="pulse-card shadow-sm border-top-warning">
            <div className="pulse-icon warning"><AlertCircle size={20} /></div>
            <div className="pulse-info">
              <span className="label">Low Stock Alerts</span>
              <p className="val">{data?.inventory?.lowStockItems || 0}</p>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -3 }} className="pulse-card shadow-sm border-top-info">
            <div className="pulse-icon info"><Clock size={20} /></div>
            <div className="pulse-info">
              <span className="label">Open Purchase Orders</span>
              <p className="val">{data?.procurement?.pendingOrders || 0}</p>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -3 }} className="pulse-card shadow-sm border-top-pink">
            <div className="pulse-icon success"><ShieldCheck size={20} /></div>
            <div className="pulse-info">
              <span className="label">Active Suppliers</span>
              <p className="val">{data?.supplier?.totalSuppliers || 0}</p>
            </div>
          </motion.div>
        </section>

        {/* Main Dashboard Layout */}
        <div className="hub-layout">
          <div className="hub-main-col">
            {/* Urgent Attention Centre */}
            <section className="glass-card task-center margin-bottom-24">
              <div className="section-header">
                <div className="header-title-wrapper">
                  <AlertCircle size={18} className="text-warning" />
                  <h3>Urgent Attention Required</h3>
                </div>
                <span className="badge-count-urgent">{criticalItems.length + pendingOrders.length} Alerts</span>
              </div>
              
              <div className="task-list">
                {criticalItems.map(item => (
                  <div key={item._id} className="task-item warning">
                    <div className="task-icon"><Box size={18} className="text-warning" /></div>
                    <div className="task-body">
                      <h4>Low Inventory Level: <strong>{item.name}</strong></h4>
                      <p>Currently at <strong>{item.quantity}</strong> units. Reorder threshold is {item.reorderLevel}.</p>
                    </div>
                    <button className="task-btn" onClick={() => navigate('/procurement')}>
                      Restock <ArrowRight size={14} />
                    </button>
                  </div>
                ))}
                
                {pendingOrders.map(order => (
                  <div key={order._id} className="task-item info">
                    <div className="task-icon"><Truck size={18} className="text-blue" /></div>
                    <div className="task-body">
                      <h4>PO #{order._id.slice(-6).toUpperCase()} is In-Transit</h4>
                      <p>Status: <span className="text-capitalize">{order.status}</span>. Valued at ${order.totalAmount?.toLocaleString()}.</p>
                    </div>
                    <button className="task-btn" onClick={() => navigate('/procurement')}>
                      Track <ArrowRight size={14} />
                    </button>
                  </div>
                ))}

                {criticalItems.length === 0 && pendingOrders.length === 0 && (
                  <div className="empty-tasks">
                    <div className="success-circle-check">
                      <CheckCircle2 size={32} />
                    </div>
                    <h3>Operations Stable</h3>
                    <p>All items are sufficiently stocked and no shipments are overdue.</p>
                  </div>
                )}
              </div>
            </section>

            {/* Dynamic Trend Chart */}
            <section className="glass-card chart-section">
              <div className="section-header">
                <div className="header-title-wrapper">
                  <TrendingUp size={18} className="text-indigo" />
                  <h3>Ledger cash flow trends</h3>
                </div>
                <div className="chart-legend">
                  <span className="legend-item"><span className="legend-dot income"></span> Income</span>
                  <span className="legend-item"><span className="legend-dot expense"></span> Expense</span>
                </div>
              </div>
              
              <div className="chart-wrapper">
                {data?.finance?.transactions?.length > 0 ? (
                  <>
                    <svg className="trend-svg-chart" viewBox="0 0 600 120" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.1" />
                          <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      
                      {/* Income Path */}
                      <path 
                        d={`M 15,105 L ${incomePoints} L 585,105 Z`} 
                        fill="url(#incomeGrad)" 
                      />
                      <polyline 
                        fill="none" 
                        stroke="#10b981" 
                        strokeWidth="3" 
                        points={incomePoints} 
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      
                      {/* Expense Path */}
                      <path 
                        d={`M 15,105 L ${expensePoints} L 585,105 Z`} 
                        fill="url(#expenseGrad)" 
                      />
                      <polyline 
                        fill="none" 
                        stroke="#ef4444" 
                        strokeWidth="2.5" 
                        points={expensePoints} 
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray="4 2"
                      />
                    </svg>
                    
                    <div className="chart-axis-labels">
                      {dates.map((d, i) => <span key={i}>{d}</span>)}
                    </div>
                  </>
                ) : (
                  <div className="chart-empty-state">
                    <p>Insufficient ledger records to display cash flow trajectory.</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Quick Actions & Spotlight */}
          <aside className="hub-side-col">
            <section className="glass-card tools-section margin-bottom-24">
              <h3>Quick Actions</h3>
              <div className="tools-grid">
                {quickActions.map((action, i) => (
                  <Link key={i} to={action.path} className="tool-card shadow-sm">
                    <div className="tool-icon" style={{ color: action.color, background: `${action.color}12` }}>
                      <action.icon size={18} />
                    </div>
                    <div className="tool-meta">
                      <span className="t-title">{action.title}</span>
                      <span className="t-desc">{action.desc}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            <section className="glass-card spotlight-card border-top-indigo">
              <div className="spotlight-header">
                <Target size={16} className="text-indigo" />
                <span>Growth Milestones</span>
              </div>
              <div className="target-body">
                <h3>Monthly Revenue Target</h3>
                <div className="progress-container">
                  <div className="progress-bar" style={{ width: data?.finance?.totalRevenue >= 50000 ? '100%' : `${(data?.finance?.totalRevenue / 50000) * 100}%` }}></div>
                </div>
                <div className="target-footer">
                  <span>${data?.finance?.totalRevenue?.toLocaleString(undefined, { maximumFractionDigits: 0 })} / $50k</span>
                  <span className="percentage">
                    {data?.finance?.totalRevenue >= 50000 ? '100' : ((data?.finance?.totalRevenue / 50000) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </section>
          </aside>
        </div>

        {/* Real-time System Heartbeat */}
        <section className="glass-card heartbeat-section shadow-sm">
          <div className="hb-header">
            <h3>Recent System Activity</h3>
            <div className="live-indicator">
              <span className="ping"></span> ACTIVE
            </div>
          </div>
          <div className="hb-viewport">
            <div className="hb-list">
              {notifications.map(n => (
                <div key={n._id} className="hb-item">
                  <span className="hb-time">
                    <Clock size={12} style={{marginRight: '4px'}} />
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className={`hb-dot ${n.source}`}></span>
                  <span className="hb-msg">{n.message}</span>
                </div>
              ))}
              {notifications.length === 0 && (
                <span className="no-events-text">System logger quiet. No recent events.</span>
              )}
            </div>
          </div>
        </section>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .loading-state-full { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; color: var(--text-secondary); min-height: 80vh; }
        
        .header-actions { display: flex; align-items: center; gap: 16px; }
        .btn-sync-refresh { display: inline-flex; align-items: center; gap: 8px; background: #ffffff; border: 1px solid var(--surface-border); border-radius: 12px; padding: 10px 16px; font-size: 0.85rem; font-weight: 700; color: var(--text-secondary); cursor: pointer; transition: all 0.3s; }
        .btn-sync-refresh:hover { background: #f8fafc; color: var(--primary); border-color: rgba(79,70,229,0.2); }
        .btn-sync-refresh:active { transform: scale(0.98); }
        .btn-sync-refresh.syncing svg { animation: spin 1s linear infinite; }

        .hub-status { background: #fff; padding: 10px 16px; border-radius: 12px; border: 1px solid var(--surface-border); font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); display: inline-flex; align-items: center; gap: 8px; }
        .hub-status strong { color: #059669; }
        .pulse-activity { color: #059669; animation: pulse-ping 2s infinite; }

        /* Empty state banner */
        .empty-system-banner { display: flex; align-items: center; gap: 20px; background: linear-gradient(135deg, #fefeff 0%, #f5f3ff 100%) !important; border: 1px solid #ddd6fe !important; padding: 24px !important; border-radius: 16px; margin-top: 16px; margin-bottom: 24px; box-shadow: 0 10px 15px -3px rgba(124, 58, 237, 0.05); }
        .banner-icon-wrapper { width: 48px; height: 48px; border-radius: 12px; background: #ede9fe; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .banner-content { flex: 1; }
        .banner-content h3 { font-size: 1.1rem; font-weight: 700; color: #4338ca; margin-bottom: 4px; }
        .banner-content p { font-size: 0.85rem; color: #5b21b6; margin: 0; line-height: 1.5; }
        
        .pulse-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-top: 16px; }
        .pulse-card { background: #fff; padding: 20px; border-radius: 16px; border: 1px solid var(--surface-border); display: flex; align-items: center; gap: 16px; }
        
        .border-top-indigo { border-top: 4px solid var(--primary); }
        .border-top-warning { border-top: 4px solid var(--warning); }
        .border-top-info { border-top: 4px solid #3b82f6; }
        .border-top-pink { border-top: 4px solid var(--secondary); }

        .pulse-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .pulse-icon.primary { background: #eef2ff; color: var(--primary); }
        .pulse-icon.warning { background: #fff7ed; color: var(--warning); }
        .pulse-icon.info { background: #eff6ff; color: #3b82f6; }
        .pulse-icon.success { background: #fdf2f8; color: var(--secondary); }
        .pulse-info .label { font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; }
        .pulse-info .val { font-size: 1.4rem; font-weight: 800; color: var(--text-primary); margin: 0; }

        .hub-layout { display: grid; grid-template-columns: 1fr 340px; gap: 24px; margin-top: 24px; }
        
        /* Attention Centre */
        .task-center { padding: 24px; border-radius: 16px; }
        .header-title-wrapper { display: flex; align-items: center; gap: 10px; }
        .header-title-wrapper h3 { font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin: 0; }
        .badge-count-urgent { font-size: 0.75rem; font-weight: 700; background: #fef2f2; color: var(--error); padding: 4px 10px; border-radius: 20px; border: 1px solid #fecaca; }

        .task-list { display: flex; flex-direction: column; gap: 12px; margin-top: 16px; }
        .task-item { padding: 16px; border-radius: 12px; border: 1px solid var(--surface-border); display: flex; align-items: center; gap: 16px; background: #f8fafc; transition: all 0.2s; }
        .task-item:hover { transform: translateX(2px); background: #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); }
        .task-item.warning { border-left: 4px solid var(--warning); }
        .task-item.info { border-left: 4px solid #3b82f6; }
        
        .task-icon { width: 36px; height: 36px; border-radius: 8px; background: #fff; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.03); border: 1px solid #f1f5f9; }
        .task-body { flex: 1; }
        .task-body h4 { font-size: 0.9rem; font-weight: 600; color: var(--text-primary); margin: 0 0 2px 0; }
        .task-body p { font-size: 0.8rem; color: var(--text-secondary); margin: 0; }
        
        .task-btn { padding: 8px 12px; border-radius: 8px; background: #fff; border: 1px solid #e2e8f0; font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); display: flex; align-items: center; gap: 4px; transition: all 0.2s; cursor: pointer; }
        .task-btn:hover { background: #f8fafc; color: var(--primary); border-color: rgba(99, 102, 241, 0.2); }

        .empty-tasks { padding: 40px 0; text-align: center; color: var(--text-secondary); display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .success-circle-check { width: 56px; height: 56px; border-radius: 50%; background: #ecfdf5; color: var(--success); display: flex; align-items: center; justify-content: center; margin-bottom: 12px; }
        .empty-tasks h3 { color: var(--text-primary); font-size: 1rem; font-weight: 700; margin-bottom: 4px; }
        .empty-tasks p { font-size: 0.85rem; margin: 0; }

        /* Chart */
        .chart-section { padding: 24px; border-radius: 16px; }
        .chart-legend { display: flex; gap: 16px; }
        .legend-item { font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); display: flex; align-items: center; gap: 6px; }
        .legend-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
        .legend-dot.income { background: #10b981; }
        .legend-dot.expense { background: #ef4444; }
        
        .chart-wrapper { position: relative; margin-top: 16px; padding: 10px 0; }
        .trend-svg-chart { width: 100%; height: 120px; overflow: visible; }
        .chart-axis-labels { display: flex; justify-content: space-between; padding: 8px 15px 0 15px; font-size: 0.75rem; font-weight: 600; color: #94a3b8; border-top: 1px solid #f1f5f9; margin-top: 4px; }
        .chart-empty-state { height: 120px; display: flex; align-items: center; justify-content: center; background: #f8fafc; border-radius: 12px; font-size: 0.85rem; color: #94a3b8; border: 1px dashed #e2e8f0; }

        /* Tools panel */
        .tools-section { padding: 20px; border-radius: 16px; }
        .tools-section h3 { font-size: 0.95rem; font-weight: 700; color: var(--text-primary); margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 0.05em; }
        .tools-grid { display: flex; flex-direction: column; gap: 10px; }
        
        .tool-card { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 12px; transition: all 0.2s; border: 1px solid #f1f5f9; background: #fff; text-decoration: none; }
        .tool-card:hover { transform: translateY(-1px); border-color: #cbd5e1; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); }
        .tool-icon { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .t-title { display: block; font-size: 0.85rem; font-weight: 700; color: var(--text-primary); }
        .t-desc { display: block; font-size: 0.75rem; color: var(--text-secondary); }

        /* Target Spotlight */
        .spotlight-card { padding: 20px; border-radius: 16px; background: #ffffff !important; }
        .spotlight-header { display: flex; align-items: center; gap: 8px; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 16px; letter-spacing: 0.05em; }
        .target-body h3 { font-size: 0.95rem; font-weight: 700; color: var(--text-primary); margin: 0 0 12px 0; }
        
        .progress-container { width: 100%; height: 6px; background: #f1f5f9; border-radius: 4px; overflow: hidden; margin-bottom: 8px; border: 1px solid #e2e8f0; }
        .progress-bar { height: 100%; background: linear-gradient(90deg, var(--primary), var(--accent)); border-radius: 4px; }
        
        .target-footer { display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); }
        .target-footer .percentage { color: var(--text-primary); }

        /* Heartbeat */
        .heartbeat-section { margin-top: 24px; padding: 16px 20px; display: flex; align-items: center; gap: 24px; overflow: hidden; border-radius: 16px; height: 60px; }
        .hb-header { display: flex; align-items: center; gap: 10px; flex-shrink: 0; border-right: 1px solid #e2e8f0; padding-right: 20px; height: 100%; }
        .hb-header h3 { font-size: 0.85rem; font-weight: 700; color: var(--text-primary); margin: 0; }
        .live-indicator { font-size: 0.65rem; font-weight: 800; color: var(--error); display: flex; align-items: center; gap: 4px; }
        
        .ping { width: 6px; height: 6px; background: var(--error); border-radius: 50%; display: inline-block; animation: pulse-ping 1.5s infinite; }
        .hb-viewport { flex: 1; overflow: hidden; position: relative; display: flex; align-items: center; }
        
        .hb-list { display: flex; gap: 32px; animation: scroll-heartbeat 25s linear infinite; white-space: nowrap; width: max-content; }
        .hb-item { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; font-weight: 600; color: var(--text-primary); }
        .hb-time { font-size: 0.75rem; color: var(--text-secondary); font-weight: 700; display: inline-flex; align-items: center; }
        
        .hb-dot { width: 6px; height: 6px; border-radius: 50%; display: inline-block; }
        .hb-dot.inventory { background: var(--warning); }
        .hb-dot.finance { background: var(--success); }
        .hb-dot.procurement { background: #3b82f6; }
        .hb-dot.supplier { background: var(--secondary); }
        
        .no-events-text { font-size: 0.8rem; color: #cbd5e1; font-style: italic; }

        @keyframes pulse-ping { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.6); opacity: 0.4; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes scroll-heartbeat { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spinner { animation: spin 1.5s linear infinite; }

        @media (max-width: 1100px) {
          .hub-layout { grid-template-columns: 1fr; }
          .hub-side-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .spotlight-card { margin-top: 0; }
        }
        @media (max-width: 768px) {
          .hub-side-col { grid-template-columns: 1fr; }
        }
      `}} />
    </div>
  );
};

export default Dashboard;
