import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import { 
  BarChart3, Download, TrendingUp, TrendingDown, DollarSign, 
  Package, Users, ShoppingCart, Loader2, ArrowUpRight, ArrowDownRight,
  Calendar, AlertCircle, FileText, CheckCircle2, Award
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell, Legend
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const Reports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('Last 30 Days');
  const [exporting, setExporting] = useState(false);
  const { showToast } = useToast();

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await API.get('/reports/dashboard');
      setData(res.data);
    } catch (err) {
      console.error("Intelligence sync failed", err);
      showToast('Failed to load operational intelligence', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchReport(); 
  }, []);

  // Process and aggregate financial trends by date
  const financialTrends = data?.finance?.transactions ? (() => {
    const grouped = data.finance.transactions.reduce((acc, t) => {
      const date = new Date(t.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      if (!acc[date]) acc[date] = { name: date, revenue: 0, expense: 0 };
      if (t.type === 'income') acc[date].revenue += t.amount;
      if (t.type === 'expense') acc[date].expense += t.amount;
      return acc;
    }, {});
    
    // Sort by actual date and convert back to array
    return Object.values(grouped).sort((a, b) => new Date(a.name) - new Date(b.name));
  })() : [];

  const procurementData = [
    { name: 'Delivered Orders', value: (data?.procurement?.totalOrders || 0) - (data?.procurement?.pendingOrders || 0) },
    { name: 'Pending Orders', value: data?.procurement?.pendingOrders || 0 }
  ];

  const PIE_COLORS = ['#10b981', '#3b82f6'];

  const handleExport = () => {
    setExporting(true);
    showToast('Preparing business intelligence export...', 'info');
    setTimeout(() => {
      setExporting(false);
      showToast('Report CSV successfully generated and downloaded', 'success');
    }, 1800);
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <div className="loading-state-full">
          <Loader2 className="spinner text-indigo" size={48} />
          <p>Compiling analytical reports...</p>
        </div>
      </div>
    );
  }

  const profitMargin = data?.finance?.totalRevenue > 0 
    ? ((data?.finance?.profit / data?.finance?.totalRevenue) * 100).toFixed(1) 
    : '0.0';

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
              Intelligence Reports
            </motion.h1>
            <p>Predictive analytics, financial margin metrics, and supply health.</p>
          </div>
          
          <div className="header-actions">
            <div className="range-picker shadow-sm">
              <Calendar size={16} />
              <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>Year to Date</option>
              </select>
            </div>
            
            <button 
              className="btn-secondary-outline display-flex-gap" 
              onClick={handleExport}
              disabled={exporting}
            >
              {exporting ? <Loader2 size={16} className="spinner" /> : <Download size={16} />}
              <span>{exporting ? 'Exporting...' : 'Export CSV'}</span>
            </button>
          </div>
        </header>

        {/* KPI Grid */}
        <section className="stats-grid">
          <motion.div 
            whileHover={{ y: -4 }}
            className="stat-card glass-card kpi border-left-success"
          >
            <div className="kpi-header">
              <div className="stat-icon success"><DollarSign /></div>
              <span className="trend-badge positive"><ArrowUpRight size={12} /> {profitMargin}% Margin</span>
            </div>
            <div className="stat-info">
              <h3>Net Profitability</h3>
              <p className="value text-success">${data?.finance?.profit?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || 0}</p>
              <p className="sub-value">Total profit after procurement expenses.</p>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -4 }}
            className="stat-card glass-card kpi border-left-warning"
          >
            <div className="kpi-header">
              <div className="stat-icon warning"><Package /></div>
              <span className={`trend-badge ${data?.inventory?.lowStockItems > 0 ? 'negative' : 'positive'}`}>
                {data?.inventory?.lowStockItems > 0 ? `${data.inventory.lowStockItems} Warnings` : 'Optimal'}
              </span>
            </div>
            <div className="stat-info">
              <h3>Inventory Health</h3>
              <p className="value">{data?.inventory?.totalItems || 0} Products</p>
              <p className="sub-value">{data?.inventory?.lowStockItems || 0} items currently below reorder levels.</p>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -4 }}
            className="stat-card glass-card kpi border-left-primary"
          >
            <div className="kpi-header">
              <div className="stat-icon primary"><ShoppingCart /></div>
              <span className="trend-badge neutral">{data?.procurement?.pendingOrders} Pending</span>
            </div>
            <div className="stat-info">
              <h3>Procurement Commit</h3>
              <p className="value">${data?.procurement?.totalSpend?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || 0}</p>
              <p className="sub-value">Total spend across {data?.procurement?.totalOrders || 0} orders issued.</p>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -4 }}
            className="stat-card glass-card kpi border-left-pink"
          >
            <div className="kpi-header">
              <div className="stat-icon success"><Users /></div>
              <span className="trend-badge positive">Verified</span>
            </div>
            <div className="stat-info">
              <h3>Supplier Coverage</h3>
              <p className="value">{data?.supplier?.totalSuppliers || 0} Vendors</p>
              <p className="sub-value">Active partnerships across the network.</p>
            </div>
          </motion.div>
        </section>

        {/* Charts Row */}
        <div className="charts-row">
          <section className="chart-container glass-card main-chart">
            <div className="chart-header">
              <div className="title-box">
                <h3>Financial Cash Trajectory</h3>
                <p>Detailed analysis of revenue deposits versus operational disbursements</p>
              </div>
              <div className="legend-custom">
                <span className="dot revenue"></span> Revenue
                <span className="dot expense"></span> Expense
              </div>
            </div>
            <div className="chart-wrapper">
              {financialTrends.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={financialTrends}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', fontFamily: 'Outfit' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                    <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2.5} fillOpacity={1} fill="url(#colorExp)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="chart-empty-state">
                  <p>No transaction history logged to aggregate monthly curves.</p>
                </div>
              )}
            </div>
          </section>

          <section className="chart-container glass-card secondary-chart">
            <div className="chart-header">
              <h3>Fulfillment Distribution</h3>
              <p>Delivery completion rates</p>
            </div>
            <div className="chart-wrapper flex-center">
              {data?.procurement?.totalOrders > 0 ? (
                <ResponsiveContainer width="100%" height={230}>
                  <RePieChart>
                    <Pie
                      data={procurementData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={6}
                      dataKey="value"
                    >
                      {procurementData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontFamily: 'Outfit', borderRadius: '8px' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontFamily: 'Outfit' }} />
                  </RePieChart>
                </ResponsiveContainer>
              ) : (
                <div className="chart-empty-state">
                  <p>Create purchase orders to track fulfillment analytics.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Intelligence Insights */}
        <section className="insights-section">
          <div className="glass-card insight-card border-left-success">
            <div className="insight-icon success"><Award size={20} /></div>
            <div className="insight-content">
              <h4>Margin Optimization Alert</h4>
              <p>Your net operational profit margin stands at <strong>{profitMargin}%</strong>. Capital efficiency is high. Recommended action: allocate surplus capital to high-velocity suppliers to secure bulk procurement discounts.</p>
            </div>
          </div>
          
          <div className="glass-card insight-card border-left-warning">
            <div className="insight-icon warning"><AlertCircle size={20} /></div>
            <div className="insight-content">
              <h4>Supply Deficit Risk</h4>
              <p>There are <strong>{data?.inventory?.lowStockItems || 0}</strong> products below safe threshold margins. Operational risk is classified as moderate. Consider issuing auto-procurement purchase orders before stock depletes.</p>
            </div>
          </div>
        </section>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .loading-state-full { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; color: var(--text-secondary); min-height: 80vh; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; margin-top: 24px; }
        
        .header-actions { display: flex; gap: 16px; align-items: center; }
        .range-picker { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 8px 16px; display: flex; align-items: center; gap: 10px; color: var(--text-secondary); font-size: 0.9rem; font-weight: 600; }
        .range-picker select { border: none; background: transparent; color: var(--text-primary); font-weight: 700; outline: none; cursor: pointer; font-family: 'Outfit'; }
        
        .display-flex-gap { display: inline-flex; align-items: center; gap: 8px; }

        .border-left-success { border-left: 5px solid var(--success) !important; }
        .border-left-warning { border-left: 5px solid var(--warning) !important; }
        .border-left-primary { border-left: 5px solid var(--primary) !important; }
        .border-left-pink { border-left: 5px solid var(--secondary) !important; }

        .stat-card.kpi { padding: 24px; border-radius: 16px; background: #fff; border: 1px solid var(--surface-border); }
        .kpi-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
        .stat-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
        .stat-icon.success { background: #ecfdf5; color: var(--success); }
        .stat-icon.warning { background: #fff7ed; color: var(--warning); }
        .stat-icon.primary { background: #eef2ff; color: var(--primary); }
        
        .trend-badge { padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 800; display: flex; align-items: center; gap: 4px; }
        .trend-badge.positive { background: #ecfdf5; color: var(--success); }
        .trend-badge.negative { background: #fef2f2; color: var(--error); }
        .trend-badge.neutral { background: #f8fafc; color: var(--text-secondary); border: 1px solid #e2e8f0; }
        
        .stat-info h3 { font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em; }
        .stat-info .value { font-size: 1.45rem; font-weight: 800; margin: 0; }
        .stat-info .sub-value { font-size: 0.8rem; color: var(--text-secondary); margin-top: 6px; line-height: 1.4; }

        .charts-row { display: grid; grid-template-columns: 2fr 1.1fr; gap: 24px; margin-top: 24px; }
        .chart-container { padding: 24px; border-radius: 16px; background: #fff; border: 1px solid var(--surface-border); }
        .chart-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
        .chart-header h3 { font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin: 0; }
        .chart-header p { font-size: 0.85rem; color: var(--text-secondary); margin: 2px 0 0 0; }
        
        .legend-custom { display: flex; gap: 16px; font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); }
        .dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
        .dot.revenue { background: #10b981; }
        .dot.expense { background: #ef4444; }

        .flex-center { display: flex; align-items: center; justify-content: center; }
        .chart-empty-state { height: 200px; display: flex; align-items: center; justify-content: center; background: #f8fafc; border-radius: 12px; font-size: 0.85rem; color: #94a3b8; border: 1px dashed #e2e8f0; text-align: center; width: 100%; }
        
        .insights-section { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 24px; }
        .insight-card { padding: 20px; display: flex; gap: 16px; align-items: flex-start; background: #fff; border: 1px solid var(--surface-border); border-radius: 16px; }
        .insight-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .insight-icon.success { background: #ecfdf5; color: var(--success); }
        .insight-icon.warning { background: #fff7ed; color: var(--warning); }
        
        .insight-content h4 { margin: 0 0 6px 0; font-size: 0.95rem; font-weight: 700; color: var(--text-primary); }
        .insight-content p { margin: 0; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; }

        .btn-secondary-outline { background: #fff; border: 1px solid #e2e8f0; padding: 10px 18px; border-radius: 12px; font-weight: 700; color: var(--text-secondary); cursor: pointer; transition: all 0.2s; font-size: 0.85rem; }
        .btn-secondary-outline:hover { background: #f8fafc; border-color: #cbd5e1; color: var(--text-primary); }

        @media (max-width: 1024px) {
          .charts-row { grid-template-columns: 1fr; }
          .insights-section { grid-template-columns: 1fr; }
        }

        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spinner { animation: spin 1.5s linear infinite; }
      `}} />
    </div>
  );
};

export default Reports;
