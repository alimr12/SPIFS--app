import React, { useEffect, useState } from 'react';

// The Dashboard component accepts onLoginClick as a prop
const Dashboard = ({ onLoginClick }) => {
  const [navbarBg, setNavbarBg] = useState('rgba(15, 23, 42, 0.95)');
  const [isMobile, setIsMobile] = useState(false);

  // --- Data Definitions ---
  const featuresData = [
    { key: 'prediction', icon: "🎯", title: "AI Price Prediction", desc: "Advanced machine learning algorithms predict future property prices with high accuracy.", status: 'Active', details: "Our AI analyzes location, size, past prices, and market trends to predict future property values with 95% accuracy." },
    { key: 'roi', icon: "💰", title: "ROI Calculator", desc: "Calculate potential profit/loss and return on investment for any property with detailed financial projections.", status: 'Active', details: "Input your investment amount and get detailed ROI calculations including profit/loss projections and break-even analysis." },
    { key: 'trends', icon: "📈", title: "Price Trend Analysis", desc: "Interactive charts showing historical price trends and future forecasts for informed decision making.", status: 'Active', details: "View interactive charts showing 5-year price history and 2-year forecasts for any property or area." },
    { key: 'legality', icon: "✅", title: "Society Legality Checker", desc: "Verify NOC status and legal compliance of housing societies to avoid fraudulent investments.", status: 'Coming Soon', details: "Instantly verify if a housing society has proper NOC approval and legal documentation." },
    { key: 'alerts', icon: "🚨", title: "Red Flag Alerts", desc: "Get warnings about fake documents, blacklisted developers, and suspicious property listings.", status: 'Coming Soon', details: "Get real-time warnings about suspicious listings, fake documents, and blacklisted developers." },
    { key: 'utilities', icon: "🏠", title: "Utilities Information", desc: "Check availability of electricity, gas, water, and other essential utilities in any area.", status: 'Coming Soon', details: "Check availability and reliability of electricity, gas, water, internet, and other utilities." },
    { key: 'dashboard', icon: "📊", title: "Smart Dashboard", desc: "Comprehensive overview of your investments, market insights, and personalized recommendations.", status: 'Active', details: "Your personalized control center with portfolio tracking, market alerts, and investment recommendations." },
    { key: 'auth', icon: "🔐", title: "Secure Access", desc: "User registration and login system with secure data protection and personalized experience.", status: 'Active', details: "Secure user accounts with encrypted data storage and personalized investment tracking." },
  ];

  const statsData = [
    { value: "95%", label: "Prediction Accuracy" },
    { value: "5+", label: "Major Societies Covered" },
    { value: "1000+", label: "Properties Analyzed" },
    { value: "24/7", label: "Market Monitoring" },
  ];
  // --- End Data Definitions ---

  // --- Utility Functions ---
  const showFeatureDetails = (featureKey) => {
    const feature = featuresData.find(f => f.key === featureKey);
    if (feature) {
      alert(`${feature.details}\n\nThis feature helps you make safer, more informed property investment decisions.`);
    }
  };

  const startDemo = () => {
    alert("Demo Mode Starting...\n\nIn your actual app, this would:\n• Create a demo account\n• Show sample predictions\n• Walk through key features\n• Allow testing without real data");
  };

  const startChatbot = () => {
    alert("🤖 AI Assistant Activated!\n\nHello! I'm your SPIFS AI assistant. I can help you with:\n\n• Property price predictions\n• Investment risk analysis\n• Market trend insights\n• ROI calculations\n• Society verification\n• Location recommendations\n\nIn your actual app, this would open a live chat interface with our AI-powered property investment advisor!");
  };

  const scrollToSection = (sectionId) => {
    const target = document.querySelector(sectionId);
    if (target) {
      window.scrollTo({
        top: target.offsetTop - (isMobile ? 60 : 80), 
        behavior: 'smooth'
      });
    }
  };
  // --- End Utility Functions ---


  // --- Effects ---
  // Effect for dynamic navbar background on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setNavbarBg('rgba(15, 23, 42, 0.98)');
      } else {
        setNavbarBg('rgba(15, 23, 42, 0.95)');
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Effect for mobile view check
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  // --- End Effects ---


  return (
    <div className="dashboard-container">
      {/* CRITICAL CSS BLOCK 
        Includes scrolling fix and updated stat alignment.
      */}
      <style>{`
        /* Global Reset and Body Styling */
        html { 
            scroll-behavior: smooth; 
            overflow-y: scroll; 
        }
        body {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #0F172A 0%, #1E293B 30%, #312E81 60%, #1E40AF 100%);
            color: white;
            line-height: 1.6;
            overflow-x: hidden;
            overflow-y: auto; 
        }
        .dashboard-container {
            width: 100%;
            min-height: 100vh;
        }
        * { box-sizing: border-box; }
        
        /* Navbar */
        .navbar {
          background: ${navbarBg}; 
          backdrop-filter: blur(10px);
          padding: 1rem 2rem;
          position: fixed;
          top: 0;
          width: 100%;
          z-index: 1000;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .nav-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            max-width: 1200px;
            margin: 0 auto;
        }

        .logo-nav {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .logo-mini {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #3B82F6, #1D4ED8);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.3s ease;
        }
        
        .logo-mini:hover {
             transform: scale(1.1) rotate(5deg);
        }

        .nav-brand {
            font-size: 1.5rem;
            font-weight: bold;
            color: #60A5FA;
        }

        .nav-menu {
            display: flex;
            gap: 2rem;
            list-style: none;
            margin: 0;
            padding: 0;
        }

        .nav-link {
            color: white;
            text-decoration: none;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            transition: all 0.3s ease;
            cursor: pointer;
        }
        
        .nav-link:hover {
            background: rgba(59, 130, 246, 0.2);
            color: #60A5FA;
        }
        
        /* Hero Section */
        .hero {
            padding: 8rem 2rem 4rem;
            text-align: center;
            max-width: 1200px;
            margin: 0 auto;
            position: relative;
            overflow: hidden;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }

        .hero-video {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -2;
            opacity: 0.3;
        }

        .hero-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.6));
            z-index: -1;
        }

        .hero-content {
            position: relative;
            z-index: 1;
        }

        .hero h1 {
            font-size: ${isMobile ? '2.5rem' : '3.5rem'};
            font-weight: bold;
            margin-bottom: 1rem;
            background: linear-gradient(135deg, #60A5FA, #3B82F6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .hero p {
            font-size: ${isMobile ? '1.1rem' : '1.3rem'};
            opacity: 0.9;
            margin-bottom: 2rem;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
        }
        
        /* CTA Button */
        .cta-button {
            background: linear-gradient(135deg, #3B82F6, #1D4ED8);
            color: white;
            padding: 1rem 2rem;
            border: none;
            border-radius: 12px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
            box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
            margin: 0.5rem;
        }

        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 35px rgba(59, 130, 246, 0.4);
        }
        
        /* Sections */
        section {
            padding: 4rem 2rem;
            max-width: 1200px;
            margin: 0 auto;
            text-align: center;
        }
        
        .section-heading {
            font-size: 2.5rem;
            margin-bottom: 3rem;
            color: #60A5FA;
        }

        /* Stats Section - ALIGNMENT FIX APPLIED HERE */
        .stats {
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(139, 92, 246, 0.05), rgba(6, 182, 212, 0.05));
            margin: 2rem 0;
            padding: 4rem 0; /* Reduced horizontal padding to allow full width stretch */
            text-align: center; /* Ensures content inside is centered */
            width: 100%; /* Ensure it spans the full width of the viewport */
        }

        .stats-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 2rem;
            text-align: center;
            max-width: 1200px; /* Use the max width for alignment */
            margin: 0 auto; /* CRITICAL: Centers the container within the full-width stats section */
            padding: 0 2rem; /* Add padding back inside the container */
        }

        .stat-item h3 {
            font-size: 2.5rem;
            color: #60A5FA;
            margin-bottom: 0.5rem;
        }

        .stat-item p {
            opacity: 0.8;
        }

        /* Features Section */
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 2rem;
        }

        .feature-card {
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1), rgba(6, 182, 212, 0.1));
            border: 1px solid rgba(59, 130, 246, 0.2);
            border-radius: 16px;
            padding: 2rem;
            transition: all 0.3s ease;
            cursor: pointer;
        }

        .feature-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(59, 130, 246, 0.2);
        }

        .feature-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
            display: block;
        }

        .feature-card h3 {
            font-size: 1.5rem;
            margin-bottom: 1rem;
            color: #60A5FA;
        }

        .feature-card p {
            opacity: 0.8;
            margin-bottom: 1rem;
        }
        
        /* Status Badges */
        .feature-status {
            display: inline-block;
            padding: 0.3rem 0.8rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
        }

        .status-active {
            background: rgba(34, 197, 94, 0.2);
            color: #22C55E;
        }

        .status-coming {
            background: rgba(251, 191, 36, 0.2);
            color: #FBBF24;
        }
        
        /* AI Section */
        .ai-section {
            position: relative;
            overflow: hidden;
        }

        .ai-background {
            position: absolute;
            top: 0;
            left: 0;
            opacity: 0.15;
            width: 100%;
            height: 100%;
            z-index: -2;
        }

        .ai-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(6, 182, 212, 0.1), rgba(59, 130, 246, 0.1));
            z-index: -1;
        }

        .ai-content {
            position: relative;
            z-index: 1;
        }

        .ai-content h2 {
            font-size: 2.5rem;
            margin-bottom: 1rem;
            background: linear-gradient(135deg, #8B5CF6, #06B6D4, #3B82F6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .ai-content p {
            font-size: 1.2rem;
            margin-bottom: 2rem;
        }

        .ai-cta-chat {
            background: linear-gradient(135deg, #8B5CF6, #06B6D4);
        }

        .ai-cta-demo {
            background: linear-gradient(135deg, #06B6D4, #3B82F6);
        }

        /* Footer */
        .footer {
            padding: 2rem;
            text-align: center;
            border-top: 1px solid rgba(59, 130, 246, 0.2);
            margin-top: 4rem;
        }

        /* Mobile Adjustments */
        @media (max-width: 768px) {
            .nav-menu {
                display: none; 
            }
            .hero {
                padding-top: 6rem;
            }
            .features-grid {
                grid-template-columns: 1fr;
            }
        }
      `}</style>

      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo-nav">
            <div className="logo-mini">
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '20px', height: '20px' }}>
                <rect x="20" y="40" width="25" height="35" fill="white" opacity="0.9" />
                <rect x="55" y="30" width="25" height="45" fill="white" opacity="0.9" />
                <path d="M15 85 L35 65 L55 70 L75 50 L85 55" stroke="white" strokeWidth="3" fill="none" opacity="0.8" />
              </svg>
            </div>
            <span className="nav-brand">SPIFS</span>
          </div>
          <ul className="nav-menu">
            <li><span className="nav-link" onClick={() => scrollToSection('#hero')}>Home</span></li>
            <li><span className="nav-link" onClick={() => scrollToSection('#features')}>Features</span></li>
            <li><span className="nav-link" onClick={() => scrollToSection('#ai')}>AI</span></li>
            <li><span className="nav-link" onClick={() => scrollToSection('#contact')}>Contact</span></li>
            <li><span className="nav-link" onClick={onLoginClick}>Login</span></li>
          </ul>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="hero">
        <div className="hero-video">
          <svg width="100%" height="100%" viewBox="0 0 1200 600" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="buildingGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#3B82F6', stopOpacity: 0.3 }} />
                <stop offset="100%" style={{ stopColor: '#1E40AF', stopOpacity: 0.1 }} />
              </linearGradient>
            </defs>
            <rect x="100" y="300" width="80" height="200" fill="url(#buildingGrad)" rx="5" />
            <rect x="200" y="250" width="100" height="250" fill="url(#buildingGrad)" rx="5" />
            <rect x="320" y="280" width="90" height="220" fill="url(#buildingGrad)" rx="5" />
            <rect x="430" y="200" width="120" height="300" fill="url(#buildingGrad)" rx="5" />
            <rect x="570" y="260" width="85" height="240" fill="url(#buildingGrad)" rx="5" />
            <rect x="680" y="220" width="110" height="280" fill="url(#buildingGrad)" rx="5" />
            <rect x="810" y="290" width="95" height="210" fill="url(#buildingGrad)" rx="5" />
            <path d="M50 450 Q200 400 350 380 T650 350 T950 320 L1100 300" stroke="#60A5FA" strokeWidth="3" fill="none" opacity="0.6" />
            <circle cx="200" cy="400" r="4" fill="#60A5FA" />
            <circle cx="400" cy="370" r="4" fill="#60A5FA" />
            <circle cx="600" cy="340" r="4" fill="#60A5FA" />
            <circle cx="800" cy="320" r="4" fill="#60A5FA" />
          </svg>
        </div>
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1>Smart Property Investment Made Simple</h1>
          <p>Use AI-powered predictions to make safer property investment decisions in Pakistan. Get accurate price forecasts, risk analysis, and market insights.</p>
          <button className="cta-button" onClick={() => scrollToSection('#features')}>Explore Features</button>
        </div>
      </section>

      {/* Stats Section - Alignment Fix Applied */}
      <section id="stats" className="stats">
        <div className="stats-container">
          {statsData.map((s, i) => (
            <div key={i} className="stat-item">
              <h3>{s.value}</h3>
              <p>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features">
        <h2 className="section-heading">Powerful Features for Smart Investing</h2>
        <div className="features-grid">
          {featuresData.map((f) => (
            <div key={f.key} className="feature-card" onClick={() => showFeatureDetails(f.key)}>
              <span className="feature-icon">{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
              <span className={`feature-status ${f.status === 'Active' ? 'status-active' : 'status-coming'}`}>
                {f.status}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* AI Section */}
      <section id="ai" className="ai-section">
        <div className="ai-background">
          <svg width="100%" height="100%" viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg">
            <circle cx="400" cy="200" r="80" fill="none" stroke="#8B5CF6" strokeWidth="2" />
            <circle cx="400" cy="200" r="50" fill="none" stroke="#06B6D4" strokeWidth="2" />
            <line x1="320" y1="150" x2="480" y2="250" stroke="#8B5CF6" strokeWidth="1" opacity="0.6" />
            <line x1="320" y1="250" x2="480" y2="150" stroke="#06B6D4" strokeWidth="1" opacity="0.6" />
            <line x1="350" y1="120" x2="450" y2="280" stroke="#3B82F6" strokeWidth="1" opacity="0.6" />
            <circle cx="320" cy="150" r="8" fill="#8B5CF6" />
            <circle cx="480" cy="150" r="8" fill="#06B6D4" />
            <circle cx="320" cy="250" r="8" fill="#3B82F6" />
            <circle cx="480" cy="250" r="8" fill="#8B5CF6" />
            <rect x="150" y="100" width="120" height="40" rx="20" fill="#8B5CF6" opacity="0.3" />
            <rect x="530" y="260" width="120" height="40" rx="20" fill="#06B6D4" opacity="0.3" />
          </svg>
        </div>
        <div className="ai-overlay" />
        <div className="ai-content">
          <h2>Talk to Our AI Assistant</h2>
          <p>Get instant property insights, price predictions, and investment advice from our intelligent chatbot powered by advanced AI.</p>
          <button className="cta-button ai-cta-chat" onClick={startChatbot}>🤖 Start AI Chat</button>
          <button className="cta-button ai-cta-demo" onClick={startDemo}>📊 Try Demo</button>
        </div>
      </section>

      {/* Placeholder Sections */}
      <section id="contact">
        <h2 className="section-heading">Contact Us</h2>
        <p>Email: support@spifs.com | Phone: +92 315539380</p>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2024 SPIFS - Smart Property Investment Forecasting System. Making property investment safer and smarter.</p>
      </footer>
    </div>
  );
};

export default Dashboard;