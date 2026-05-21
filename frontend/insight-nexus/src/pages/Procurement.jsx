import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { 
  ShoppingCart, Plus, Search, Trash2, Loader2, X, 
  Package, Clock, Truck, CheckCircle2, Calendar, DollarSign,
  Briefcase, Boxes, ChevronDown, Info, AlertTriangle, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Procurement = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [formData, setFormData] = useState({ 
    supplierId: '', 
    items: [{ itemId: '', quantity: 1 }], 
    expectedDelivery: '',
    totalAmount: 0
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager' || isAdmin;

  const fetchData = async () => {
    try {
      setLoading(true);
      const [orderRes, invRes, supRes] = await Promise.all([
        API.get('/procurement'),
        API.get('/inventory'),
        API.get('/supplier')
      ]);
      setOrders(orderRes.data.orders || []);
      setInventory(invRes.data.items || []);
      setSuppliers(supRes.data.suppliers || []);
    } catch (err) {
      console.error(err);
      showToast('Failed to synchronize procurement data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

  const handleOpenModal = () => {
    setFormData({ 
      supplierId: '', 
      items: [{ itemId: '', quantity: 1 }], 
      expectedDelivery: '',
      totalAmount: 0
    });
    setShowModal(true);
  };

  const addItemRow = () => {
    setFormData({ 
      ...formData, 
      items: [...formData.items, { itemId: '', quantity: 1 }] 
    });
  };

  const removeItemRow = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    
    // Recalculate total
    let total = 0;
    newItems.forEach(item => {
      const inv = inventory.find(i => i._id === item.itemId);
      if (inv) total += (inv.unitPrice || 0) * (parseInt(item.quantity) || 0);
    });

    setFormData({ ...formData, items: newItems, totalAmount: total });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    
    let total = 0;
    newItems.forEach(item => {
      const inv = inventory.find(i => i._id === item.itemId);
      if (inv) total += (inv.unitPrice || 0) * (parseInt(item.quantity) || 0);
    });
    
    setFormData({ ...formData, items: newItems, totalAmount: total });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const filteredItems = formData.items.filter(i => i.itemId && i.quantity > 0);
      if (filteredItems.length === 0) {
        showToast('Please add at least one valid inventory item', 'warning');
        return;
      }
      
      const payload = {
        ...formData,
        items: filteredItems
      };
      
      await API.post('/procurement', payload);
      showToast('Purchase order created successfully', 'success');
      setShowModal(false);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Order placement failed', 'error');
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      const res = await API.patch(`/procurement/${orderId}/status`, { status });
      showToast(`Order status updated to ${status}`, 'success');
      
      // Update local selectedOrder if viewing details
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(res.data.order || { ...selectedOrder, status });
      }
      
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Status update failed', 'error');
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <Clock size={14} />;
      case 'ordered': return <Package size={14} />;
      case 'shipped': return <Truck size={14} />;
      case 'delivered': return <CheckCircle2 size={14} />;
      default: return null;
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const sortedOrders = [...orders].sort((a, b) => {
    if (sortConfig.key === 'createdAt') {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
    }
    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredOrders = sortedOrders.filter(o => {
    const supplier = suppliers.find(s => s._id === o.supplierId);
    const matchesSearch = o._id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (supplier && supplier.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    open: orders.filter(o => o.status !== 'delivered').length,
    pending: orders.filter(o => o.status === 'shipped').length,
    spend: orders.filter(o => o.status === 'delivered').reduce((acc, o) => acc + o.totalAmount, 0)
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
              Procurement & POs
            </motion.h1>
            <p>Manage supply orders, track deliveries, and control spending.</p>
          </div>
          <button className="btn-primary" onClick={handleOpenModal}>
            <Plus size={20} /> Create Purchase Order
          </button>
        </header>

        <section className="inventory-summary stats-grid">
          <motion.div 
            whileHover={{ y: -4 }}
            className="stat-card glass-card border-left-primary"
          >
            <div className="stat-icon primary"><ShoppingCart /></div>
            <div className="stat-info">
              <h3>Active Orders</h3>
              <p className="value">{stats.open}</p>
            </div>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -4 }}
            className="stat-card glass-card border-left-warning"
          >
            <div className="stat-icon warning"><Truck /></div>
            <div className="stat-info">
              <h3>In Transit</h3>
              <p className="value">{stats.pending}</p>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -4 }}
            className="stat-card glass-card border-left-success"
          >
            <div className="stat-icon success"><DollarSign /></div>
            <div className="stat-info">
              <h3>Total Spend</h3>
              <p className="value">${stats.spend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </motion.div>
        </section>

        <section className="inventory-section glass-card">
          <div className="table-controls">
            <div className="search-bar">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Search by PO ID or vendor..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filters">
              <span className="filter-label">Status:</span>
              <select 
                className="category-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="ordered">Ordered</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <Loader2 className="spinner" size={40} />
              <p>Retrieving purchase history...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon-box"><ShoppingCart size={48} /></div>
              <h3>No procurement records</h3>
              <p>Try searching for a different order or issue a new purchase order.</p>
              <button className="btn-secondary-outline" style={{marginTop: '24px'}} onClick={() => {setSearchTerm(''); setStatusFilter('All')}}>Clear Filters</button>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th className="text-left cursor-pointer" onClick={() => handleSort('createdAt')}>Date Order Issued</th>
                    <th className="text-left">Order ID</th>
                    <th className="text-left">Supplier Details</th>
                    <th className="text-left">Items Summary</th>
                    <th className="text-left cursor-pointer" onClick={() => handleSort('totalAmount')}>Total Cost</th>
                    <th className="text-center">Current Status</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => {
                    const supplier = suppliers.find(s => s._id === order.supplierId);
                    const orderDate = new Date(order.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric', month: 'short', day: 'numeric'
                    });
                    return (
                      <motion.tr key={order._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <td className="text-left">
                          <span className="order-date-text">{orderDate}</span>
                        </td>
                        <td className="text-left">
                          <div className="po-id-cell">
                            <span className="po-label">PO</span>
                            <span className="po-val">{order._id.slice(-6).toUpperCase()}</span>
                          </div>
                        </td>
                        <td className="text-left">
                          <div className="vendor-meta">
                            <p className="p-name"><strong>{supplier?.name || 'Unknown Vendor'}</strong></p>
                            <p className="p-desc"><Briefcase size={12} /> {supplier?.category || 'General'}</p>
                          </div>
                        </td>
                        <td className="text-left">
                          <div className="items-badge-row">
                            <span className="items-count-badge">
                              <Boxes size={12} /> {order.items?.length || 0} Products
                            </span>
                          </div>
                        </td>
                        <td className="text-left">
                          <p className="total-cost-val">${order.totalAmount?.toLocaleString()}</p>
                        </td>
                        <td className="text-center">
                          <span className={`status-pill ${order.status}`}>
                            {getStatusIcon(order.status)}
                            {order.status}
                          </span>
                        </td>
                        <td className="text-center">
                          <button className="action-btn view-btn" title="View Details" onClick={() => handleViewDetails(order)}>
                            <Info size={16} /> Details
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* CREATE PURCHASE ORDER MODAL */}
      <AnimatePresence>
        {showModal && (
          <div className="modal-overlay">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="modal-content glass-card procurement-modal"
            >
              <div className="modal-header">
                <h2>New Purchase Order</h2>
                <button className="close-modal" onClick={() => setShowModal(false)}><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="input-group">
                  <label>Select Supplier</label>
                  <select className="premium-select" value={formData.supplierId} onChange={(e) => setFormData({...formData, supplierId: e.target.value})} required>
                    <option value="">Choose a verified vendor...</option>
                    {suppliers.map(s => <option key={s._id} value={s._id}>{s.name} ({s.category})</option>)}
                  </select>
                </div>
                
                <div className="items-section">
                  <div className="section-header">
                    <label>Order Items</label>
                    <button type="button" className="add-item-btn" onClick={addItemRow}><Plus size={14} /> Add Item</button>
                  </div>
                  
                  <div className="items-list">
                    {formData.items.map((item, idx) => {
                      const selectedInventoryItem = inventory.find(i => i._id === item.itemId);
                      const unitPrice = selectedInventoryItem ? selectedInventoryItem.unitPrice : 0;
                      return (
                        <div key={idx} className="item-row">
                          <select className="premium-select flex-1" value={item.itemId} onChange={(e) => updateItem(idx, 'itemId', e.target.value)} required>
                            <option value="">Select Item</option>
                            {inventory.map(inv => <option key={inv._id} value={inv._id}>{inv.name} (${inv.unitPrice})</option>)}
                          </select>
                          <div className="qty-wrapper">
                            <input 
                              type="number" 
                              placeholder="Qty" 
                              className="qty-input-small" 
                              value={item.quantity} 
                              min="1"
                              onChange={(e) => updateItem(idx, 'quantity', e.target.value)} 
                              required 
                            />
                          </div>
                          <div className="row-price-calc">
                            <span>${(unitPrice * (item.quantity || 0)).toLocaleString()}</span>
                          </div>
                          {formData.items.length > 1 && (
                            <button type="button" className="remove-item-btn" onClick={() => removeItemRow(idx)}><Trash2 size={14} /></button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="input-row">
                  <div className="input-group">
                    <label>Expected Delivery</label>
                    <input type="date" value={formData.expectedDelivery} onChange={(e) => setFormData({...formData, expectedDelivery: e.target.value})} />
                  </div>
                  <div className="input-group">
                    <label>Calculated Total</label>
                    <div className="total-display">
                      <DollarSign size={16} /> <strong>{formData.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                    </div>
                  </div>
                </div>
                
                <div className="modal-footer">
                  <button type="button" className="btn-secondary-outline" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">Place Purchase Order</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* VIEW DETAILS MODAL */}
      <AnimatePresence>
        {showDetailsModal && selectedOrder && (
          <div className="modal-overlay">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="modal-content glass-card procurement-details-modal"
            >
              <div className="modal-header">
                <div>
                  <div className="po-details-title-row">
                    <h2>Purchase Order Details</h2>
                    <span className={`status-pill ${selectedOrder.status}`}>
                      {getStatusIcon(selectedOrder.status)}
                      {selectedOrder.status}
                    </span>
                  </div>
                  <p className="po-details-subtitle">ID: {selectedOrder._id}</p>
                </div>
                <button className="close-modal" onClick={() => setShowDetailsModal(false)}><X size={20} /></button>
              </div>

              <div className="po-details-body">
                <div className="po-grid-two-col">
                  {/* Supplier Card */}
                  <div className="details-subcard">
                    <h4 className="subcard-title"><Briefcase size={14} /> Supplier Information</h4>
                    {(() => {
                      const supplier = suppliers.find(s => s._id === selectedOrder.supplierId);
                      if (!supplier) return <p className="text-secondary text-sm">No supplier info found.</p>;
                      return (
                        <div className="supplier-details-snippet">
                          <p><strong>Name:</strong> {supplier.name}</p>
                          <p><strong>Contact:</strong> {supplier.contact}</p>
                          <p><strong>Email:</strong> {supplier.email || 'N/A'}</p>
                          <p><strong>Category:</strong> {supplier.category || 'General'}</p>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Order Meta */}
                  <div className="details-subcard">
                    <h4 className="subcard-title"><Calendar size={14} /> Date & Shipping</h4>
                    <div className="order-dates-snippet">
                      <p><strong>Issued On:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                      <p><strong>Expected On:</strong> {selectedOrder.expectedDelivery ? new Date(selectedOrder.expectedDelivery).toLocaleDateString() : 'Not Specified'}</p>
                      <p><strong>Overall Cost:</strong> ${selectedOrder.totalAmount?.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Items list */}
                <div className="details-subcard margin-top-20">
                  <h4 className="subcard-title"><Boxes size={14} /> Ordered Products</h4>
                  <div className="details-items-table-wrapper">
                    <table className="details-items-table">
                      <thead>
                        <tr>
                          <th>Product Name</th>
                          <th className="text-center">Quantity</th>
                          <th className="text-right">Unit Price</th>
                          <th className="text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.items?.map((item, index) => {
                          const product = inventory.find(p => p._id === item.itemId);
                          const unitPrice = product ? product.unitPrice : 0;
                          const totalCost = unitPrice * item.quantity;
                          return (
                            <tr key={index}>
                              <td>
                                <div>
                                  <p className="product-table-name">{product?.name || 'Deleted Product'}</p>
                                  <span className="product-table-sku">{product?.sku || 'SKU-UNKNOWN'}</span>
                                </div>
                              </td>
                              <td className="text-center font-semibold">{item.quantity}</td>
                              <td className="text-right">${unitPrice.toLocaleString()}</td>
                              <td className="text-right font-bold text-slate-800">${totalCost.toLocaleString()}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Status workflow selection for Managers */}
                {isManager && selectedOrder.status !== 'delivered' && (
                  <div className="workflow-status-card margin-top-20">
                    <div className="workflow-title-area">
                      <h4 className="subcard-title"><FileText size={14} /> Update Shipment Workflow</h4>
                      <p className="workflow-desc">Setting to 'Delivered' automatically registers item stock additions and issues a matching expense transaction in Finance.</p>
                    </div>
                    <div className="workflow-action-row">
                      <div className="status-workflow-select">
                        <select 
                          value={selectedOrder.status}
                          onChange={(e) => handleUpdateStatus(selectedOrder._id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="ordered">Ordered</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered (Verify & Sync)</option>
                        </select>
                        <ChevronDown size={14} className="select-icon" />
                      </div>
                    </div>
                  </div>
                )}

                {selectedOrder.status === 'delivered' && (
                  <div className="delivery-synced-banner margin-top-20">
                    <CheckCircle2 size={20} className="success-icon" />
                    <div>
                      <p><strong>Stock and Ledger Synchronized</strong></p>
                      <p className="banner-subtext">This order is completed. Items were added to stock and a matching expense has been posted to Finance.</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary-outline" onClick={() => setShowDetailsModal(false)}>Close Window</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .text-center { text-align: center !important; }
        .text-left { text-align: left !important; }
        .text-right { text-align: right !important; }
        .margin-top-20 { margin-top: 20px; }
        
        .border-left-primary { border-left: 5px solid var(--primary) !important; }
        .border-left-warning { border-left: 5px solid var(--warning) !important; }
        .border-left-success { border-left: 5px solid var(--success) !important; }

        .inventory-summary { margin-bottom: 32px; display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
        .stat-card { padding: 24px; display: flex; align-items: center; gap: 20px; border: 1px solid var(--surface-border); border-radius: 16px; background: #fff; }
        .stat-icon { width: 56px; height: 56px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .stat-icon.primary { background: #eef2ff; color: var(--primary); }
        .stat-icon.warning { background: #fff7ed; color: var(--warning); }
        .stat-icon.success { background: #ecfdf5; color: var(--success); }
        .stat-info h3 { font-size: 0.9rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.05em; }
        .stat-info .value { font-size: 1.6rem; font-weight: 700; color: var(--text-primary); margin: 0; }

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
        .po-id-cell { display: flex; align-items: center; gap: 8px; }
        .po-label { font-size: 0.65rem; font-weight: 800; background: #eef2ff; color: var(--primary); padding: 2px 6px; border-radius: 4px; }
        .po-val { font-family: monospace; font-weight: 700; color: #1e293b; }

        .vendor-meta .p-name { font-size: 0.95rem; color: var(--text-primary); margin: 0; }
        .vendor-meta .p-desc { font-size: 0.8rem; color: var(--text-secondary); margin: 2px 0 0 0; display: flex; align-items: center; gap: 4px; }

        .items-badge-row { display: flex; gap: 8px; }
        .items-count-badge { padding: 4px 10px; background: #f8fafc; border-radius: 20px; font-size: 0.8rem; font-weight: 600; color: #64748b; border: 1px solid #e2e8f0; display: flex; align-items: center; gap: 6px; }

        .total-cost-val { font-weight: 800; color: #1e293b; font-size: 0.95rem; margin: 0; }

        .status-pill { padding: 6px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; display: inline-flex; align-items: center; gap: 6px; }
        .status-pill.pending { background: #fff7ed; color: var(--warning); }
        .status-pill.ordered { background: #eef2ff; color: var(--primary); }
        .status-pill.shipped { background: #eff6ff; color: #3b82f6; }
        .status-pill.delivered { background: #ecfdf5; color: var(--success); }

        .action-btn { font-size: 0.85rem; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 8px; border: 1px solid transparent; }
        .view-btn { background: #f8fafc; border-color: #e2e8f0; color: var(--text-secondary); }
        .view-btn:hover { background: #eef2ff; border-color: rgba(99, 102, 241, 0.2); color: var(--primary); }

        .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.3); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 20px; }
        .modal-content { width: 100%; max-width: 650px; padding: 32px; background: #fff !important; border-radius: 20px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.04); border: 1px solid var(--surface-border); }
        
        .procurement-details-modal { max-width: 720px; }
        
        .modal-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
        .modal-header h2 { font-size: 1.4rem; font-weight: 700; color: var(--text-primary); margin: 0; }
        .close-modal { padding: 8px; color: #94a3b8; background: #f1f5f9; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
        .close-modal:hover { background: #fee2e2; color: #ef4444; }

        .premium-select { width: 100%; padding: 12px 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 0.95rem; font-weight: 600; color: var(--text-primary); appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 16px center; transition: all 0.3s; }
        .premium-select:focus { background: #fff; border-color: var(--primary); box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1); outline: none; }

        .items-section { margin-top: 20px; margin-bottom: 20px; }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .add-item-btn { font-size: 0.8rem; font-weight: 700; color: var(--primary); background: #eef2ff; padding: 6px 12px; border-radius: 8px; display: flex; align-items: center; gap: 4px; }
        
        .items-list { display: flex; flex-direction: column; gap: 12px; max-height: 220px; overflow-y: auto; padding-right: 6px; border: 1px dashed #e2e8f0; padding: 12px; border-radius: 12px; background: #fafafa; }
        .item-row { display: flex; gap: 12px; align-items: center; }
        .qty-wrapper { width: 75px; }
        .qty-input-small { width: 100%; padding: 12px 8px; background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; font-weight: 600; text-align: center; font-size: 0.95rem; }
        .qty-input-small:focus { border-color: var(--primary); outline: none; }
        .row-price-calc { width: 80px; text-align: right; font-weight: 700; color: var(--text-secondary); font-size: 0.9rem; }
        
        .remove-item-btn { padding: 10px; color: #ef4444; background: #fef2f2; border-radius: 8px; display: flex; align-items: center; justify-content: center; border: 1px solid transparent; }
        .remove-item-btn:hover { background: #ef4444; color: #fff; }

        .input-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 20px; }
        .total-display { display: flex; align-items: center; gap: 8px; font-size: 1.3rem; color: var(--success); background: #ecfdf5; padding: 10px 16px; border-radius: 10px; border: 1px solid #a7f3d0; width: fit-content; }
        .modal-footer { margin-top: 30px; display: flex; justify-content: flex-end; gap: 16px; }
        .btn-secondary-outline { background: #fff; border: 1px solid #e2e8f0; padding: 12px 24px; border-radius: 10px; font-weight: 600; color: var(--text-secondary); }
        .btn-secondary-outline:hover { background: #f8fafc; border-color: #cbd5e1; color: var(--text-primary); }

        .po-details-title-row { display: flex; align-items: center; gap: 12px; }
        .po-details-subtitle { margin-top: 4px; font-size: 0.8rem; font-family: monospace; color: var(--text-secondary); }
        .po-details-body { display: flex; flex-direction: column; gap: 16px; }
        
        .po-grid-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .details-subcard { background: #f8fafc; border: 1px solid var(--surface-border); border-radius: 12px; padding: 16px; }
        .subcard-title { font-size: 0.85rem; font-weight: 700; color: var(--text-primary); text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 6px; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #e2e8f0; }
        
        .supplier-details-snippet p, .order-dates-snippet p { font-size: 0.9rem; margin-bottom: 6px; color: var(--text-primary); }
        .supplier-details-snippet p:last-child, .order-dates-snippet p:last-child { margin-bottom: 0; }
        .supplier-details-snippet strong, .order-dates-snippet strong { color: var(--text-secondary); font-weight: 500; }
        
        .details-items-table-wrapper { border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; background: #fff; }
        .details-items-table { width: 100%; border-collapse: collapse; }
        .details-items-table th { background: #f1f5f9; padding: 10px 14px; font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: var(--text-secondary); }
        .details-items-table td { padding: 12px 14px; border-bottom: 1px solid #f1f5f9; font-size: 0.85rem; }
        .details-items-table tr:last-child td { border-bottom: none; }
        .product-table-name { font-weight: 600; color: var(--text-primary); margin: 0; }
        .product-table-sku { font-size: 0.75rem; font-family: monospace; color: var(--text-secondary); }

        .workflow-status-card { background: #fef8f2; border: 1px solid #ffedd5; border-radius: 12px; padding: 16px; display: flex; justify-content: space-between; align-items: center; gap: 16px; }
        .workflow-title-area { flex: 1; }
        .workflow-title-area .subcard-title { border-bottom: none; margin-bottom: 4px; padding-bottom: 0; color: #c2410c; }
        .workflow-desc { font-size: 0.75rem; color: #9a3412; margin: 0; line-height: 1.4; }
        .workflow-action-row { display: flex; align-items: center; }

        .delivery-synced-banner { display: flex; align-items: flex-start; gap: 12px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 16px; color: #065f46; }
        .delivery-synced-banner .success-icon { color: var(--success); flex-shrink: 0; }
        .delivery-synced-banner p { margin: 0; font-size: 0.9rem; line-height: 1.4; }
        .banner-subtext { font-size: 0.75rem !important; color: #047857; margin-top: 4px !important; }

        .empty-state { padding: 60px 40px; text-align: center; border: 2px dashed #e2e8f0; border-radius: 16px; margin: 40px auto; background: #fff; width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .empty-icon-box { width: 80px; height: 80px; background: #f8fafc; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; color: #cbd5e1; border: 1px solid #f1f5f9; }
        .empty-state h3 { font-size: 1.3rem; color: #1e293b; margin-bottom: 8px; font-weight: 700; }
        .empty-state p { color: #64748b; font-size: 0.95rem; margin-bottom: 0; max-width: 320px; line-height: 1.5; }

        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spinner { animation: spin 1.5s linear infinite; }
      `}} />
    </div>
  );
};

export default Procurement;
