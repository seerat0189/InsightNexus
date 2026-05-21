import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  TrendingUp, 
  FileText, 
  Bell, 
  ShoppingCart, 
  LogOut,
  ChevronRight,
  Settings
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Inventory', path: '/inventory', icon: Package },
    { name: 'Finance', path: '/finance', icon: TrendingUp },
    { name: 'Suppliers', path: '/suppliers', icon: Users },
    { name: 'Procurement', path: '/procurement', icon: ShoppingCart },
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'Settings & Team', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="sidebar glass-card">
      <div className="sidebar-header">
        <div className="logo">Insight<span>Nexus</span></div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link 
            key={item.path} 
            to={item.path} 
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <item.icon size={20} />
            <span>{item.name}</span>
            {location.pathname === item.path && <ChevronRight size={16} className="active-indicator" />}
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="avatar">{user?.name?.charAt(0)}</div>
          <div className="details">
            <p className="name">{user?.name}</p>
            <p className="role">{user?.role}</p>
          </div>
        </div>
        <button onClick={logout} className="logout-btn">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .sidebar {
          width: 280px;
          height: calc(100vh - 48px);
          position: fixed;
          left: 24px;
          top: 24px;
          display: flex;
          flex-direction: column;
          padding: 32px 16px;
          z-index: 100;
          background: #ffffff !important;
          border-color: #e2e8f0;
        }
        .sidebar-header {
          padding: 0 16px 40px;
        }
        .sidebar-nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 12px;
          color: #64748b;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        .nav-item:hover {
          background: #f1f5f9;
          color: #0f172a;
        }
        .nav-item.active {
          background: #eef2ff;
          color: #4f46e5;
        }
        .active-indicator {
          margin-left: auto;
        }

        .sidebar-footer {
          margin-top: auto;
          padding-top: 24px;
          border-top: 1px solid var(--surface-border);
        }
        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          padding: 0 12px;
        }
        .avatar {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: white;
        }
        .user-info .name {
          font-weight: 600;
          font-size: 0.95rem;
        }
        .user-info .role {
          font-size: 0.8rem;
          color: var(--text-secondary);
          text-transform: capitalize;
        }
        .logout-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: transparent;
          color: var(--error);
          font-weight: 600;
          border-radius: 12px;
        }
        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.1);
        }

        @media (max-width: 1024px) {
          .sidebar { width: 80px; padding: 32px 12px; }
          .sidebar span, .sidebar .details, .sidebar-header .logo { display: none; }
          .nav-item { justify-content: center; padding: 16px; }
          .logout-btn { justify-content: center; }
          .active-indicator { display: none; }
        }
      `}} />
    </aside>
  );
};

export default Sidebar;
