import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { 
  Users, Plus, Search, Trash2, Edit3, Loader2, X, 
  ArrowUpDown, Mail, Phone, MapPin, Star, TrendingUp, 
  ShieldCheck, AlertCircle, CheckCircle2, BarChart3, Clock, Percent
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Suppliers = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [suppliers, setSuppliers] = useState([]);
  const [performances, setPerformances] = useState({});
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPerfModal, setShowPerfModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [isEditingPerf, setIsEditingPerf] = useState(false);
  
  // State
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', contact: '', email: '', address: '', category: 'General' 
  });
  const [perfData, setPerfData] = useState({
    onTimeDeliveryRate: '',
    defectRate: '',
    avgDeliveryTime: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager' || isAdmin;

  const fetchSuppliers = async () => {
    try {
      const res = await API.get('/supplier');
      setSuppliers(res.data.suppliers || []);
      
      const perfRes = await API.get('/supplier/performance/all');
      const perfMap = {};
      (perfRes.data.performances || []).forEach(p => {
        perfMap[p.supplierId] = p;
      });
      setPerformances(perfMap);
    } catch (err) {
      console.error(err);
      showToast('Failed to load supplier network', 'error');
    }
  };

  const syncData = async () => {
    setLoading(true);
    await fetchSuppliers();
    setLoading(false);
  };

  useEffect(() => {
    syncData();
  }, []);

  const handleOpenModal = (type, supplier = null) => {
    setModalType(type);
    if (type === 'edit' && supplier) {
      setSelectedSupplier(supplier);
      setFormData({
        name: supplier.name,
        contact: supplier.contact,
        email: supplier.email || '',
        address: supplier.address || '',
        category: supplier.category || 'General'
      });
    } else {
      setFormData({ name: '', contact: '', email: '', address: '', category: 'General' });
    }
    setShowModal(true);
  };

  const openDeleteModal = (supplier) => {
    setSelectedSupplier(supplier);
    setShowDeleteModal(true);
  };

  const viewPerformance = (supplier) => {
    setSelectedSupplier(supplier);
    const existingPerf = performances[supplier._id];
    setPerfData({
      onTimeDeliveryRate: existingPerf ? existingPerf.onTimeDeliveryRate : '95',
      defectRate: existingPerf ? existingPerf.defectRate : '1',
      avgDeliveryTime: existingPerf ? existingPerf.avgDeliveryTime : '3'
    });
    setIsEditingPerf(false);
    setShowPerfModal(true);
  };

  const confirmDelete = async () => {
    try {
      await API.delete(`/supplier/${selectedSupplier._id}`);
      showToast('Supplier removed from network', 'success');
      setShowDeleteModal(false);
      fetchSuppliers();
    } catch (err) {
      showToast('Failed to delete supplier', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (modalType === 'add') {
        await API.post('/supplier', payload);
        showToast('New supplier registered successfully', 'success');
      } else {
        await API.put(`/supplier/${selectedSupplier._id}`, payload);
        showToast('Supplier profile updated successfully', 'success');
      }
      setShowModal(false);
      fetchSuppliers();
    } catch (err) {
      showToast(err.response?.data?.message || 'Operation failed', 'error');
    }
  };

  const handleSavePerformance = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        onTimeDeliveryRate: Number(perfData.onTimeDeliveryRate),
        defectRate: Number(perfData.defectRate),
        avgDeliveryTime: Number(perfData.avgDeliveryTime)
      };

      await API.post(`/supplier/${selectedSupplier._id}/performance`, payload);
      showToast('Supplier performance metrics updated', 'success');
      setIsEditingPerf(false);
      fetchSuppliers(); // refresh performance values
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update performance metrics', 'error');
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const sortedSuppliers = [...suppliers].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const categories = ['All', ...new Set(suppliers.map(s => s.category || 'General'))];

  const filteredSuppliers = sortedSuppliers.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (s.category || 'General').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || (s.category || 'General') === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getRating = (sid) => {
    const p = performances[sid];
    if (!p) return 'N/A';
    const score = (p.onTimeDeliveryRate * 0.6 + (100 - p.defectRate) * 0.4);
    return (score / 20).toFixed(1);
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
              Supplier Network
            </motion.h1>
            <p>Connect with vendors, monitor performance, and manage procurement channels.</p>
          </div>
          <button className="btn-primary" onClick={() => handleOpenModal('add')}>
            <Plus size={20} /> Register Supplier
          </button>
        </header>

        {/* Supplier Stats Grid */}
        <section className="inventory-summary stats-grid">
          <div className="stat-card glass-card">
            <div className="stat-icon primary"><Users /></div>
            <div className="stat-info">
              <h3>Total Vendors</h3>
              <p className="value">{suppliers.length}</p>
            </div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-icon success"><ShieldCheck /></div>
            <div className="stat-info">
              <h3>Top Performers</h3>
              <p className="value">
                {suppliers.filter(s => {
                  const rating = getRating(s._id);
                  return rating !== 'N/A' && parseFloat(rating) >= 4.5;
                }).length}
              </p>
            </div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-icon warning"><TrendingUp /></div>
            <div className="stat-info">
              <h3>Active Categories</h3>
              <p className="value">{Math.max(categories.length - 1, 0)}</p>
            </div>
          </div>
        </section>

        {/* Vendors Directory */}
        <section className="inventory-section glass-card">
          <div className="table-controls">
            <div className="search-bar">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Search by company, contact, or category..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filters">
              <span className="filter-label">Filter by:</span>
              <select 
                className="category-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>

          <div className="table-wrapper">
            {loading ? (
              <div className="loading-state">
                <Loader2 className="spinner" size={40} />
                <p>Syncing supplier network...</p>
              </div>
            ) : (
              <>
                <table className="premium-table">
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('name')} className="sortable">Vendor Name <ArrowUpDown size={14} /></th>
                      <th>Contact Info</th>
                      <th>Category</th>
                      <th>Rating Score</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSuppliers.map((s) => (
                      <motion.tr key={s._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <td>
                          <div className="product-cell aligned">
                            <div className="supplier-avatar-mini">{s.name.charAt(0)}</div>
                            <div className="vendor-meta">
                              <p className="p-name">{s.name}</p>
                              <p className="p-desc"><MapPin size={12} /> {s.address || 'Remote / Online'}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="contact-column">
                            <div className="contact-mini"><Phone size={12} /> {s.contact}</div>
                            <div className="contact-mini subtle"><Mail size={12} /> {s.email || 'No email registered'}</div>
                          </div>
                        </td>
                        <td><span className="cat-badge">{s.category || 'General'}</span></td>
                        <td>
                          <div className="rating-pill">
                            <Star size={12} fill={getRating(s._id) !== 'N/A' && parseFloat(getRating(s._id)) >= 4.0 ? '#f59e0b' : '#cbd5e1'} color={getRating(s._id) !== 'N/A' && parseFloat(getRating(s._id)) >= 4.0 ? '#f59e0b' : '#cbd5e1'} />
                            <span>{getRating(s._id)}</span>
                          </div>
                        </td>
                        <td className="actions">
                          <button className="icon-btn" title="View/Edit Performance" onClick={() => viewPerformance(s)}>
                            <BarChart3 size={18} />
                          </button>
                          <button className="icon-btn" title="Edit Profile" onClick={() => handleOpenModal('edit', s)}>
                            <Edit3 size={18} />
                          </button>
                          <button className="icon-btn delete" title="Delete Vendor" onClick={() => openDeleteModal(s)}>
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
                {filteredSuppliers.length === 0 && (
                  <div className="empty-state">
                    <div className="empty-icon-box"><Users size={48} /></div>
                    <h3>No vendors found</h3>
                    <button className="btn-secondary" onClick={() => {setSearchTerm(''); setCategoryFilter('All')}}>Clear all filters</button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      {/* Add/Edit Profile Modal */}
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
                <h2>{modalType === 'add' ? 'Register New Supplier' : 'Update Supplier Profile'}</h2>
                <button className="close-modal" onClick={() => setShowModal(false)}><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="input-group">
                  <label>Company Name</label>
                  <input type="text" placeholder="e.g. Global Tech Logistics" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div className="input-row">
                  <div className="input-group">
                    <label>Contact Representative</label>
                    <input type="text" placeholder="e.g. Alice Johnson" value={formData.contact} onChange={(e) => setFormData({...formData, contact: e.target.value})} required />
                  </div>
                  <div className="input-group">
                    <label>Email Address</label>
                    <input type="email" placeholder="vendor@example.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                  </div>
                </div>
                <div className="input-group">
                  <label>Category Group</label>
                  <input type="text" placeholder="e.g. Hardware, Storage, Cables" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} required />
                </div>
                <div className="input-group">
                  <label>Office Address</label>
                  <textarea rows="2" className="premium-textarea" placeholder="Full business headquarters address" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-secondary-outline" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">{modalType === 'add' ? 'Register Vendor' : 'Save Changes'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="modal-overlay danger">
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="modal-content glass-card delete-modal">
              <div className="delete-icon-warn danger"><AlertCircle size={32} /></div>
              <h2>Remove Vendor Profile?</h2>
              <p>Removing <strong>{selectedSupplier?.name}</strong> will delete their registration. Linked inventory items will show as unassigned.</p>
              <div className="modal-footer centered">
                <button type="button" className="btn-secondary-outline" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                <button type="button" className="btn-danger" onClick={confirmDelete}>Remove Permanently</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Performance View & Log Modal */}
      <AnimatePresence>
        {showPerfModal && (
          <div className="modal-overlay">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }} 
              className="modal-content glass-card performance-modal"
            >
              <div className="modal-header">
                <div className="title-with-icon">
                  <BarChart3 className="text-primary" size={24} />
                  <h2>Vendor Performance Analytics</h2>
                </div>
                <button className="close-modal" onClick={() => setShowPerfModal(false)}><X size={20} /></button>
              </div>
              
              <div className="perf-body">
                <div className="vendor-summary-perf">
                  <div className="supplier-avatar-mini large">{selectedSupplier?.name.charAt(0)}</div>
                  <div>
                    <h3>{selectedSupplier?.name}</h3>
                    <p className="cat-badge">{selectedSupplier?.category || 'General'}</p>
                  </div>
                </div>

                {!isEditingPerf ? (
                  <div className="perf-details-view animate-fade">
                    <div className="perf-stats-grid">
                      <div className="perf-item">
                        <label>On-Time Delivery Rate</label>
                        <div className="perf-val-row">
                          <span className="perf-val">{performances[selectedSupplier?._id]?.onTimeDeliveryRate ?? 'N/A'}%</span>
                          <div className="perf-bar-bg">
                            <div 
                              className="perf-bar" 
                              style={{ 
                                width: `${performances[selectedSupplier?._id]?.onTimeDeliveryRate ?? 0}%`, 
                                background: '#10b981' 
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      <div className="perf-item">
                        <label>Quality Defect Rate</label>
                        <div className="perf-val-row">
                          <span className="perf-val">{performances[selectedSupplier?._id]?.defectRate ?? 'N/A'}%</span>
                          <div className="perf-bar-bg">
                            <div 
                              className="perf-bar" 
                              style={{ 
                                width: `${performances[selectedSupplier?._id]?.defectRate ?? 0}%`, 
                                background: '#ef4444' 
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      <div className="perf-item">
                        <label>Average Fulfillment Lead-Time</label>
                        <div className="perf-val-row">
                          <span className="perf-val">{performances[selectedSupplier?._id]?.avgDeliveryTime ?? 'N/A'} days</span>
                          <div className="perf-bar-bg">
                            <div 
                              className="perf-bar" 
                              style={{ 
                                width: `${Math.min((performances[selectedSupplier?._id]?.avgDeliveryTime ?? 0) * 10, 100)}%`, 
                                background: '#3b82f6' 
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {isManager && (
                      <div className="perf-action-row-modal">
                        <button 
                          type="button" 
                          className="btn-primary update-perf-btn"
                          onClick={() => setIsEditingPerf(true)}
                        >
                          <Edit3 size={16} /> Log Performance Review
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleSavePerformance} className="perf-edit-form animate-fade">
                    <div className="input-group">
                      <label className="icon-label-group"><Percent size={14} /> On-Time Delivery Rate (%)</label>
                      <input 
                        type="number" 
                        min="0" max="100" 
                        value={perfData.onTimeDeliveryRate}
                        onChange={(e) => setPerfData({...perfData, onTimeDeliveryRate: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="input-group">
                      <label className="icon-label-group"><Percent size={14} /> Defect Rate (%)</label>
                      <input 
                        type="number" 
                        min="0" max="100" 
                        value={perfData.defectRate}
                        onChange={(e) => setPerfData({...perfData, defectRate: e.target.value})}
                        required
                      />
                    </div>

                    <div className="input-group">
                      <label className="icon-label-group"><Clock size={14} /> Average Delivery Days</label>
                      <input 
                        type="number" 
                        min="1" 
                        value={perfData.avgDeliveryTime}
                        onChange={(e) => setPerfData({...perfData, avgDeliveryTime: e.target.value})}
                        required
                      />
                    </div>

                    <div className="modal-footer">
                      <button 
                        type="button" 
                        className="btn-secondary-outline" 
                        onClick={() => setIsEditingPerf(false)}
                      >
                        Back
                      </button>
                      <button type="submit" className="btn-primary">Save Scorecard</button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .text-primary { color: var(--primary) !important; }
        .stats-grid { margin-bottom: 32px; display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
        .stat-card { padding: 32px; display: flex; align-items: center; gap: 24px; border: 1px solid var(--surface-border); border-radius: 20px; background: #fff; }
        .stat-icon { width: 64px; height: 64px; border-radius: 16px; display: flex; align-items: center; justify-content: center; }
        .stat-icon.primary { background: #eef2ff; color: var(--primary); }
        .stat-icon.success { background: #f0fdf4; color: #10b981; }
        .stat-icon.warning { background: #fffbeb; color: #f59e0b; }
        .stat-info h3 { font-size: 0.95rem; color: var(--text-secondary); margin-bottom: 8px; font-weight: 600; }
        .stat-info .value { font-size: 1.8rem; font-weight: 700; margin: 0; }

        .inventory-section {
          padding: 24px;
          background: #ffffff !important;
          border: 1px solid #e2e8f0;
          border-radius: 24px;
        }

        .table-controls { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; gap: 20px; }
        .search-bar { position: relative; flex: 1; max-width: 500px; }
        .search-bar svg { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: var(--text-secondary); pointer-events: none; }
        .search-bar input { width: 100%; padding: 12px 16px 12px 48px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; color: var(--text-primary); font-size: 0.95rem; transition: all 0.3s ease; }
        .search-bar input:focus { background: #fff; border-color: var(--primary); box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1); outline: none; }

        .filters { display: flex; align-items: center; gap: 12px; }
        .filter-label { font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; }
        .category-select { background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px 40px 10px 16px; border-radius: 12px; font-weight: 600; color: var(--text-primary); cursor: pointer; transition: all 0.3s ease; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; }
        .category-select:focus { background: #fff; border-color: var(--primary); outline: none; }

        .table-wrapper { overflow-x: auto; }
        .premium-table { width: 100%; border-collapse: separate; border-spacing: 0 12px; margin-top: -12px; }
        .premium-table th { padding: 12px 20px; font-weight: 700; text-transform: uppercase; font-size: 0.75rem; color: var(--text-secondary); text-align: left; }
        .premium-table td { padding: 16px 20px; background: #fff; vertical-align: middle; border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; }
        .premium-table td:first-child { border-left: 1px solid #f1f5f9; border-radius: 16px 0 0 16px; }
        .premium-table td:last-child { border-right: 1px solid #f1f5f9; border-radius: 0 16px 16px 0; }
        .premium-table tr:hover td { background: #f8fafc; border-color: #cbd5e1; }

        .product-cell.aligned { display: flex; align-items: center; gap: 16px; }
        .supplier-avatar-mini { width: 44px; height: 44px; background: #eef2ff; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 700; color: var(--primary); font-size: 1.1rem; flex-shrink: 0; }
        .supplier-avatar-mini.large { width: 56px; height: 56px; font-size: 1.4rem; border-radius: 16px; }
        
        .vendor-meta { display: flex; flex-direction: column; gap: 2px; }
        .p-name { font-weight: 700; color: var(--text-primary); margin: 0; font-size: 0.95rem; }
        .p-desc { font-size: 0.8rem; color: #94a3b8; margin: 0; display: flex; align-items: center; gap: 4px; }

        .contact-column { display: flex; flex-direction: column; gap: 4px; }
        .contact-mini { font-size: 0.85rem; font-weight: 600; color: #475569; display: flex; align-items: center; gap: 6px; }
        .contact-mini.subtle { color: #94a3b8; font-weight: 400; }

        .cat-badge { padding: 4px 10px; background: #f1f5f9; border-radius: 8px; font-size: 0.75rem; font-weight: 600; color: #475569; border: 1px solid #e2e8f0; width: fit-content; }
        
        .rating-pill { display: flex; align-items: center; gap: 6px; background: #fffbeb; padding: 4px 10px; border-radius: 20px; font-weight: 700; color: #f59e0b; font-size: 0.85rem; border: 1px solid #fef3c7; width: fit-content; }

        .actions { display: flex; gap: 8px; }
        .icon-btn { padding: 10px; color: #64748b; border-radius: 10px; transition: all 0.2s; background: transparent; }
        .icon-btn:hover { background: #f1f5f9; color: var(--primary); }
        .icon-btn.delete:hover { color: var(--error); background: #fee2e2; }

        .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.3); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 20px; }
        .modal-content { width: 100%; max-width: 500px; padding: 32px; background: #fff !important; border-radius: 20px; border: 1px solid #cbd5e1; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
        
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .modal-header h2 { font-size: 1.4rem; font-weight: 700; color: var(--text-primary); margin: 0; }
        .title-with-icon { display: flex; align-items: center; gap: 10px; }
        .close-modal { padding: 8px; color: #94a3b8; background: #f1f5f9; border-radius: 10px; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
        .close-modal:hover { background: #fee2e2; color: #ef4444; transform: rotate(90deg); }

        .modal-footer { margin-top: 32px; display: flex; justify-content: flex-end; gap: 12px; }
        .centered { justify-content: center !important; }

        .premium-textarea { width: 100%; padding: 14px 16px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 0.95rem; color: var(--text-primary); transition: all 0.3s ease; resize: vertical; min-height: 80px; outline: none; }
        .premium-textarea:focus { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1); }

        .btn-secondary-outline { padding: 12px 24px; border-radius: 12px; font-weight: 600; color: #64748b; border: 1px solid #e2e8f0; background: #fff; transition: all 0.2s; }
        .btn-secondary-outline:hover { background: #f8fafc; color: var(--text-primary); border-color: #cbd5e1; }

        .vendor-summary-perf { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; background: #f8fafc; padding: 16px; border-radius: 16px; border: 1px solid #e2e8f0; }
        .vendor-summary-perf h3 { font-size: 1.1rem; font-weight: 700; color: #0f172a; margin: 0 0 4px 0; }

        .perf-stats-grid { display: flex; flex-direction: column; gap: 20px; }
        .perf-item label { font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; margin-bottom: 8px; display: block; }
        .perf-val-row { display: flex; align-items: center; gap: 16px; }
        .perf-val { font-weight: 800; color: var(--text-primary); width: 64px; font-size: 1.05rem; }
        .perf-bar-bg { flex: 1; height: 8px; background: #f1f5f9; border-radius: 5px; overflow: hidden; }
        .perf-bar { height: 100%; border-radius: 5px; transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1); }

        .perf-action-row-modal { margin-top: 32px; display: flex; justify-content: center; }
        .update-perf-btn { background: #eef2ff; color: #4f46e5; border: 1px solid #cbd5e1; font-weight: 600; gap: 6px; }
        .update-perf-btn:hover { background: #e0e7ff; color: #4338ca; }

        .icon-label-group { display: flex; align-items: center; gap: 6px; }

        .input-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

        .delete-modal { text-align: center; max-width: 440px !important; }
        .delete-icon-warn { width: 64px; height: 64px; background: #fff7ed; color: #f59e0b; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; border: 4px solid #fff; box-shadow: 0 0 0 4px #fffbeb; }
        .delete-modal h2 { margin-bottom: 12px; color: #1e293b; font-size: 1.3rem; }
        .delete-modal p { color: #64748b; line-height: 1.6; margin-bottom: 28px; font-size: 0.95rem; }

        .loading-state { padding: 100px 0; text-align: center; color: var(--text-secondary); }
        .spinner { animation: spin 1.5s linear infinite; margin-bottom: 16px; color: var(--primary); }

        .empty-state { padding: 100px 40px; text-align: center; border: 2px dashed #e2e8f0; border-radius: 24px; margin-top: 24px; background: #fff; width: 100%; display: flex; flex-direction: column; align-items: center; }
        .empty-icon-box { width: 80px; height: 80px; background: #f8fafc; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; color: #cbd5e1; }

        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}} />
    </div>
  );
};

export default Suppliers;
