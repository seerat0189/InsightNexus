import { Link } from 'react-router-dom';
import { 
  ArrowRight, BarChart3, ShieldCheck, Zap, ShoppingCart, Package, 
  Users, Cpu, CheckCircle2, ChevronRight, ExternalLink, Play, 
  Sparkles, Globe, Mail, MessageSquare, Plus, DollarSign, Activity
} from 'lucide-react';
import { motion } from 'framer-motion';

const Landing = () => {
  const features = [
    { 
      title: 'Inventory Precision', 
      icon: Package, 
      color: '#4f46e5', 
      desc: 'Real-time stock tracking with color-coded alerts and automated vendor reorder quantity intelligence.' 
    },
    { 
      title: 'Financial Velocity', 
      icon: BarChart3, 
      color: '#10b981', 
      desc: 'Comprehensive cash ledger management with a live Runway and Burn Rate calculator simulator.' 
    },
    { 
      title: 'Fulfillment Flow', 
      icon: ShoppingCart, 
      color: '#f59e0b', 
      desc: 'Multi-item purchase order workflows that synchronize inventory stock and ledger expenses on delivery.' 
    },
    { 
      title: 'Supplier Networks', 
      icon: Users, 
      color: '#db2777', 
      desc: 'Performance-driven supplier metrics tracking delivery speed and defect rates with active analytics.' 
    },
  ];

  return (
    <div className="landing-page">
      {/* Floating Decorative Orbs */}
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>

      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-container">
          <div className="logo-area">
            <div className="logo-orb"><Sparkles size={16} className="text-white" /></div>
            <span className="logo-text">Insight<span className="text-indigo">Nexus</span></span>
          </div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#ecosystem">Ecosystem</a>
            <a href="#how-it-works">Process</a>
            <Link to="/login" className="login-link">Login</Link>
            <Link to="/register" className="btn-primary-mini">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-container">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="hero-content"
          >
            <div className="pill-badge">
              <Sparkles size={12} className="text-indigo animate-pulse" />
              <span>Version 2.0 Operations Hub Live</span>
            </div>
            <h1>The Operating System for <span className="text-gradient">Modern Commerce</span></h1>
            <p>
              InsightNexus unifies inventory, finance, and procurement into a single, 
              high-performance operational intelligence layer. Designed for teams that demand precision.
            </p>
            <div className="hero-btns">
              <Link to="/register" className="btn-primary-lg">
                Create Free Workspace <ArrowRight size={18} />
              </Link>
              <a href="#how-it-works" className="btn-secondary-lg">
                <Play size={16} fill="currentColor" /> See How it Works
              </a>
            </div>
            
            <div className="social-proof">
              <div className="avatars">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80" alt="team" />
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80" alt="team" />
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80" alt="team" />
              </div>
              <p>Trusted by 500+ hyper-growth commercial enterprises</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hero-visual"
          >
            <div className="dashboard-mockup glass-card">
              <div className="mockup-header">
                <div className="window-dots"><span></span><span></span><span></span></div>
                <div className="mock-search-bar"></div>
              </div>
              
              <div className="mockup-body">
                <div className="mock-sidebar">
                  <div className="sidebar-dot active"></div>
                  <div className="sidebar-dot"></div>
                  <div className="sidebar-dot"></div>
                  <div className="sidebar-dot"></div>
                </div>
                
                <div className="mock-main">
                  <div className="mock-stats-row">
                    <div className="mock-stat-card border-indigo">
                      <div className="m-stat-title">Operating Margin</div>
                      <div className="m-stat-val">24.5%</div>
                    </div>
                    <div className="mock-stat-card border-warning">
                      <div className="m-stat-title">Stock Alerts</div>
                      <div className="m-stat-val">3 Items</div>
                    </div>
                    <div className="mock-stat-card border-success">
                      <div className="m-stat-title">Open POs</div>
                      <div className="m-stat-val">12 Active</div>
                    </div>
                  </div>
                  
                  <div className="mock-chart-container">
                    <div className="mock-chart-header">
                      <span>Live Cash Ledger</span>
                      <div className="mock-legend"><span className="l-dot green"></span><span className="l-dot red"></span></div>
                    </div>
                    <div className="mock-svg-line-chart">
                      <svg viewBox="0 0 400 90" className="w-full h-full">
                        <path d="M10,80 Q90,20 180,60 T350,15" fill="none" stroke="#10b981" strokeWidth="3" />
                        <path d="M10,80 Q90,65 180,75 T350,55" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="3 3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Cards */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="floating-mock-badge b1"
              >
                <div className="badge-icon-box bg-success"><CheckCircle2 size={14} className="text-success" /></div>
                <div>
                  <p className="b-title">Delivery Verified</p>
                  <p className="b-sub">Stock +500 items</p>
                </div>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="floating-mock-badge b2"
              >
                <div className="badge-icon-box bg-warning"><Zap size={14} className="text-warning" /></div>
                <div>
                  <p className="b-title">Runway Alert</p>
                  <p className="b-sub">Simulator updated</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Metrics Strip */}
      <section className="metrics-strip">
        <div className="metrics-container">
          <div className="metric-item">
            <h3>99.99%</h3>
            <p>Platform Uptime</p>
          </div>
          <div className="metric-item">
            <h3>&lt; 150ms</h3>
            <p>API Sync Latency</p>
          </div>
          <div className="metric-item">
            <h3>$12.5M+</h3>
            <p>Managed Cashflow</p>
          </div>
          <div className="metric-item">
            <h3>24 / 7</h3>
            <p>Enterprise Support</p>
          </div>
        </div>
      </section>

      {/* Modular Features Grid */}
      <section id="features" className="features-section">
        <div className="section-header">
          <span className="section-lbl">Modular Architecture</span>
          <h2>Everything needed to <span className="text-indigo">scale operations</span></h2>
          <p>InsightNexus unifies separated services into a high-performance workspace framework.</p>
        </div>

        <div className="features-grid">
          {features.map((f, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -8 }}
              className="feature-card glass-card"
            >
              <div className="feat-icon-box" style={{ background: `${f.color}15`, color: f.color }}>
                <f.icon size={24} />
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
              <Link to="/register" className="explore-module-link">
                <span>Explore Module</span>
                <ChevronRight size={14} />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Core Ecosystem Integration details */}
      <section id="ecosystem" className="intel-showcase-section">
        <div className="intel-container">
          <div className="intel-visual-panel">
            <div className="central-hub-visual">
              <div className="hub-pulse"></div>
              <div className="hub-core"><Cpu size={32} className="text-white" /></div>
              <div className="hub-orbit o1"><div className="orbit-dot d1"></div></div>
              <div className="hub-orbit o2"><div className="orbit-dot d2"></div></div>
            </div>
          </div>
          <div className="intel-info-panel">
            <span className="section-lbl">Integrated Intelligence</span>
            <h2>Connected data drives <span className="text-indigo">smarter decisions</span></h2>
            <p>InsightNexus synchronizes operations in real-time. When a procurement order is received, inventory levels are restocked, ledger files update, and runway calculations regenerate instantly.</p>
            
            <div className="intel-checklist">
              <div className="check-row">
                <CheckCircle2 size={16} className="text-success" />
                <span>Automated ledger cost and stock reconciliation</span>
              </div>
              <div className="check-row">
                <CheckCircle2 size={16} className="text-success" />
                <span>Supplier defect & delay tracking scorecards</span>
              </div>
              <div className="check-row">
                <CheckCircle2 size={16} className="text-success" />
                <span>Real-time slack and notification alerts</span>
              </div>
            </div>

            <Link to="/register" className="btn-primary-lg">
              Start Building Workspace <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Deployment Flow */}
      <section id="how-it-works" className="process-section">
        <div className="section-header">
          <span className="section-lbl">Deployment Process</span>
          <h2>Zero to operational hub in <span className="text-indigo">three steps</span></h2>
        </div>

        <div className="process-steps-grid">
          <div className="step-card">
            <div className="step-count">01</div>
            <h3>Create a Company Account</h3>
            <p>Establish a secured enterprise profile or join an existing company using a shareable invite code.</p>
          </div>
          <div className="step-card">
            <div className="step-count">02</div>
            <h3>Sync Data & Seed Workspace</h3>
            <p>Onboard suppliers and items instantly, or use the Settings panel to seed mock catalogs with one click.</p>
          </div>
          <div className="step-card">
            <div className="step-count">03</div>
            <h3>Run Operations Seamlessly</h3>
            <p>Issue purchase orders, track incoming shipments, simulate runways, and scale margins efficiently.</p>
          </div>
        </div>
      </section>

      {/* Call to Action banner */}
      <section className="cta-banner-section">
        <div className="cta-banner-card glass-card">
          <h2>Construct the future of <span className="text-gradient">your enterprise</span></h2>
          <p>Establish your InsightNexus workspace today. Setup takes under five minutes.</p>
          <div className="cta-btn-group">
            <Link to="/register" className="btn-primary-lg">Get Started Free</Link>
            <Link to="/login" className="btn-secondary-outline-lg">Log in to Hub</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-top-row">
            <div className="footer-brand-side">
              <div className="logo-area">
                <div className="logo-orb"><Sparkles size={14} className="text-white" /></div>
                <span className="logo-text text-sm">Insight<span className="text-indigo">Nexus</span></span>
              </div>
              <p className="brand-description-text">
                Next-generation operational intelligence systems integrating logistics, finance, and supply.
              </p>
              <div className="footer-social-links">
                <a href="#"><Globe size={18} /></a>
                <a href="#"><Mail size={18} /></a>
                <a href="#"><MessageSquare size={18} /></a>
              </div>
            </div>

            <div className="footer-links-side">
              <div className="link-column">
                <h4>System</h4>
                <a href="#features">Features</a>
                <a href="#ecosystem">Ecosystem</a>
                <a href="#how-it-works">Process</a>
              </div>
              <div className="link-column">
                <h4>Workspace</h4>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
                <Link to="/settings">Settings</Link>
              </div>
              <div className="link-column">
                <h4>Company</h4>
                <a href="#">Security</a>
                <a href="#">API Docs</a>
                <a href="#">Privacy policy</a>
              </div>
            </div>
          </div>

          <div className="footer-bottom-row">
            <p>&copy; 2026 InsightNexus Corp. All rights reserved.</p>
            <div className="status-indicator">
              <span className="ping-dot"></span>
              <span>All Systems Operational</span>
            </div>
          </div>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .landing-page {
          background: #f8fafc;
          color: #0f172a;
          min-height: 100vh;
          font-family: 'Outfit', sans-serif;
          position: relative;
          overflow-x: hidden;
        }

        .text-indigo { color: var(--primary) !important; }
        .text-white { color: #fff !important; }
        .text-success { color: var(--success) !important; }
        .text-warning { color: var(--warning) !important; }
        
        .text-gradient {
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* Decorative Glowing Orbs */
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(140px);
          opacity: 0.35;
          z-index: 0;
          pointer-events: none;
        }
        .orb-1 { width: 500px; height: 500px; background: rgba(99, 102, 241, 0.25); top: -100px; right: -50px; }
        .orb-2 { width: 400px; height: 400px; background: rgba(219, 39, 119, 0.2); bottom: 100px; left: -100px; }
        .orb-3 { width: 350px; height: 350px; background: rgba(16, 185, 129, 0.15); top: 50%; right: 15%; }

        /* Navigation */
        .landing-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 999;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--surface-border);
          padding: 16px 0;
        }
        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .logo-area {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .logo-orb {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: linear-gradient(135deg, var(--primary), var(--accent));
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(99, 102, 241, 0.2);
        }
        .logo-text {
          font-weight: 800;
          font-size: 1.25rem;
          letter-spacing: -0.03em;
        }
        .logo-text.text-sm {
          font-size: 1.1rem;
        }
        .nav-links {
          display: flex;
          align-items: center;
          gap: 32px;
        }
        .nav-links a, .login-link {
          font-weight: 600;
          font-size: 0.95rem;
          color: var(--text-secondary);
          text-decoration: none;
        }
        .nav-links a:hover, .login-link:hover {
          color: var(--primary);
        }
        .btn-primary-mini {
          background: linear-gradient(135deg, var(--primary), var(--accent));
          color: #fff !important;
          font-weight: 700;
          padding: 10px 18px;
          border-radius: 10px;
          font-size: 0.9rem;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
        }
        .btn-primary-mini:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(99, 102, 241, 0.3);
        }

        /* Hero */
        .hero-section {
          position: relative;
          z-index: 1;
          padding: 160px 0 100px 0;
        }
        .hero-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: center;
        }
        .pill-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #eef2ff;
          color: var(--primary);
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 700;
          border: 1px solid #e0e7ff;
          margin-bottom: 24px;
        }
        .hero-content h1 {
          font-size: 3.6rem;
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.04em;
          margin-bottom: 20px;
        }
        .hero-content p {
          font-size: 1.15rem;
          line-height: 1.6;
          color: var(--text-secondary);
          margin-bottom: 36px;
        }
        .hero-btns {
          display: flex;
          gap: 16px;
          margin-bottom: 40px;
        }
        
        .btn-primary-lg {
          background: linear-gradient(135deg, var(--primary), var(--accent));
          color: #fff;
          padding: 14px 28px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1rem;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 8px 20px rgba(99, 102, 241, 0.25);
          text-decoration: none;
        }
        .btn-primary-lg:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(99, 102, 241, 0.35);
        }

        .btn-secondary-lg {
          background: #fff;
          border: 1px solid #e2e8f0;
          color: var(--text-secondary);
          padding: 14px 28px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1rem;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.02);
          text-decoration: none;
          cursor: pointer;
        }
        .btn-secondary-lg:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          color: var(--text-primary);
        }

        .social-proof {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .avatars {
          display: flex;
        }
        .avatars img {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 2px solid #fff;
          margin-right: -10px;
          object-fit: cover;
        }
        .social-proof p {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin: 0;
          font-weight: 600;
        }

        /* Mockup */
        .hero-visual {
          display: flex;
          justify-content: center;
          position: relative;
        }
        .dashboard-mockup {
          width: 100%;
          max-width: 580px;
          height: 400px;
          background: #ffffff;
          border-radius: 20px;
          border: 1px solid var(--surface-border);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          z-index: 1;
        }
        .mockup-header {
          height: 48px;
          background: #f8fafc;
          border-bottom: 1px solid var(--surface-border);
          display: flex;
          align-items: center;
          padding: 0 16px;
          gap: 20px;
        }
        .window-dots {
          display: flex;
          gap: 6px;
        }
        .window-dots span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #cbd5e1;
        }
        .mock-search-bar {
          width: 160px;
          height: 22px;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
        }
        
        .mockup-body {
          display: grid;
          grid-template-columns: 60px 1fr;
          height: calc(100% - 48px);
        }
        .mock-sidebar {
          background: #f8fafc;
          border-right: 1px solid var(--surface-border);
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          align-items: center;
        }
        .sidebar-dot {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #cbd5e1;
          opacity: 0.6;
        }
        .sidebar-dot.active {
          background: var(--primary);
          opacity: 1;
        }
        .mock-main {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .mock-stats-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .mock-stat-card {
          background: #f8fafc;
          border-radius: 12px;
          padding: 12px;
          border-left: 3px solid #cbd5e1;
        }
        .mock-stat-card.border-indigo { border-left-color: var(--primary); }
        .mock-stat-card.border-warning { border-left-color: var(--warning); }
        .mock-stat-card.border-success { border-left-color: var(--success); }
        .m-stat-title { font-size: 0.7rem; font-weight: 600; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 4px; }
        .m-stat-val { font-size: 1.15rem; font-weight: 700; color: var(--text-primary); }
        
        .mock-chart-container {
          background: #fafafa;
          border: 1px dashed #cbd5e1;
          border-radius: 14px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          height: 160px;
        }
        .mock-chart-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-secondary);
        }
        .mock-legend {
          display: flex;
          gap: 8px;
        }
        .l-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }
        .l-dot.green { background: #10b981; }
        .l-dot.red { background: #ef4444; }
        .mock-svg-line-chart {
          flex: 1;
          width: 100%;
        }

        .floating-mock-badge {
          position: absolute;
          background: #ffffff;
          border: 1px solid var(--surface-border);
          border-radius: 16px;
          padding: 12px 16px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
          display: flex;
          align-items: center;
          gap: 12px;
          z-index: 10;
        }
        .floating-mock-badge.b1 { top: 40px; right: -40px; }
        .floating-mock-badge.b2 { bottom: 50px; left: -40px; }
        .badge-icon-box {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .badge-icon-box.bg-success { background: #ecfdf5; }
        .badge-icon-box.bg-warning { background: #fff7ed; }
        .b-title { font-size: 0.85rem; font-weight: 700; margin: 0; }
        .b-sub { font-size: 0.75rem; color: var(--text-secondary); margin: 0; font-weight: 500; }

        /* Metrics Strip */
        .metrics-strip {
          background: #fff;
          border-top: 1px solid var(--surface-border);
          border-bottom: 1px solid var(--surface-border);
          padding: 40px 0;
          margin-top: 40px;
        }
        .metrics-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          text-align: center;
          gap: 20px;
        }
        .metric-item h3 {
          font-size: 2.2rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 4px;
          letter-spacing: -0.02em;
        }
        .metric-item p {
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-secondary);
          letter-spacing: 0.05em;
          margin: 0;
        }

        /* Features Section */
        .features-section {
          max-width: 1200px;
          margin: 0 auto;
          padding: 100px 24px;
        }
        .section-header {
          text-align: center;
          margin-bottom: 60px;
        }
        .section-lbl {
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--primary);
          display: block;
          margin-bottom: 12px;
        }
        .section-header h2 {
          font-size: 2.8rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          margin-bottom: 16px;
        }
        .section-header p {
          font-size: 1.1rem;
          color: var(--text-secondary);
          max-width: 580px;
          margin: 0 auto;
          line-height: 1.5;
        }
        
        .features-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        .feature-card {
          padding: 40px;
          background: #ffffff;
          border: 1px solid var(--surface-border);
          border-radius: 20px;
          transition: all 0.3s;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        .feature-card:hover {
          border-color: rgba(99, 102, 241, 0.2);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.02), 0 10px 10px -5px rgba(0, 0, 0, 0.02);
        }
        .feat-icon-box {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
        }
        .feature-card h3 {
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 12px;
        }
        .feature-card p {
          font-size: 0.95rem;
          line-height: 1.5;
          color: var(--text-secondary);
          margin-bottom: 24px;
          flex: 1;
        }
        .explore-module-link {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--primary);
          display: flex;
          align-items: center;
          gap: 4px;
          text-decoration: none;
        }
        .explore-module-link:hover {
          color: var(--primary-hover);
        }

        /* Intelligence Showcase Section */
        .intel-showcase-section {
          background: #f1f5f9;
          border-radius: 32px;
          padding: 80px 48px;
          max-width: 1152px;
          margin: 40px auto;
        }
        .intel-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          align-items: center;
        }
        .intel-visual-panel {
          display: flex;
          justify-content: center;
        }
        .central-hub-visual {
          position: relative;
          width: 280px;
          height: 280px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .hub-core {
          width: 80px;
          height: 80px;
          border-radius: 20px;
          background: linear-gradient(135deg, var(--primary), var(--accent));
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
          box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3);
        }
        .hub-pulse {
          position: absolute;
          width: 80px;
          height: 80px;
          border-radius: 20px;
          background: var(--primary);
          opacity: 0.4;
          z-index: 1;
          animation: pulse-ping 2s infinite;
        }
        .hub-orbit {
          position: absolute;
          border: 1px dashed #cbd5e1;
          border-radius: 50%;
        }
        .hub-orbit.o1 { width: 180px; height: 180px; animation: spin 20s linear infinite; }
        .hub-orbit.o2 { width: 280px; height: 280px; animation: spin 30s linear infinite reverse; }
        
        .orbit-dot {
          position: absolute;
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        .orbit-dot.d1 { background: var(--secondary); top: 0; left: 50%; transform: translateX(-50%); }
        .orbit-dot.d2 { background: var(--success); bottom: 0; right: 20%; }

        .intel-info-panel h2 {
          font-size: 2.4rem;
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 16px;
        }
        .intel-info-panel p {
          font-size: 1rem;
          line-height: 1.6;
          color: var(--text-secondary);
          margin-bottom: 24px;
        }
        .intel-checklist {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 32px;
        }
        .check-row {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
          font-size: 0.95rem;
          color: var(--text-primary);
        }
        
        /* Process Section */
        .process-section {
          max-width: 1200px;
          margin: 0 auto;
          padding: 80px 24px;
        }
        .process-steps-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
          margin-top: 40px;
        }
        .step-card {
          background: #ffffff;
          border: 1px solid var(--surface-border);
          border-radius: 16px;
          padding: 32px;
        }
        .step-count {
          font-size: 3rem;
          font-weight: 800;
          color: transparent;
          -webkit-text-stroke: 1.5px #e2e8f0;
          line-height: 1;
          margin-bottom: 16px;
        }
        .step-card h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 12px;
        }
        .step-card p {
          font-size: 0.95rem;
          line-height: 1.5;
          color: var(--text-secondary);
          margin: 0;
        }

        /* Call To Action Banner */
        .cta-banner-section {
          max-width: 1200px;
          margin: 40px auto 80px auto;
          padding: 0 24px;
        }
        .cta-banner-card {
          background: linear-gradient(135deg, var(--primary), var(--accent)) !important;
          color: #ffffff !important;
          border: none !important;
          border-radius: 24px;
          padding: 64px 32px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .cta-banner-card h2 {
          font-size: 2.6rem;
          font-weight: 800;
          margin-bottom: 16px;
          color: #fff;
          letter-spacing: -0.02em;
        }
        .cta-banner-card p {
          font-size: 1.1rem;
          opacity: 0.9;
          margin-bottom: 32px;
          max-width: 480px;
        }
        .cta-btn-group {
          display: flex;
          gap: 16px;
        }
        
        .btn-secondary-outline-lg {
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: #ffffff;
          padding: 14px 28px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1rem;
          text-decoration: none;
        }
        .btn-secondary-outline-lg:hover {
          background: rgba(255, 255, 255, 0.25);
        }

        /* Footer */
        .landing-footer {
          background: #ffffff;
          border-top: 1px solid var(--surface-border);
          padding: 64px 24px 40px 24px;
        }
        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
        }
        .footer-top-row {
          display: flex;
          justify-content: space-between;
          gap: 64px;
          margin-bottom: 48px;
        }
        .footer-brand-side {
          max-width: 320px;
        }
        .brand-description-text {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-top: 16px;
          margin-bottom: 24px;
          line-height: 1.5;
        }
        .footer-social-links {
          display: flex;
          gap: 16px;
        }
        .footer-social-links a {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          transition: all 0.2s;
        }
        .footer-social-links a:hover {
          border-color: var(--primary);
          color: var(--primary);
          transform: translateY(-1px);
        }

        .footer-links-side {
          display: flex;
          gap: 64px;
        }
        .link-column h4 {
          font-size: 0.9rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-primary);
          margin-bottom: 20px;
          letter-spacing: 0.05em;
        }
        .link-column a {
          display: block;
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin-bottom: 12px;
          text-decoration: none;
          font-weight: 500;
        }
        .link-column a:hover {
          color: var(--primary);
        }

        .footer-bottom-row {
          border-top: 1px solid #f1f5f9;
          padding-top: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.85rem;
          color: var(--text-secondary);
          font-weight: 600;
        }
        .status-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #ecfdf5;
          color: var(--success);
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.75rem;
        }
        .ping-dot {
          width: 6px;
          height: 6px;
          background: var(--success);
          border-radius: 50%;
          display: inline-block;
          animation: pulse-ping 2s infinite;
        }

        @keyframes pulse-ping { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.6); opacity: 0.4; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        @media (max-width: 1024px) {
          .hero-container { grid-template-columns: 1fr; text-align: center; }
          .hero-btns { justify-content: center; }
          .social-proof { justify-content: center; }
          .floating-mock-badge { display: none; }
          
          .intel-container { grid-template-columns: 1fr; }
          .intel-visual-panel { order: -1; }
          
          .footer-top-row { flex-direction: column; gap: 40px; }
          .footer-links-side { gap: 40px; }
        }
        
        @media (max-width: 768px) {
          .nav-links { display: none; }
          .metrics-container { grid-template-columns: 1fr 1fr; gap: 32px; }
          .features-grid { grid-template-columns: 1fr; }
          .process-steps-grid { grid-template-columns: 1fr; }
          .cta-btn-group { flex-direction: column; width: 100%; max-width: 240px; }
          .hero-btns { flex-direction: column; width: 100%; max-width: 280px; margin-left: auto; margin-right: auto; }
          .hero-content h1 { font-size: 2.6rem; }
        }
      `}} />
    </div>
  );
};

export default Landing;
