import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { 
  TrendingUp, TrendingDown, DollarSign, Plus, Search, 
  Trash2, Edit3, Loader2, X, AlertTriangle, Sparkles,
  MessageSquare, Briefcase, Coins, Sliders, Calculator,
  Home, FileText, CheckCircle2, Info, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Finance = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  
  // State
  const [selectedTx, setSelectedTx] = useState(null);
  const [formData, setFormData] = useState({ 
    type: 'income', amount: '', category: '', description: '' 
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

  // Runway & Burn Rate interactive calculator state
  const [manualReserves, setManualReserves] = useState('');
  const [manualBurnRate, setManualBurnRate] = useState('');
  const [isCalculatedMode, setIsCalculatedMode] = useState(true); // true = use actual data, false = manual inputs

  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager' || isAdmin;

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await API.get('/finance');
      setTransactions(res.data.transactions || []);
    } catch (err) {
      console.error(err);
      showToast('Failed to load transaction ledger', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchTransactions(); 
  }, []);

  const handleOpenModal = (type, tx = null) => {
    setModalType(type);
    if (type === 'edit' && tx) {
      setSelectedTx(tx);
      setFormData({
        type: tx.type,
        amount: tx.amount,
        category: tx.category,
        description: tx.description || ''
      });
    } else {
      setFormData({ type: 'income', amount: '', category: 'sales', description: '' });
    }
    setShowModal(true);
  };

  const openDeleteModal = (tx) => {
    setSelectedTx(tx);
    setShowDeleteModal(true);
  };

  const viewNote = (tx) => {
    setSelectedTx(tx);
    setShowNoteModal(true);
  };

  const confirmDelete = async () => {
    const txId = selectedTx.id || selectedTx._id;
    try {
      await API.delete(`/finance/${txId}`);
      showToast('Transaction entry removed successfully', 'success');
      setShowDeleteModal(false);
      fetchTransactions();
    } catch (err) {
      showToast('Failed to remove ledger entry', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        type: formData.type,
        amount: Number(formData.amount),
        category: formData.category.toLowerCase().trim() || 'general',
        description: formData.description.trim() || ''
      };

      if (modalType === 'add') {
        await API.post('/finance', payload);
        showToast('Transaction recorded successfully', 'success');
      } else {
        const txId = selectedTx.id || selectedTx._id;
        await API.put(`/finance/${txId}`, payload);
        showToast('Transaction profile updated', 'success');
      }
      setShowModal(false);
      fetchTransactions();
    } catch (err) {
      showToast(err.response?.data?.message || 'Operation failed', 'error');
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const sortedTx = [...transactions].sort((a, b) => {
    if (sortConfig.key === 'createdAt') {
      return sortConfig.direction === 'asc' 
        ? new Date(a.createdAt) - new Date(b.createdAt)
        : new Date(b.createdAt) - new Date(a.createdAt);
    }
    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredTx = sortedTx.filter(tx => {
    const matchesSearch = tx.category.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (tx.description && tx.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === 'All' || tx.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Financial calculations
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const netBalance = totalIncome - totalExpense;

  // Monthly burn rate helper (sums expenses in the last 30 days, or falls back to overall expenses / time, or overall expenses if new)
  const calculateBurnRate = () => {
    const expenses = transactions.filter(t => t.type === 'expense');
    if (expenses.length === 0) return 0;
    
    // Fallback: simple sum of recent or all expenses as a monthly baseline
    return totalExpense;
  };

  const burnRate = calculateBurnRate();
  const calculatedReserves = netBalance > 0 ? netBalance : 0;
  
  // Choose values for the calculator based on mode
  const finalReserves = isCalculatedMode 
    ? calculatedReserves 
    : (Number(manualReserves) || 0);

  const finalBurnRate = isCalculatedMode 
    ? burnRate 
    : (Number(manualBurnRate) || 0);

  // Runway calculation (months)
  const runway = finalBurnRate > 0 ? (finalReserves / finalBurnRate) : (finalReserves > 0 ? 99 : 0);

  const getRunwayStatus = () => {
    if (finalBurnRate === 0 && finalReserves > 0) return { label: 'Infinite Runway', class: 'runway-infinite', text: 'No burn rate detected. Your cash reserves are safe.' };
    if (runway >= 12) return { label: 'Secure (12+ Mo)', class: 'runway-secure', text: 'Excellent! Your cash runway is healthy. You have adequate space to scale.' };
    if (runway >= 6) return { label: 'Moderate (6-12 Mo)', class: 'runway-warning', text: 'Caution: Consider optimizing discretionary spending and scaling sales channels.' };
    return { label: 'Critical (< 6 Mo)', class: 'runway-danger', text: 'Warning: Short runway. Reduce unnecessary expenses immediately and seek financing options.' };
  };

  const statusInfo = getRunwayStatus();

  // Category Icon Selector
  const getCategoryIcon = (category) => {
    const cat = category.toLowerCase();
    if (cat.includes('procurement') || cat.includes('buy') || cat.includes('stock')) return <Briefcase size={16} className="text-indigo" />;
    if (cat.includes('sales') || cat.includes('revenue') || cat.includes('income') || cat.includes('sold')) return <Coins size={16} className="text-success" />;
    if (cat.includes('rent') || cat.includes('office') || cat.includes('building')) return <Home size={16} className="text-warning" />;
    if (cat.includes('tax') || cat.includes('fees') || cat.includes('billing')) return <FileText size={16} className="text-secondary" />;
    return <DollarSign size={16} className="text-primary" />;
  };

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
              Financial Ledger & Runway
            </motion.h1>
            <p>Track cash flows, monitor company runway, and adjust operational burn rates.</p>
          </div>
          <button className="btn-primary" onClick={() => handleOpenModal('add')}>
            <Plus size={20} /> Record Transaction
          </button>
        </header>

        {/* Global Stats Cards */}
        <section className="inventory-summary stats-grid">
          <motion.div whileHover={{ y: -4 }} className="stat-card glass-card border-left-success">
            <div className="stat-icon success"><TrendingUp /></div>
            <div className="stat-info">
              <h3>Total Revenue</h3>
              <p className="value text-success">${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </motion.div>
          <motion.div whileHover={{ y: -4 }} className="stat-card glass-card border-left-danger">
            <div className="stat-icon danger"><TrendingDown /></div>
            <div className="stat-info">
              <h3>Total Expenses</h3>
              <p className="value text-danger">${totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </motion.div>
          <motion.div whileHover={{ y: -4 }} className="stat-card glass-card border-left-primary">
            <div className="stat-icon primary"><Calculator /></div>
            <div className="stat-info">
              <h3>Net Cash Position</h3>
              <p className={`value ${netBalance >= 0 ? 'text-success' : 'text-danger'}`}>
                ${netBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </motion.div>
        </section>

        {/* Interactive Runway Calculator Widget */}
        <section className="runway-widget-container margin-bottom-32">
          <div className="runway-widget glass-card">
            <div className="runway-widget-header">
              <div className="widget-title-area">
                <Sparkles size={20} className="text-purple animate-pulse" />
                <h3>Runway & Burn Rate Simulator</h3>
              </div>
              <div className="calculator-mode-toggle">
                <button 
                  className={`toggle-mode-btn ${isCalculatedMode ? 'active' : ''}`}
                  onClick={() => setIsCalculatedMode(true)}
                >
                  Sync Live Ledger
                </button>
                <button 
                  className={`toggle-mode-btn ${!isCalculatedMode ? 'active' : ''}`}
                  onClick={() => {
                    setIsCalculatedMode(false);
                    if (!manualReserves) setManualReserves(calculatedReserves.toString());
                    if (!manualBurnRate) setManualBurnRate(burnRate.toString());
                  }}
                >
                  Manual Simulation
                </button>
              </div>
            </div>

            <div className="runway-widget-body">
              {/* Inputs */}
              <div className="runway-inputs-panel">
                <div className="runway-slider-group">
                  <div className="slider-label-row">
                    <label>Cash Reserves ($)</label>
                    <span className="slider-val-preview">
                      ${Number(finalReserves).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  {isCalculatedMode ? (
                    <input 
                      type="text" 
                      className="runway-text-display-input" 
                      value={`$${calculatedReserves.toLocaleString()}`} 
                      disabled 
                    />
                  ) : (
                    <div className="slider-input-wrapper">
                      <input 
                        type="range" 
                        min="0" 
                        max={Math.max(calculatedReserves * 2, 50000)} 
                        step="1000"
                        value={manualReserves} 
                        onChange={(e) => setManualReserves(e.target.value)} 
                        className="premium-range-slider"
                      />
                      <input 
                        type="number" 
                        className="range-input-num"
                        value={manualReserves}
                        onChange={(e) => setManualReserves(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                <div className="runway-slider-group">
                  <div className="slider-label-row">
                    <label>Estimated Monthly Burn ($)</label>
                    <span className="slider-val-preview">
                      ${Number(finalBurnRate).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  {isCalculatedMode ? (
                    <input 
                      type="text" 
                      className="runway-text-display-input" 
                      value={`$${burnRate.toLocaleString()}`} 
                      disabled 
                    />
                  ) : (
                    <div className="slider-input-wrapper">
                      <input 
                        type="range" 
                        min="0" 
                        max={Math.max(burnRate * 2, 20000)} 
                        step="500"
                        value={manualBurnRate} 
                        onChange={(e) => setManualBurnRate(e.target.value)} 
                        className="premium-range-slider"
                      />
                      <input 
                        type="number" 
                        className="range-input-num"
                        value={manualBurnRate}
                        onChange={(e) => setManualBurnRate(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Gauge Display Output */}
              <div className="runway-gauge-panel">
                <div className="runway-result-radial">
                  <div className="runway-gauge-number">
                    {runway === 99 ? '∞' : runway.toFixed(1)}
                  </div>
                  <span className="runway-gauge-lbl">Months Remaining</span>
                </div>
                <div className="runway-status-alert">
                  <span className={`runway-status-badge ${statusInfo.class}`}>{statusInfo.label}</span>
                  <p className="runway-status-description">{statusInfo.text}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Ledger Table */}
        <section className="inventory-section glass-card">
          <div className="table-controls">
            <div className="search-bar">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Search ledger category or notes..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filters">
              <span className="filter-label">Filter Type:</span>
              <select 
                className="category-select"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="All">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
          </div>

          <div className="table-wrapper">
            {loading ? (
              <div className="loading-state">
                <Loader2 className="spinner" size={40} />
                <p>Syncing account transactions...</p>
              </div>
            ) : (
              <>
                <table className="premium-table">
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('createdAt')} className="sortable text-left cursor-pointer">Date</th>
                      <th className="text-left">Category & Source</th>
                      <th onClick={() => handleSort('type')} className="sortable text-left cursor-pointer">Type</th>
                      <th className="text-left">Ledger Notes</th>
                      <th onClick={() => handleSort('amount')} className="sortable text-right cursor-pointer">Amount</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTx.map((tx) => {
                      const txId = tx.id || tx._id;
                      const dateStr = new Date(tx.createdAt).toLocaleDateString(undefined, { 
                        month: 'short', day: 'numeric', year: 'numeric' 
                      });
                      return (
                        <motion.tr key={txId} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                          <td className="text-left">
                            <span className="order-date-text">{dateStr}</span>
                          </td>
                          <td className="text-left">
                            <div className="category-cell">
                              <div className="cat-icon-frame">{getCategoryIcon(tx.category)}</div>
                              <span className="category-name-text">
                                {tx.category.charAt(0).toUpperCase() + tx.category.slice(1)}
                              </span>
                            </div>
                          </td>
                          <td className="text-left">
                            <span className={`status-pill ${tx.type}`}>{tx.type}</span>
                          </td>
                          <td className="text-left">
                             {tx.description ? (
                              <button className="note-preview-btn" onClick={() => viewNote(tx)}>
                                <MessageSquare size={14} /> 
                                <span>{tx.description.length > 28 ? tx.description.substring(0, 28) + '...' : tx.description}</span>
                              </button>
                            ) : (
                              <span className="no-note">Automated Integration Record</span>
                            )}
                          </td>
                          <td className="text-right">
                            <strong className={tx.type === 'income' ? 'text-success' : 'text-danger'}>
                              {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </strong>
                          </td>
                          <td className="text-center">
                            <div className="ledger-actions-group">
                              <button className="action-circle-btn edit-btn" title="Edit" onClick={() => handleOpenModal('edit', tx)}>
                                <Edit3 size={14} />
                              </button>
                              <button className="action-circle-btn delete-btn" title="Delete" onClick={() => openDeleteModal(tx)}>
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
                
                {filteredTx.length === 0 && (
                  <div className="empty-state">
                    <div className="empty-icon-box"><Coins size={48} /></div>
                    <h3>No transaction logs</h3>
                    <p>Register cash flows manually or process a supply delivery to auto-issue matching records.</p>
                    <button className="btn-secondary-outline" style={{marginTop: '24px'}} onClick={() => {setSearchTerm(''); setTypeFilter('All')}}>Clear Filters</button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      {/* Note View Modal */}
      <AnimatePresence>
        {showNoteModal && selectedTx && (
          <div className="modal-overlay">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="modal-content glass-card note-modal"
            >
              <div className="modal-header">
                <div className="title-with-icon">
                  <MessageSquare className="text-indigo" size={20} />
                  <h2>Ledger Comments</h2>
                </div>
                <button className="close-modal" onClick={() => setShowNoteModal(false)}><X size={20} /></button>
              </div>
              <div className="note-body">
                <div className="note-meta-row">
                  <span className="meta-badge-lbl">Category: <strong>{selectedTx.category}</strong></span>
                  <span className={`status-pill ${selectedTx.type}`}>{selectedTx.type}</span>
                </div>
                <div className="note-content-box">
                  <p>{selectedTx.description}</p>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-secondary-outline" onClick={() => setShowNoteModal(false)}>Close Note</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="modal-overlay">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="modal-content glass-card"
            >
              <div className="modal-header">
                <h2>{modalType === 'add' ? 'Record Ledger Entry' : 'Update Ledger Record'}</h2>
                <button className="close-modal" onClick={() => setShowModal(false)}><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="input-group">
                  <label>Flow Type</label>
                  <div className="type-toggle">
                    <button type="button" className={formData.type === 'income' ? 'active income' : ''} onClick={() => setFormData({...formData, type: 'income'})}>Income</button>
                    <button type="button" className={formData.type === 'expense' ? 'active expense' : ''} onClick={() => setFormData({...formData, type: 'expense'})}>Expense</button>
                  </div>
                </div>
                
                <div className="input-row">
                  <div className="input-group">
                    <label>Amount ($)</label>
                    <input 
                      type="number" 
                      value={formData.amount} 
                      onChange={(e) => setFormData({...formData, amount: e.target.value})} 
                      min="0.01" 
                      step="0.01" 
                      required 
                    />
                  </div>
                  <div className="input-group">
                    <label>Category</label>
                    <select 
                      className="premium-select"
                      value={formData.category} 
                      onChange={(e) => setFormData({...formData, category: e.target.value})} 
                      required
                    >
                      <option value="sales">Sales & Revenue</option>
                      <option value="procurement">Procurement</option>
                      <option value="rent">Office / Rent</option>
                      <option value="payroll">Payroll / Salary</option>
                      <option value="marketing">Marketing</option>
                      <option value="taxes">Taxes</option>
                      <option value="general">Other / General</option>
                    </select>
                  </div>
                </div>

                <div className="input-group">
                  <label>Description & Notes</label>
                  <textarea 
                    rows="3" 
                    className="premium-textarea"
                    value={formData.description} 
                    onChange={(e) => setFormData({...formData, description: e.target.value})} 
                    placeholder="Provide details about cash flow purpose..." 
                  />
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn-secondary-outline" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">{modalType === 'add' ? 'Record Transaction' : 'Save Changes'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="modal-overlay">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="modal-content glass-card delete-modal"
            >
              <div className="delete-icon-warn"><AlertTriangle size={32} /></div>
              <h2>Delete Ledger Entry?</h2>
              <p>Are you sure you want to permanently delete this financial record? This cannot be undone.</p>
              <div className="modal-footer centered-btns">
                <button type="button" className="btn-secondary-outline" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                <button type="button" className="btn-danger" onClick={confirmDelete}>Remove Entry</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .text-success { color: #059669 !important; }
        .text-danger { color: #dc2626 !important; }
        .text-indigo { color: var(--primary) !important; }
        .text-warning { color: #d97706 !important; }
        
        .text-left { text-align: left !important; }
        .text-right { text-align: right !important; }
        .text-center { text-align: center !important; }
        .margin-bottom-32 { margin-bottom: 32px; }

        .border-left-primary { border-left: 5px solid var(--primary) !important; }
        .border-left-danger { border-left: 5px solid var(--error) !important; }
        .border-left-success { border-left: 5px solid var(--success) !important; }

        .inventory-summary { margin-bottom: 32px; display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
        .stat-card { padding: 24px; display: flex; align-items: center; gap: 20px; border: 1px solid var(--surface-border); border-radius: 16px; background: #fff; }
        .stat-icon { width: 56px; height: 56px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .stat-icon.primary { background: #eef2ff; color: var(--primary); }
        .stat-icon.danger { background: #fef2f2; color: var(--error); }
        .stat-icon.success { background: #ecfdf5; color: var(--success); }
        .stat-info h3 { font-size: 0.9rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.05em; }
        .stat-info .value { font-size: 1.6rem; font-weight: 700; color: var(--text-primary); margin: 0; }

        /* Runway Widget */
        .runway-widget { background: #ffffff !important; border: 1px solid var(--surface-border); border-radius: 20px; padding: 24px; }
        .runway-widget-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; border-bottom: 1px solid #f1f5f9; padding-bottom: 16px; }
        .widget-title-area { display: flex; align-items: center; gap: 10px; }
        .widget-title-area h3 { font-size: 1.15rem; font-weight: 700; color: var(--text-primary); margin: 0; }
        .calculator-mode-toggle { display: flex; background: #f1f5f9; padding: 4px; border-radius: 10px; gap: 4px; border: 1px solid #e2e8f0; }
        .toggle-mode-btn { font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); padding: 8px 14px; border-radius: 8px; background: transparent; transition: all 0.2s; }
        .toggle-mode-btn.active { background: #ffffff; color: var(--primary); box-shadow: 0 2px 4px rgba(0,0,0,0.05); }

        .runway-widget-body { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 32px; align-items: center; }
        .runway-inputs-panel { display: flex; flex-direction: column; gap: 20px; }
        .runway-slider-group { display: flex; flex-direction: column; gap: 8px; }
        .slider-label-row { display: flex; justify-content: space-between; align-items: center; }
        .slider-label-row label { font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); }
        .slider-val-preview { font-weight: 700; color: var(--primary); font-size: 0.95rem; }
        
        .slider-input-wrapper { display: flex; align-items: center; gap: 12px; }
        .premium-range-slider { flex: 1; accent-color: var(--primary); height: 6px; border-radius: 4px; outline: none; cursor: pointer; }
        .range-input-num { width: 100px; padding: 8px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-weight: 700; font-size: 0.9rem; text-align: center; }
        .range-input-num:focus { outline: none; border-color: var(--primary); background: #fff; }
        .runway-text-display-input { width: 100%; padding: 10px 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; font-weight: 700; color: #475569; font-size: 0.95rem; }

        .runway-gauge-panel { display: flex; flex-direction: column; align-items: center; text-align: center; background: #fafafa; border-radius: 16px; padding: 24px; border: 1px dashed #e2e8f0; }
        .runway-result-radial { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 110px; height: 110px; border-radius: 50%; background: #ffffff; border: 6px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
        .runway-gauge-number { font-size: 2.2rem; font-weight: 800; color: var(--text-primary); line-height: 1; }
        .runway-gauge-lbl { font-size: 0.65rem; text-transform: uppercase; font-weight: 700; color: var(--text-secondary); margin-top: 4px; }
        .runway-status-alert { margin-top: 16px; }
        .runway-status-badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; }
        
        .runway-status-badge.runway-infinite { background: #eef2ff; color: var(--primary); }
        .runway-status-badge.runway-secure { background: #ecfdf5; color: var(--success); }
        .runway-status-badge.runway-warning { background: #fff7ed; color: var(--warning); }
        .runway-status-badge.runway-danger { background: #fef2f2; color: var(--error); }
        .runway-status-description { font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4; margin: 0; max-width: 240px; }

        /* Ledger Table custom components */
        .table-controls { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; gap: 20px; background: #fff; padding: 12px; border-radius: 16px; border: 1px solid var(--surface-border); box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        .search-bar { position: relative; flex: 1; max-width: 500px; }
        .search-bar svg { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: var(--text-secondary); pointer-events: none; }
        .search-bar input { width: 100%; padding: 12px 16px 12px 48px; background: #f8fafc; border: 1px solid transparent; border-radius: 12px; color: var(--text-primary); font-size: 0.95rem; transition: all 0.3s ease; }
        .search-bar input:focus { background: #fff; border-color: var(--primary); box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1); outline: none; }

        .filters { display: flex; align-items: center; gap: 12px; }
        .filter-label { font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; }
        .category-select { background: #f8fafc; border: 1px solid transparent; padding: 10px 40px 10px 20px; border-radius: 12px; font-weight: 600; color: var(--text-primary); cursor: pointer; transition: all 0.3s ease; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; }

        .premium-table { width: 100%; border-collapse: separate; border-spacing: 0 8px; }
        .premium-table th { padding: 16px 24px; font-weight: 700; text-transform: uppercase; font-size: 0.75rem; color: var(--text-secondary); }
        .premium-table td { padding: 16px 24px; background: #fff; vertical-align: middle; border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; }
        .premium-table td:first-child { border-left: 1px solid #f1f5f9; border-radius: 12px 0 0 12px; }
        .premium-table td:last-child { border-right: 1px solid #f1f5f9; border-radius: 0 12px 12px 0; }

        .order-date-text { font-size: 0.9rem; font-weight: 500; color: var(--text-secondary); }
        .category-cell { display: flex; align-items: center; gap: 12px; }
        .cat-icon-frame { width: 32px; height: 32px; border-radius: 8px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; }
        .category-name-text { font-weight: 600; color: var(--text-primary); font-size: 0.95rem; }

        .status-pill { padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; display: inline-flex; align-items: center; justify-content: center; width: fit-content; }
        .status-pill.income { background: #ecfdf5; color: var(--success); }
        .status-pill.expense { background: #fef2f2; color: var(--error); }

        .note-preview-btn { display: inline-flex; align-items: center; gap: 8px; color: var(--text-secondary); background: #f8fafc; border: 1px solid #e2e8f0; padding: 6px 12px; border-radius: 8px; font-size: 0.8rem; font-weight: 500; cursor: pointer; transition: all 0.2s; }
        .note-preview-btn:hover { background: #eef2ff; color: var(--primary); border-color: rgba(99, 102, 241, 0.2); }
        .no-note { font-size: 0.8rem; color: #cbd5e1; font-style: italic; }

        .ledger-actions-group { display: flex; justify-content: center; gap: 8px; }
        .action-circle-btn { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: #f8fafc; border: 1px solid #e2e8f0; color: var(--text-secondary); cursor: pointer; transition: all 0.2s; }
        .action-circle-btn:hover { background: #eef2ff; color: var(--primary); border-color: rgba(99, 102, 241, 0.2); }
        .action-circle-btn.delete-btn:hover { background: #fee2e2; color: var(--error); border-color: #fecaca; }

        /* Modal additions */
        .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.3); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 20px; }
        .modal-content { width: 100%; max-width: 500px; padding: 32px; background: #fff !important; border-radius: 20px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.04); border: 1px solid var(--surface-border); }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .modal-header h2 { font-size: 1.4rem; font-weight: 700; color: var(--text-primary); margin: 0; }
        .close-modal { padding: 8px; color: #94a3b8; background: #f1f5f9; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
        .close-modal:hover { background: #fee2e2; color: #ef4444; }

        .type-toggle { display: flex; gap: 10px; margin-top: 6px; }
        .type-toggle button { flex: 1; padding: 12px; border-radius: 10px; border: 1px solid #e2e8f0; background: #f8fafc; font-weight: 600; cursor: pointer; font-size: 0.95rem; color: var(--text-secondary); transition: all 0.2s; }
        .type-toggle button.active.income { background: #ecfdf5; color: var(--success); border-color: #a7f3d0; box-shadow: 0 4px 6px -1px rgba(5, 150, 105, 0.05); }
        .type-toggle button.active.expense { background: #fef2f2; color: var(--error); border-color: #fecaca; box-shadow: 0 4px 6px -1px rgba(220, 38, 38, 0.05); }

        .input-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        .premium-select { width: 100%; padding: 12px 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 0.95rem; font-weight: 600; color: var(--text-primary); appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 16px center; transition: all 0.3s; }
        .premium-select:focus { background: #fff; border-color: var(--primary); outline: none; }

        .premium-textarea { width: 100%; padding: 12px 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 0.95rem; color: var(--text-primary); transition: all 0.3s ease; resize: vertical; min-height: 80px; }
        .premium-textarea:focus { background: #fff; border-color: var(--primary); outline: none; box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1); }

        .btn-secondary-outline { background: #fff; border: 1px solid #e2e8f0; padding: 12px 24px; border-radius: 10px; font-weight: 600; color: var(--text-secondary); cursor: pointer; transition: all 0.2s; }
        .btn-secondary-outline:hover { background: #f8fafc; border-color: #cbd5e1; color: var(--text-primary); }

        .btn-danger { background: #dc2626; color: white; padding: 12px 24px; border-radius: 10px; font-weight: 600; cursor: pointer; }
        .btn-danger:hover { background: #b91c1c; box-shadow: 0 10px 15px -3px rgba(220, 38, 38, 0.3); }

        .note-modal { max-width: 550px; }
        .note-meta-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; }
        .meta-badge-lbl { font-size: 0.85rem; color: var(--text-secondary); }
        .meta-badge-lbl strong { color: var(--text-primary); font-size: 0.9rem; text-transform: uppercase; }
        .note-content-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 12px; min-height: 120px; font-size: 0.95rem; color: var(--text-primary); line-height: 1.6; white-space: pre-wrap; }

        .delete-modal { text-align: center; max-width: 420px; }
        .delete-icon-warn { width: 64px; height: 64px; border-radius: 50%; background: #fee2e2; color: #ef4444; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px auto; }
        .delete-modal h2 { font-size: 1.3rem; font-weight: 700; color: var(--text-primary); margin-bottom: 8px; }
        .delete-modal p { font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 24px; }
        .centered-btns { display: flex; justify-content: center; gap: 12px; }

        .empty-state { padding: 60px 40px; text-align: center; border: 2px dashed #e2e8f0; border-radius: 16px; margin: 24px auto; background: #fff; width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .empty-icon-box { width: 80px; height: 80px; background: #f8fafc; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; color: #cbd5e1; border: 1px solid #f1f5f9; }
        .empty-state h3 { font-size: 1.3rem; color: #1e293b; margin-bottom: 8px; font-weight: 700; }
        .empty-state p { color: #64748b; font-size: 0.95rem; margin-bottom: 0; max-width: 320px; line-height: 1.5; }

        @media (max-width: 768px) {
          .runway-widget-body { grid-template-columns: 1fr; gap: 24px; }
        }

        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spinner { animation: spin 1.5s linear infinite; }
      `}} />
    </div>
  );
};

export default Finance;
