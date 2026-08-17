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

interface SidebarProps {
  activeSidebarTab: string;
  setActiveSidebarTab: (tab: string) => void;
  setShowAskBodhiChat: (show: boolean) => void;
  userName?: string;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSidebarTab,
  setActiveSidebarTab,
  setShowAskBodhiChat,
  userName,
  onLogout
}) => {
  return (
    <aside className="sidebar">
      <div className="logo-container">
        <BookOpen className="logo-icon" style={{ color: '#38BDF8' }} />
        <span className="logo-text">BODHI AI Co-Teacher</span>
      </div>

      <nav className="sidebar-nav">
        <div 
          className={`nav-item ${activeSidebarTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveSidebarTab('dashboard')}
        >
          <Home className="nav-item-icon" />
          <span>Dashboard</span>
        </div>
        <div 
          className={`nav-item ${activeSidebarTab === 'textbooks' ? 'active' : ''}`}
          onClick={() => {
            setActiveSidebarTab('textbooks');
          }}
        >
          <BookOpen className="nav-item-icon" />
          <span>My Textbooks</span>
        </div>
        <div 
          className={`nav-item ${activeSidebarTab === 'curriculum' ? 'active' : ''}`}
          onClick={() => setActiveSidebarTab('curriculum')}
        >
          <Map className="nav-item-icon" />
          <span>Curriculum Map</span>
        </div>
        <div 
          className={`nav-item ${activeSidebarTab === 'lessons' ? 'active' : ''}`}
          onClick={() => setActiveSidebarTab('lessons')}
        >
          <Calendar className="nav-item-icon" />
          <span>Lesson Planner</span>
        </div>
        <div 
          className={`nav-item ${activeSidebarTab === 'materials' ? 'active' : ''}`}
          onClick={() => setActiveSidebarTab('materials')}
        >
          <Presentation className="nav-item-icon" />
          <span>PPT & Materials</span>
        </div>
        <div 
          className={`nav-item ${activeSidebarTab === 'assessments' ? 'active' : ''}`}
          onClick={() => setActiveSidebarTab('assessments')}
        >
          <FileSpreadsheet className="nav-item-icon" />
          <span>Assessments</span>
        </div>
        <div 
          className={`nav-item ${activeSidebarTab === 'homework' ? 'active' : ''}`}
          onClick={() => setActiveSidebarTab('homework')}
        >
          <BookOpen className="nav-item-icon" />
          <span>Homework</span>
        </div>
        <div 
          className={`nav-item ${activeSidebarTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveSidebarTab('analytics')}
        >
          <BarChart2 className="nav-item-icon" />
          <span>Class Analytics</span>
        </div>
        <div 
          className={`nav-item ${activeSidebarTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveSidebarTab('students')}
        >
          <Users className="nav-item-icon" />
          <span>Students</span>
        </div>
        <div 
          className={`nav-item ${activeSidebarTab === 'ask' ? 'active' : ''}`}
          onClick={() => {
            setActiveSidebarTab('dashboard');
            setShowAskBodhiChat(true);
          }}
        >
          <MessageSquare className="nav-item-icon" />
          <span>Ask Bodhi</span>
        </div>
        <div 
          className={`nav-item ${activeSidebarTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveSidebarTab('settings')}
        >
          <Settings className="nav-item-icon" />
          <span>Settings</span>
        </div>
      </nav>

      {/* User Info & Sign Out */}
      <div className="sidebar-user">
        <div className="user-info">
          <div className="user-avatar" style={{ background: '#4F46E5' }}>
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
