import React from 'react';
import { 
  BookOpen, 
  Home, 
  Map, 
  Calendar, 
  Presentation, 
  FileSpreadsheet, 
  Users, 
  MessageSquare, 
  Settings, 
  LogOut,
  BarChart2
} from 'lucide-react';
import bodhiLogo from '../../assets/image.png';

interface SidebarProps {
  activeSidebarTab: string;
  setActiveSidebarTab: (tab: string) => void;
  userName?: string;
  onLogout: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSidebarTab,
  setActiveSidebarTab,
  userName,
  onLogout,
  mobileOpen,
  setMobileOpen
}) => {
  const handleNavClick = (tab: string) => {
    setActiveSidebarTab(tab);
    setMobileOpen(false); // Close mobile drawer when an item is selected
  };

  return (
    <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="logo-container">
        <img src={bodhiLogo} alt="Bodhi Logo" className="logo-icon" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
        <span className="logo-text">BODHI AI Co-Teacher</span>
      </div>

      <nav className="sidebar-nav">
        <div 
          className={`nav-item ${activeSidebarTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => handleNavClick('dashboard')}
        >
          <Home className="nav-item-icon" />
          <span>Dashboard</span>
        </div>
        <div 
          className={`nav-item ${activeSidebarTab === 'textbooks' ? 'active' : ''}`}
          onClick={() => handleNavClick('textbooks')}
        >
          <BookOpen className="nav-item-icon" />
          <span>My Textbooks</span>
        </div>

        <div 
          className={`nav-item ${activeSidebarTab === 'materials' ? 'active' : ''}`}
          onClick={() => handleNavClick('materials')}
        >
          <Presentation className="nav-item-icon" />
          <span>PPT & Materials</span>
        </div>
        <div 
          className={`nav-item ${activeSidebarTab === 'assessments' ? 'active' : ''}`}
          onClick={() => handleNavClick('assessments')}
        >
          <FileSpreadsheet className="nav-item-icon" />
          <span>Assessments</span>
        </div>
        <div 
          className={`nav-item ${activeSidebarTab === 'homework' ? 'active' : ''}`}
          onClick={() => handleNavClick('homework')}
        >
          <BookOpen className="nav-item-icon" />
          <span>Homework</span>
        </div>
        <div 
          className={`nav-item ${activeSidebarTab === 'analytics' ? 'active' : ''}`}
          onClick={() => handleNavClick('analytics')}
        >
          <BarChart2 className="nav-item-icon" />
          <span>Class Analytics</span>
        </div>
        <div 
          className={`nav-item ${activeSidebarTab === 'students' ? 'active' : ''}`}
          onClick={() => handleNavClick('students')}
        >
          <Users className="nav-item-icon" />
          <span>Students</span>
        </div>

        <div 
          className={`nav-item ${activeSidebarTab === 'settings' ? 'active' : ''}`}
          onClick={() => handleNavClick('settings')}
        >
          <Settings className="nav-item-icon" />
          <span>Settings</span>
        </div>
      </nav>

      {/* User Info & Sign Out */}
      <div className="sidebar-user">
        <div className="user-info">
          <div className="user-avatar" style={{ background: '#C68A3D' }}>
            {userName ? userName.substring(0, 2).toUpperCase() : 'AS'}
          </div>
          <div className="user-details">
            <div className="user-name" title={userName || 'Mrs. Anjali Sharma'}>
              {userName || 'Mrs. Anjali Sharma'}
            </div>
            <div className="user-role">Science Teacher</div>
          </div>
        </div>
        <button className="btn-logout" onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', cursor: 'pointer' }}>
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
