import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import API from '../services/api';
import { 
  Building, Users, Wrench, Copy, Check, Trash2, 
  UserCheck, Shield, Database, Loader2, Sparkles, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Settings = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [company, setCompany] = useState(null);
  const [companyCode, setCompanyCode] = useState('');
  const [members, setMembers] = useState([]);
  const [loadingCompany, setLoadingCompany] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Seeding states
  const [seeding, setSeeding] = useState(false);
  const [seedStep, setSeedStep] = useState(0); // 0: idle, 1: suppliers, 2: inventory, 3: finance, 4: procurement, 5: success
  const [seedLogs, setSeedLogs] = useState([]);

  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager' || isAdmin;

  useEffect(() => {
    fetchCompanyData();
    if (isManager) {
      fetchMembers();
    }
  }, [user]);

  const fetchCompanyData = async () => {
    try {
      setLoadingCompany(true);
      const companyRes = await API.get('/user/company/me');
      setCompany(companyRes.data.company);

      if (isAdmin) {
        const codeRes = await API.get('/user/company/code');
        setCompanyCode(codeRes.data.companyCode);
      }
    } catch (err) {
      console.error('Failed to load company details', err);
      showToast('Error loading company details', 'error');
    } finally {
      setLoadingCompany(false);
    }
  };

  const fetchMembers = async () => {
    try {
      setLoadingMembers(true);
      const res = await API.get('/user/company/members');
      setMembers(res.data.members);
    } catch (err) {
      console.error('Failed to load members', err);
      showToast('Error loading team roster', 'error');
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(companyCode);
    setCopied(true);
    showToast('Company code copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await API.patch(`/user/company/members/${userId}/role`, { role: newRole });
      showToast(`User role updated to ${newRole}`, 'success');
      setMembers(members.map(m => m.userId === userId ? { ...m, role: newRole } : m));
    } catch (err) {
      console.error('Failed to update role', err);
      showToast(err.response?.data?.message || 'Failed to update member role', 'error');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this member from the company?')) return;
    try {
      await API.delete(`/user/company/members/${userId}`);
      showToast('Member removed from team', 'success');
      setMembers(members.filter(m => m.userId !== userId));
    } catch (err) {
      console.error('Failed to remove member', err);
      showToast(err.response?.data?.message || 'Failed to remove team member', 'error');
    }
  };

  // Frontend seeding engine
  const handleSeedData = async () => {
    if (seeding) return;
    setSeeding(true);
    setSeedLogs([]);
    
    const addLog = (msg) => setSeedLogs(prev => [...prev, msg]);

    try {
      // Step 1: Create Suppliers
      setSeedStep(1);
      addLog('🚀 Authenticating and initializing data channels...');
      
      const suppliersToSeed = [
        {
          name: 'Global Tech Logistics',
          contact: 'Alice Johnson',
          email: 'alice@globaltech.com',
          address: '123 Silicon Valley Road',
          category: 'Hardware'
        },
        {
          name: 'Apex Storage Solutions',
          contact: 'Bob Smith',
          email: 'bob@apexstorage.com',
          address: '456 Cloud Parkway',
          category: 'Storage'
        }
      ];

      addLog('📦 Seeding active supplier profiles...');
      const createdSuppliers = [];
      for (const s of suppliersToSeed) {
        try {
          const res = await API.post('/supplier', s);
          createdSuppliers.push(res.data.supplier);
          addLog(`✓ Created supplier: ${res.data.supplier.name}`);
        } catch (err) {
          addLog(`✕ Failed to seed supplier: ${s.name}`);
        }
      }

      const globalTech = createdSuppliers.find(s => s.name === 'Global Tech Logistics');
      const apexStorage = createdSuppliers.find(s => s.name === 'Apex Storage Solutions');

      // Step 2: Create Inventory Items
      setSeedStep(2);
      addLog('🎒 Seeding inventory stock items...');
      const itemsToSeed = [
        {
          name: 'Core Switch 24-Port',
          category: 'Hardware',
          quantity: 15,
          unitPrice: 450,
          reorderLevel: 5,
          reorderQuantity: 10,
          unit: 'pcs',
          supplierId: globalTech ? globalTech._id : null
        },
        {
          name: 'SSD 1TB NVMe',
          category: 'Storage',
          quantity: 4, // low stock
          unitPrice: 120,
          reorderLevel: 8,
          reorderQuantity: 15,
          unit: 'pcs',
          supplierId: apexStorage ? apexStorage._id : null
        },
        {
          name: 'Cat6a Cable 100m',
          category: 'Cables',
          quantity: 12,
          unitPrice: 75,
          reorderLevel: 5,
          reorderQuantity: 10,
          unit: 'boxes',
          supplierId: globalTech ? globalTech._id : null
        }
      ];

      const createdItems = [];
      for (const item of itemsToSeed) {
        try {
          const res = await API.post('/inventory', item);
          createdItems.push(res.data.item);
          addLog(`✓ Created inventory product: ${res.data.item.name} (${res.data.item.quantity} in stock)`);
        } catch (err) {
          addLog(`✕ Failed to seed product: ${item.name}`);
        }
      }

      const ssdItem = createdItems.find(i => i.name === 'SSD 1TB NVMe');

      // Step 3: Seed Transactions
      setSeedStep(3);
      addLog('💰 Injecting revenue & operational expense histories...');
      const txsToSeed = [
        {
          type: 'income',
          amount: 15000,
          category: 'SaaS Renewal',
          description: 'Q2 SaaS licensing renewals for Enterprise customers'
        },
        {
          type: 'income',
          amount: 35000,
          category: 'Consulting Service',
          description: 'Cloud migration advisory service delivery'
        },
        {
          type: 'expense',
          amount: 4200,
          category: 'Office Rent',
          description: 'Main office headquarters rental payment'
        },
        {
          type: 'expense',
          amount: 1850,
          category: 'Internet & Hosting',
          description: 'Dedicated AWS hosting and fiber bandwidth charges'
        }
      ];

      for (const tx of txsToSeed) {
        try {
          await API.post('/finance', tx);
          addLog(`✓ Recorded finance ledger: ${tx.type} - $${tx.amount} (${tx.category})`);
        } catch (err) {
          addLog(`✕ Failed to log transaction: ${tx.category}`);
        }
      }

      // Step 4: Seed Purchase Orders
      setSeedStep(4);
      addLog('🛒 Creating pending procurement workflows...');
      if (apexStorage && ssdItem) {
        const poToSeed = {
          supplierId: apexStorage._id,
          items: [
            {
              itemId: ssdItem._id,
              quantity: 15
            }
          ],
          expectedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        };

        try {
          const res = await API.post('/procurement', poToSeed);
          addLog(`✓ Created pending Purchase Order: PO-${res.data.order._id.slice(-6).toUpperCase()}`);
        } catch (err) {
          addLog('✕ Failed to create PO');
        }
      }

      setSeedStep(5);
      showToast('InsightNexus database seeded successfully!', 'success');
      addLog('🎉 System populated! Everything synced.');
    } catch (err) {
      console.error(err);
      showToast('Seeding encountered errors.', 'error');
      addLog('✕ Seeding aborted due to structural error.');
    } finally {
      setSeeding(false);
    }
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
              Control Center
            </motion.h1>
            <p>Manage company parameters, team configurations, and administrative tools.</p>
          </div>
        </header>

        {/* Tab Selection */}
        <div className="settings-tabs glass-card">
          <button 
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <Building size={18} />
            <span>Company Profile</span>
          </button>
          {isManager && (
            <button 
              className={`tab-btn ${activeTab === 'roster' ? 'active' : ''}`}
              onClick={() => setActiveTab('roster')}
            >
              <Users size={18} />
              <span>Team Roster</span>
            </button>
          )}
          {isAdmin && (
            <button 
              className={`tab-btn ${activeTab === 'tools' ? 'active' : ''}`}
              onClick={() => setActiveTab('tools')}
            >
              <Wrench size={18} />
              <span>System Tools</span>
            </button>
          )}
        </div>

        {/* Tab Content Panels */}
        <div className="settings-content-panel">
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="settings-card glass-card"
              >
                <div className="panel-title">
                  <Building className="title-icon" size={24} />
                  <h2>Company Information</h2>
                </div>

                {loadingCompany ? (
                  <div className="panel-loader">
                    <Loader2 className="spinner" size={32} />
                    <p>Loading company profile...</p>
                  </div>
                ) : (
                  <div className="profile-grid">
                    <div className="info-item">
                      <label>Company Name</label>
                      <p className="value">{company?.name || 'InsightNexus Enterprise'}</p>
                    </div>
                    <div className="info-item">
                      <label>Industry Verticals</label>
                      <p className="value">{company?.industry || 'Technology & Logistics'}</p>
                    </div>
                    <div className="info-item">
                      <label>Active Staff Account Type</label>
                      <p className="value role-badge">{user?.role}</p>
                    </div>

                    {isAdmin && (
                      <div className="info-item invite-code-container">
                        <label>Company Invite Code</label>
                        <div className="code-box">
                          <code className="code-text">{companyCode || 'NEXUS123'}</code>
                          <button className="copy-btn" onClick={handleCopyCode}>
                            {copied ? <Check className="text-success" size={18} /> : <Copy size={18} />}
                          </button>
                        </div>
                        <p className="hint">Share this code with teammates so they can join your company workspace during registration.</p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'roster' && isManager && (
              <motion.div
                key="roster"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="settings-card glass-card"
              >
                <div className="panel-title">
                  <Users className="title-icon" size={24} />
                  <h2>Team Members</h2>
                </div>

                {loadingMembers ? (
                  <div className="panel-loader">
                    <Loader2 className="spinner" size={32} />
                    <p>Syncing staff records...</p>
                  </div>
                ) : members.length === 0 ? (
                  <div className="empty-roster">
                    <AlertCircle size={40} />
                    <p>No members registered yet under this company.</p>
                  </div>
                ) : (
                  <div className="roster-table-wrapper">
                    <table className="roster-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email Address</th>
                          <th>Role Authority</th>
                          {isAdmin && <th>Actions</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {members.map((member) => {
                          const isSelf = member.userId === user?.userId;
                          return (
                            <tr key={member._id}>
                              <td className="member-name font-semibold">{member.name} {isSelf && <span className="self-label">(You)</span>}</td>
                              <td className="member-email">{member.email}</td>
                              <td>
                                {isAdmin && !isSelf ? (
                                  <select 
                                    className="role-select"
                                    value={member.role}
                                    onChange={(e) => handleUpdateRole(member.userId, e.target.value)}
                                  >
                                    <option value="user">User / Viewer</option>
                                    <option value="manager">Manager</option>
                                    <option value="admin">Administrator</option>
                                  </select>
                                ) : (
                                  <span className={`role-pill ${member.role}`}>
                                    {member.role === 'admin' ? <Shield size={12} /> : null}
                                    {member.role}
                                  </span>
                                )}
                              </td>
                              {isAdmin && (
                                <td>
                                  {!isSelf && (
                                    <button 
                                      className="btn-danger-icon"
                                      onClick={() => handleRemoveMember(member.userId)}
                                      title="Revoke member workspace privileges"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  )}
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'tools' && isAdmin && (
              <motion.div
                key="tools"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="settings-card glass-card"
              >
                <div className="panel-title">
                  <Wrench className="title-icon" size={24} />
                  <h2>System Administration Tools</h2>
                </div>

                <div className="seeding-description">
                  <div className="tool-icon-wrapper">
                    <Database size={32} />
                  </div>
                  <div className="tool-text">
                    <h3>Sample Database Seeding</h3>
                    <p>
                      If you recently created this company, it has zero data (inventory, suppliers, expenses). 
                      Click the button below to automatically seed mock products, transactions, and suppliers so you can test all system components immediately.
                    </p>
                  </div>
                </div>

                <div className="seed-trigger-row">
                  <button 
                    className="btn-primary seed-btn" 
                    onClick={handleSeedData}
                    disabled={seeding || seedStep === 5}
                  >
                    {seeding ? (
                      <>
                        <Loader2 className="spinner" size={20} />
                        Seeding Platform...
                      </>
                    ) : seedStep === 5 ? (
                      <>
                        <Sparkles size={20} />
                        Successfully Populated
                      </>
                    ) : (
                      <>
                        <Database size={20} />
                        Seed Company Sample Data
                      </>
                    )}
                  </button>
                </div>

                {seedStep > 0 && (
                  <div className="seed-progress-container glass-card">
                    <h4>Seeding Status</h4>
                    <div className="progress-bar-wrapper">
                      <div 
                        className="progress-bar-fill" 
                        style={{ width: `${(seedStep / 5) * 100}%` }}
                      ></div>
                    </div>
                    
                    <div className="logs-console">
                      {seedLogs.map((log, idx) => (
                        <div key={idx} className="log-line">{log}</div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          .settings-tabs {
            display: flex;
            gap: 12px;
            padding: 8px;
            margin-bottom: 32px;
            background: #ffffff !important;
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            max-width: 600px;
          }
          .tab-btn {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 12px;
            border-radius: 12px;
            font-weight: 600;
            color: #64748b;
            background: transparent;
            transition: all 0.25s;
          }
          .tab-btn:hover {
            background: #f8fafc;
            color: #4f46e5;
          }
          .tab-btn.active {
            background: #eef2ff;
            color: #4f46e5;
          }

          .settings-card {
            padding: 32px;
            background: #ffffff !important;
            border: 1px solid #e2e8f0;
            border-radius: 24px;
            box-shadow: 0 10px 30px -10px rgba(15, 23, 42, 0.04);
          }
          .panel-title {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 32px;
            border-bottom: 1px solid #f1f5f9;
            padding-bottom: 16px;
          }
          .title-icon {
            color: #4f46e5;
          }
          .panel-title h2 {
            font-size: 1.4rem;
            color: #0f172a;
            font-weight: 700;
            margin: 0;
          }

          .panel-loader {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 60px 0;
            color: #94a3b8;
            gap: 12px;
          }

          /* Profile styles */
          .profile-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 24px;
          }
          .info-item {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }
          .info-item label {
            font-size: 0.8rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #94a3b8;
          }
          .info-item .value {
            font-size: 1.1rem;
            font-weight: 600;
            color: #1e293b;
            margin: 0;
          }
          .role-badge {
            display: inline-block;
            align-self: flex-start;
            padding: 6px 14px;
            background: #eef2ff;
            color: #4f46e5;
            border-radius: 99px;
            font-weight: 700 !important;
            text-transform: capitalize;
            font-size: 0.9rem !important;
          }

          .invite-code-container {
            grid-column: 1 / -1;
            margin-top: 16px;
            padding-top: 24px;
            border-top: 1px solid #f1f5f9;
          }
          .code-box {
            display: flex;
            align-items: center;
            background: #f8fafc;
            border: 1px dashed #cbd5e1;
            border-radius: 12px;
            padding: 10px 16px;
            width: fit-content;
            gap: 16px;
            margin: 8px 0;
          }
          .code-text {
            font-family: monospace;
            font-size: 1.3rem;
            font-weight: 700;
            color: #4f46e5;
            letter-spacing: 0.05em;
          }
          .copy-btn {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            padding: 8px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
          }
          .copy-btn:hover {
            background: #eef2ff;
            border-color: #4f46e5;
          }
          .hint {
            font-size: 0.85rem;
            color: #64748b;
            margin: 4px 0 0;
          }

          /* Team Members Styles */
          .roster-table-wrapper {
            overflow-x: auto;
          }
          .roster-table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
          }
          .roster-table th {
            padding: 16px;
            border-bottom: 2px solid #f1f5f9;
            color: #64748b;
            font-weight: 600;
            font-size: 0.9rem;
          }
          .roster-table td {
            padding: 16px;
            border-bottom: 1px solid #f1f5f9;
            color: #334155;
            font-size: 0.95rem;
          }
          .member-name {
            font-weight: 600;
            color: #0f172a;
          }
          .self-label {
            font-size: 0.75rem;
            color: #4f46e5;
            background: #eef2ff;
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: 700;
          }
          .role-pill {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 10px;
            border-radius: 8px;
            font-size: 0.8rem;
            font-weight: 700;
            text-transform: capitalize;
          }
          .role-pill.admin { background: #fee2e2; color: #ef4444; }
          .role-pill.manager { background: #fef3c7; color: #d97706; }
          .role-pill.user { background: #eef2ff; color: #4f46e5; }

          .role-select {
            padding: 6px 12px;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            outline: none;
            font-weight: 600;
            font-size: 0.85rem;
            color: #334155;
            transition: all 0.2s;
          }
          .role-select:focus {
            border-color: #4f46e5;
          }

          .btn-danger-icon {
            background: transparent;
            color: #ef4444;
            padding: 8px;
            border-radius: 8px;
            transition: all 0.2s;
          }
          .btn-danger-icon:hover {
            background: #fef2f2;
          }

          .empty-roster {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
            padding: 40px 0;
            color: #94a3b8;
          }

          /* System tools seeding styles */
          .seeding-description {
            display: flex;
            gap: 16px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 20px;
            border-radius: 16px;
            margin-bottom: 24px;
          }
          .tool-icon-wrapper {
            background: #eef2ff;
            color: #4f46e5;
            width: 56px;
            height: 56px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          .tool-text h3 {
            font-size: 1.05rem;
            font-weight: 700;
            color: #0f172a;
            margin: 0 0 6px 0;
          }
          .tool-text p {
            font-size: 0.9rem;
            color: #64748b;
            margin: 0;
            line-height: 1.5;
          }

          .seed-trigger-row {
            margin-bottom: 24px;
          }
          .seed-btn {
            background: linear-gradient(135deg, #4f46e5, #7c3aed);
            border-radius: 12px;
            padding: 12px 24px;
            font-weight: 600;
            color: white;
            transition: all 0.3s;
          }
          .seed-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px -5px rgba(79, 70, 229, 0.4);
          }

          .seed-progress-container {
            padding: 20px;
            border: 1px solid #e2e8f0;
            background: #ffffff !important;
            border-radius: 16px;
          }
          .seed-progress-container h4 {
            margin: 0 0 12px 0;
            font-size: 0.95rem;
            color: #334155;
          }
          .progress-bar-wrapper {
            height: 6px;
            background: #f1f5f9;
            border-radius: 99px;
            overflow: hidden;
            margin-bottom: 16px;
          }
          .progress-bar-fill {
            height: 100%;
            background: linear-gradient(90deg, #4f46e5, #db2777);
            transition: width 0.4s ease-in-out;
          }

          .logs-console {
            background: #0f172a;
            border-radius: 12px;
            padding: 16px;
            font-family: monospace;
            font-size: 0.85rem;
            color: #cbd5e1;
            display: flex;
            flex-direction: column;
            gap: 6px;
            max-height: 220px;
            overflow-y: auto;
          }
          .log-line {
            line-height: 1.4;
          }
        `}} />
      </main>
    </div>
  );
};

export default Settings;
