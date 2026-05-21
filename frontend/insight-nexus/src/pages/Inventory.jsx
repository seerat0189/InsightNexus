import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useToast } from '../context/ToastContext';
import API from '../services/api';
import { 
  Package, Plus, Search, Trash2, Edit3, 
  Loader2, AlertTriangle, ArrowUpDown, ChevronDown, X,
  User, CheckCircle2, DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  
  // Modals
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  
  // State
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', category: '', quantity: '', unitPrice: '', reorderLevel: '', reorderQuantity: '10', unit: 'pcs', supplierId: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  const fetchItems = async () => {
    try {
      const res = await API.get('/inventory');
      setItems(res.data.items);
    } catch (err) {
      console.error(err);
      showToast('Failed to load inventory items', 'error');
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await API.get('/supplier');
      setSuppliers(res.data.suppliers || []);
    } catch (err) {
      console.error(err);
    }
  };

  const syncData = async () => {
    setLoading(true);
    await Promise.all([fetchItems(), fetchSuppliers()]);
    setLoading(false);
  };

  useEffect(() => {
    syncData();
  }, []);

  const handleOpenModal = (type, item = null) => {
    setModalType(type);
    if (type === 'edit' && item) {
      setSelectedItem(item);
      setFormData({
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        reorderLevel: item.reorderLevel,
        reorderQuantity: item.reorderQuantity || 10,
        unit: item.unit || 'pcs',
        supplierId: item.supplierId || ''
      });
    } else {
      setFormData({ 
        name: '', category: '', quantity: '', unitPrice: '', reorderLevel: '', reorderQuantity: '10', unit: 'pcs', supplierId: '' 
      });
    }
    setShowModal(true);
  };

  const openDeleteModal = (item) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await API.delete(`/inventory/${selectedItem._id}`);
      showToast('Product removed successfully', 'success');
      setShowDeleteModal(false);
      fetchItems();
    } catch (err) {
      showToast('Failed to delete product', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        quantity: Number(formData.quantity),
        unitPrice: Number(formData.unitPrice),
        reorderLevel: Number(formData.reorderLevel),
        reorderQuantity: Number(formData.reorderQuantity),
        supplierId: formData.supplierId || null,
        unit: formData.unit || 'pcs'
      };

      if (modalType === 'add') {
        await API.post('/inventory', payload);
        showToast('Product added successfully', 'success');
      } else {
        await API.put(`/inventory/${selectedItem._id}`, payload);
        showToast('Product updated successfully', 'success');
      }
      setShowModal(false);
      fetchItems();
    } catch (err) {
      showToast(err.response?.data?.message || 'Operation failed', 'error');
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getStockBadge = (item) => {
    if (item.quantity === 0) {
      return <span className="stock-badge out-of-stock">Out of Stock</span>;
    } else if (item.quantity <= item.reorderLevel) {
      return <span className="stock-badge low-stock">Low Stock</span>;
    } else if (item.quantity <= item.reorderLevel * 1.5) {
      return <span className="stock-badge reorder-warn">Reorder Warn</span>;
    } else {
      return <span className="stock-badge in-stock">In Stock</span>;
    }
  };

  const getSupplierName = (supplierId) => {
    const s = suppliers.find(sup => sup._id === supplierId);
    return s ? s.name : 'Unassigned';
  };

  const sortedItems = [...items].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const categories = ['All', ...new Set(items.map(i => i.category))];

  const filteredItems = sortedItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          getSupplierName(item.supplierId).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const lowStockCount = items.filter(i => i.quantity <= i.reorderLevel).length;

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
              Inventory Management
            </motion.h1>
            <p>Monitor stock, manage products, and optimize your supply chain.</p>
          </div>
          <button className="btn-primary" onClick={() => handleOpenModal('add')}>
            <Plus size={20} /> Add New Product
          </button>
        </header>

        {/* Summary Dashboard Grid */}
        <section className="inventory-summary">
          <div className="stat-card glass-card">
            <div className="stat-icon primary"><Package /></div>
            <div className="stat-info">
              <h3>Total Products</h3>
              <p className="value">{items.length}</p>
            </div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-icon warning"><AlertTriangle /></div>
            <div className="stat-info">
              <h3>Low Stock Items</h3>
              <p className="value">{lowStockCount}</p>
            </div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-icon success"><CheckCircle2 /></div>
            <div className="stat-info">
              <h3>Inventory Value</h3>
              <p className="value">
                ${items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </section>

        {/* Filter and Table Container */}
        <section className="inventory-section glass-card">
          <div className="table-controls">
            <div className="search-bar">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Search by name, category, or vendor..." 
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
                <p>Syncing inventory data...</p>
              </div>
            ) : (
              <table className="premium-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('name')} className="sortable">
                      Product Details <ArrowUpDown size={14} />
                    </th>
                    <th>Category</th>
                    <th>Supplier Assigned</th>
                    <th onClick={() => handleSort('quantity')} className="sortable">
                      Stock Level <ArrowUpDown size={14} />
                    </th>
                    <th onClick={() => handleSort('unitPrice')} className="sortable">
                      Unit Price <ArrowUpDown size={14} />
                    </th>
                    <th>Total Value</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <motion.tr 
                      key={item._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                    >
                      <td>
                        <div className="product-cell">
                          <div className="product-icon"><Package size={16} /></div>
                          <div>
                            <p className="p-name">{item.name}</p>
                            <p className="p-id">ID: {item._id.slice(-6).toUpperCase()}</p>
                          </div>
                        </div>
                      </td>
                      <td><span className="cat-badge">{item.category}</span></td>
                      <td>
                        <div className="supplier-cell-display">
                          <User size={14} className="text-secondary" />
                          <span>{getSupplierName(item.supplierId)}</span>
                        </div>
                      </td>
                      <td>
                        <div className="stock-info">
                          <div className="stock-header-badge">
                            <p className="stock-val">{item.quantity} {item.unit || 'pcs'}</p>
                            {getStockBadge(item)}
                          </div>
                          <div className="stock-progress">
                            <div 
                              className={`progress-bar ${item.quantity <= item.reorderLevel ? 'low' : ''}`}
                              style={{ width: `${Math.min((item.quantity / (Math.max(item.reorderLevel, 1) * 2)) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td>${item.unitPrice.toLocaleString()}</td>
                      <td><strong>${(item.quantity * item.unitPrice).toLocaleString()}</strong></td>
                      <td className="actions">
                        <button className="icon-btn" title="Edit" onClick={() => handleOpenModal('edit', item)}>
                          <Edit3 size={18} />
                        </button>
                        <button className="icon-btn delete" title="Delete" onClick={() => openDeleteModal(item)}>
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
            {!loading && filteredItems.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon-box">
                  <Package size={48} />
                </div>
                <h3>No items found</h3>
                <p>Try adjusting your search or filters to find what you're looking for.</p>
                <button className="btn-secondary" onClick={() => {setSearchTerm(''); setCategoryFilter('All')}}>
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

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
                <h2>{modalType === 'add' ? 'Add New Product' : 'Edit Product'}</h2>
                <button className="close-modal" onClick={() => setShowModal(false)}><X size={20} /></button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="input-group">
                  <label>Product Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Core Switch 24-Port" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required 
                  />
                </div>

                <div className="input-row">
                  <div className="input-group">
                    <label>Category</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Hardware" 
                      value={formData.category} 
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="input-group">
                    <label>Supplier Vendor</label>
                    <select
                      className="modal-select"
                      value={formData.supplierId}
                      onChange={(e) => setFormData({...formData, supplierId: e.target.value})}
                    >
                      <option value="">No Supplier Assigned</option>
                      {suppliers.map((sup) => (
                        <option key={sup._id} value={sup._id}>{sup.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="input-row">
                  <div className="input-group">
                    <label>Unit Price ($)</label>
                    <input 
                      type="number" 
                      placeholder="0.00" 
                      step="0.01"
                      value={formData.unitPrice} 
                      onChange={(e) => setFormData({...formData, unitPrice: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="input-group">
                    <label>Stock Quantity</label>
                    <div className="qty-input">
                      <input 
                        type="number" 
                        placeholder="0" 
                        value={formData.quantity} 
                        onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                        required 
                      />
                      <select value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})}>
                        <option value="pcs">pcs</option>
                        <option value="kg">kg</option>
                        <option value="units">units</option>
                        <option value="boxes">boxes</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="input-row">
                  <div className="input-group">
                    <label>Reorder Alert Level</label>
                    <input 
                      type="number" 
                      placeholder="5" 
                      value={formData.reorderLevel} 
                      onChange={(e) => setFormData({...formData, reorderLevel: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="input-group">
                    <label>Default Reorder Quantity</label>
                    <input 
                      type="number" 
                      placeholder="10" 
                      value={formData.reorderQuantity} 
                      onChange={(e) => setFormData({...formData, reorderQuantity: e.target.value})}
                      required 
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn-secondary-outline" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">
                    {modalType === 'add' ? 'Create Product' : 'Save Changes'}
                  </button>
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
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="modal-content glass-card delete-modal"
            >
              <div className="delete-icon-warn">
                <AlertTriangle size={32} />
              </div>
              <h2>Confirm Deletion</h2>
              <p>
                Are you sure you want to delete <strong>{selectedItem?.name}</strong>? 
                This action cannot be undone and will remove the item from all records.
              </p>
              
              <div className="modal-footer centered">
                <button type="button" className="btn-secondary-outline" onClick={() => setShowDeleteModal(false)}>No, keep it</button>
                <button type="button" className="btn-danger" onClick={confirmDelete}>Yes, delete it</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .inventory-summary { margin-bottom: 32px; display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
        .stat-card { padding: 32px; display: flex; align-items: center; gap: 24px; min-height: 120px; border: 1px solid var(--surface-border); border-radius: 20px; background: #ffffff !important; }
        .stat-icon { width: 64px; height: 64px; border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .stat-icon svg { width: 28px; height: 28px; }
        .stat-info h3 { font-size: 0.95rem; color: var(--text-secondary); margin-bottom: 8px; font-weight: 600; }
        .stat-info .value { font-size: 1.8rem; font-weight: 700; margin: 0; color: var(--text-primary); letter-spacing: -0.5px; }
        
        .stat-icon.primary { background: #eef2ff; color: var(--primary); }
        .stat-icon.warning { background: #fffbeb; color: var(--warning); }
        .stat-icon.success { background: #f0fdf4; color: var(--success); }

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
        .premium-table th { padding: 12px 20px; font-weight: 700; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em; color: var(--text-secondary); text-align: left; }
        .sortable { cursor: pointer; transition: color 0.2s; }
        .sortable:hover { color: var(--primary); }
        .sortable svg { display: inline-block; vertical-align: middle; margin-left: 4px; opacity: 0.5; }

        .premium-table td { padding: 16px 20px; background: #fff; vertical-align: middle; border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; }
        .premium-table td:first-child { border-left: 1px solid #f1f5f9; border-radius: 16px 0 0 16px; }
        .premium-table td:last-child { border-right: 1px solid #f1f5f9; border-radius: 0 16px 16px 0; }
        .premium-table tr:hover td { background: #f8fafc; border-color: #cbd5e1; }

        .product-cell { display: flex; align-items: center; gap: 16px; }
        .product-icon { width: 44px; height: 44px; background: #f1f5f9; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: var(--primary); }
        .p-name { font-weight: 700; color: var(--text-primary); font-size: 0.95rem; margin: 0; }
        .p-id { font-size: 0.75rem; color: #94a3b8; margin-top: 2px; }

        .cat-badge { padding: 4px 10px; background: #f1f5f9; border-radius: 8px; font-size: 0.75rem; font-weight: 600; color: #475569; border: 1px solid #e2e8f0; }
        
        .supplier-cell-display { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; color: #475569; font-weight: 500; }
        .text-secondary { color: #64748b; }

        .stock-info { min-width: 180px; }
        .stock-header-badge { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
        .stock-val { font-size: 0.9rem; font-weight: 700; color: #0f172a; margin: 0; }
        
        .stock-badge { padding: 2px 8px; border-radius: 99px; font-size: 0.75rem; font-weight: 700; }
        .stock-badge.out-of-stock, .stock-badge.low-stock { background: #fee2e2; color: #ef4444; border: 1px solid #fecaca; }
        .stock-badge.reorder-warn { background: #fef3c7; color: #d97706; border: 1px solid #fde68a; }
        .stock-badge.in-stock { background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }

        .stock-progress { height: 6px; background: #f1f5f9; border-radius: 5px; overflow: hidden; }
        .progress-bar { height: 100%; background: #10b981; border-radius: 5px; transition: width 0.5s ease; }
        .progress-bar.low { background: #ef4444; }

        .icon-btn { padding: 10px; color: #64748b; background: transparent; border-radius: 10px; transition: all 0.2s; }
        .icon-btn:hover { background: #f1f5f9; color: var(--primary); transform: scale(1.1); }
        .icon-btn.delete:hover { color: var(--error); background: #fee2e2; }

        .loading-state { padding: 100px 0; text-align: center; color: var(--text-secondary); }
        .spinner { animation: spin 1.5s linear infinite; margin-bottom: 16px; color: var(--primary); }

        .empty-state { padding: 80px 40px; text-align: center; background: #fff; border-radius: 24px; border: 2px dashed #e2e8f0; margin-top: 20px; display: flex; flex-direction: column; align-items: center; }
        .empty-icon-box { width: 80px; height: 80px; background: #f8fafc; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; color: #cbd5e1; }
        .empty-state h3 { font-size: 1.3rem; margin-bottom: 8px; color: var(--text-primary); }
        .empty-state p { margin-bottom: 24px; color: var(--text-secondary); max-width: 400px; }

        .btn-danger { background: var(--error); color: #fff; padding: 12px 24px; border-radius: 12px; font-weight: 600; }
        .btn-danger:hover { background: #dc2626; transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(239, 68, 68, 0.4); }

        .delete-modal { text-align: center; max-width: 440px !important; }
        .delete-icon-warn { width: 64px; height: 64px; background: #fff7ed; color: #f59e0b; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; border: 4px solid #fff; box-shadow: 0 0 0 4px #fffbeb; }
        .delete-modal h2 { margin-bottom: 12px; color: #1e293b; font-size: 1.3rem; }
        .delete-modal p { color: #64748b; line-height: 1.6; margin-bottom: 28px; font-size: 0.95rem; }
        .modal-footer.centered { justify-content: center; gap: 16px; }

        .modal-select { width: 100%; padding: 12px 16px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; color: var(--text-primary); font-size: 0.95rem; font-weight: 500; outline: none; transition: all 0.3s; }
        .modal-select:focus { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1); }

        .qty-input { display: flex; gap: 10px; }
        .qty-input input { flex: 1; }
        .qty-input select { width: 90px; background: #ffffff; border-radius: 12px; padding: 0 10px; border: 1px solid #e2e8f0; font-weight: 600; }

        .modal-overlay { 
          position: fixed; 
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(15, 23, 42, 0.3); 
          backdrop-filter: blur(4px); 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          z-index: 9999; 
          padding: 20px;
        }
        .modal-content { 
          width: 100%; 
          max-width: 550px; 
          padding: 32px; 
          background: #ffffff !important;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          border-radius: 20px;
          border: 1px solid #cbd5e1;
        }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .modal-header h2 { font-size: 1.4rem; font-weight: 700; color: var(--text-primary); margin: 0; }
        .close-modal { padding: 8px; color: #94a3b8; background: #f1f5f9; border-radius: 10px; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
        .close-modal:hover { background: #fee2e2; color: #ef4444; transform: rotate(90deg); }
        .modal-footer { margin-top: 32px; display: flex; justify-content: flex-end; gap: 12px; }

        .btn-secondary-outline { padding: 12px 24px; border-radius: 12px; font-weight: 600; color: #64748b; border: 1px solid #e2e8f0; background: #fff; transition: all 0.2s; }
        .btn-secondary-outline:hover { background: #f8fafc; color: var(--text-primary); border-color: #cbd5e1; }

        .input-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}} />
    </div>
  );
};

export default Inventory;
