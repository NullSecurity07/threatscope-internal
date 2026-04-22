import React, { useState, useEffect, createContext, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Dashboard from './views/Dashboard';
import Prospects from './views/Prospects';
import Tasks from './views/Tasks';
import Notes from './views/Notes';
import Templates from './views/Templates';
import Comms from './views/Comms';
import Docs from './views/Docs';
import Inbox from './views/Inbox';
import {
  LayoutDashboard, Users, CheckSquare, FileText,
  Layers, MessageSquare, FolderOpen, Zap, ChevronLeft, ChevronRight
} from 'lucide-react';
import './App.css';

export const AppContext = createContext(null);

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'prospects', label: 'Prospects', icon: Users },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'notes', label: 'Notes', icon: FileText },
  { id: 'comms', label: 'Comms', icon: MessageSquare },
  { id: 'templates', label: 'Templates', icon: Layers },
  { id: 'docs', label: 'Docs', icon: FolderOpen },
  { id: 'inbox', label: 'Quick Capture', icon: Zap },
];

export function useApp() { return useContext(AppContext); }

export default function App() {
  const [data, setData] = useState({});
  const [activeView, setActiveView] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('http://localhost:3001/api/data');
        const data = await response.json();
        setData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
    fetchData();
  }, []);

  const update = (key, val) => {
    const newData = { ...data, [key]: val };
    setData(newData);
    async function saveData() {
      try {
        await fetch('http://localhost:3001/api/data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newData),
        });
      } catch (error) {
        console.error('Error saving data:', error);
      }
    }
    saveData();
  };

  const views = { dashboard: Dashboard, prospects: Prospects, tasks: Tasks, notes: Notes, comms: Comms, templates: Templates, docs: Docs, inbox: Inbox };
  // Wait for data to be loaded before rendering the view
  if (!data.prospects) {
    return <div>Loading...</div>;
  }
  const View = views[activeView];

  return (
    <AppContext.Provider value={{ data, update, uuidv4 }}>
      <div className="app-shell">
        <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
          <div className="sidebar-header">
            {!collapsed && (
              <div className="logo-block">
                <div className="logo-mark">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="9" stroke="#C41E3A" strokeWidth="1.5"/>
                    <line x1="10" y1="2" x2="10" y2="18" stroke="#C41E3A" strokeWidth="1"/>
                    <line x1="2" y1="10" x2="18" y2="10" stroke="#C41E3A" strokeWidth="1"/>
                    <circle cx="10" cy="10" r="2.5" stroke="#C41E3A" strokeWidth="1"/>
                  </svg>
                </div>
                <div>
                  <div className="logo-name">ThreatScope</div>
                  <div className="logo-sub">Internal OS</div>
                </div>
              </div>
            )}
            <button className="collapse-btn" onClick={() => setCollapsed(c => !c)}>
              {collapsed ? <ChevronRight size={14}/> : <ChevronLeft size={14}/>}
            </button>
          </div>
          <nav className="sidebar-nav">
            {NAV.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  className={`nav-item ${activeView === item.id ? 'active' : ''}`}
                  onClick={() => setActiveView(item.id)}
                  title={collapsed ? item.label : ''}
                >
                  <Icon size={16}/>
                  {!collapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>
          {!collapsed && (
            <div className="sidebar-footer">
              <div className="phase-badge">Phase 1–3 ✓</div>
              <div className="sidebar-meta">Business track active</div>
            </div>
          )}
        </aside>
        <main className="main-content">
          <View />
        </main>
      </div>
    </AppContext.Provider>
  );
}