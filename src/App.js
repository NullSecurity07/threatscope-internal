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

const INITIAL_DATA = {
  prospects: [
    {
      id: uuidv4(), name: 'Gaurav Sharma', company: 'SBI Card', role: 'VP Information Security',
      stage: 'Cold', sector: 'Payment', lastAction: 'LinkedIn outreach sent', nextAction: 'Follow up in 2 weeks',
      notes: 'Initial contact via LinkedIn. Technically literate. PCI-DSS focus.', priority: 'High',
      email: '', phone: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    }
  ],
  tasks: [
    { id: uuidv4(), title: 'Complete Udyam registration', description: '30 min on udyamregistration.gov.in. Blocks invoicing.', status: 'Todo', priority: 'Critical', assignee: 'Adithya', dueDate: new Date(Date.now() + 86400000).toISOString(), tags: ['business', 'legal'], createdAt: new Date().toISOString() },
    { id: uuidv4(), title: 'Production Dockerfile full build', description: 'Bake qwen3:4b + qwen2.5-coder:1.5b into image. Test --network none end-to-end.', status: 'In Progress', priority: 'High', assignee: 'Adithya', dueDate: new Date(Date.now() + 7 * 86400000).toISOString(), tags: ['engineering'], createdAt: new Date().toISOString() },
    { id: uuidv4(), title: 'Identify 2-3 fresh VP InfoSec targets', description: 'Private banks, NBFCs, payment aggregators. LinkedIn outreach.', status: 'Todo', priority: 'High', assignee: 'Adithya', dueDate: new Date(Date.now() + 3 * 86400000).toISOString(), tags: ['gtm', 'outreach'], createdAt: new Date().toISOString() },
    { id: uuidv4(), title: 'Run Juice Shop Tier 3 full scan', description: 'Non-sandboxed. Full Agent 3/4 LLM deep analysis pass.', status: 'Todo', priority: 'Medium', assignee: 'Adithya', dueDate: new Date(Date.now() + 14 * 86400000).toISOString(), tags: ['engineering', 'demo'], createdAt: new Date().toISOString() },
  ],
  notes: [
    { id: uuidv4(), title: 'Venture Dock Meeting — Filed', content: 'Met with CEO. Impressed by architecture, no technical objections.\n\nVerdict: too early, cybersec program offline, wrong geography.\n\nStanding invitation: contact when raising a funding round or going global.\n\nAction: Do not follow up until first paying client is closed.', tags: ['investor', 'filed'], pinned: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: uuidv4(), title: 'BFSI Sales Call Framework', content: 'Opening: Air-gap story — 90 seconds, then demo.\n\n"Every time a bank runs a source code audit, the code goes somewhere. ThreatScope inverts this."\n\nDemo: Juice Shop Tier 1/2 — 251 findings, 0 vendor FP.\n\nFraming: Use compliance language. Not CVE numbers.\n\nOne ask: CISO introduction only. Nothing else.', tags: ['sales', 'framework'], pinned: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ],
  templates: [
    { id: uuidv4(), name: 'Cold LinkedIn DM — VP InfoSec', category: 'Outreach', content: 'Hi [Name],\n\nYou\'re dealing with a problem most banks don\'t talk about publicly: every time a source code audit happens, the code leaves the network.\n\nThreatScope inverts that. Local LLM inference, bundled in Docker, zero egress. Air-gapped from day one.\n\nWe ran it on a 605-file Node.js app — 251 findings, 0 false positives on vendor code. Each finding maps to your RBI Master Direction obligations.\n\nWorth 20 minutes to see what it found?\n\n— Adithya', createdAt: new Date().toISOString() },
    { id: uuidv4(), name: 'Cold Email — BFSI', category: 'Outreach', content: 'Subject: Source code security that stays on your servers — 251 findings, air-gapped\n\nHi [Name],\n\n[Company]\'s source code is your most sensitive asset. Every cloud-based scanner is a data sovereignty risk under RBI Master Direction 4.4.\n\nThreatScope is the only AI security scanner that never leaves your network.\n\nWould you be comfortable with a 48-hour Risk Assessment on one of your repos?\n\n— Adithya Poojary\nThreatScope', createdAt: new Date().toISOString() },
    { id: uuidv4(), name: '48-Hour PoV Proposal', category: 'Sales', content: '48-Hour Risk Assessment — ThreatScope\n\nProspect: [Company Name]\nContact: [Name, Role]\n\nScope: [Payment Gateway / Auth Service / Mobile Banking API]\nDuration: 48 hours from access grant to report delivery\n\nDeliverables:\n- Risk Snapshot: 3-5 critical business logic findings\n- Compliance mapping: RBI Master Direction 4.x + PCI-DSS 6.5.x\n- Zero-egress verification\n\nPricing: ₹3-5L, credited toward first annual contract.\n\nThreatScope — the only AI security scanner that never leaves your network.', createdAt: new Date().toISOString() },
    { id: uuidv4(), name: 'CISO Objection Responses', category: 'Sales', content: 'Q: What happens to our source code?\nA: Nothing leaves your network. Ever.\n\nQ: How does it compare to SonarQube?\nA: SonarQube catches patterns it was programmed to know. ThreatScope catches business logic flaws.\n\nQ: Are you a registered company?\nA: Sole proprietorship registered.\n\nQ: What\'s the pricing?\nA: Pilot at ₹3-5L for 3 months, credited toward the annual contract.', createdAt: new Date().toISOString() },
  ],
  messages: [
    { id: uuidv4(), author: 'Adithya', content: 'Phase 1-3 complete. Juice Shop gate passed — 251 findings, 0 vendor FP. Moving to business track. Priority: Udyam registration TODAY.', channel: 'general', timestamp: new Date().toISOString() },
    { id: uuidv4(), author: 'Adithya', content: 'Venture Dock call done. Filed as warm contact. CEO impressed, no technical objections. Wrong geography for current program. Standing invite when raising. Do not follow up until first client closed.', channel: 'general', timestamp: new Date(Date.now() - 86400000).toISOString() },
  ],
  docs: [
    { id: uuidv4(), name: 'Engagement Contract Template', type: 'Contract', status: 'Draft', description: 'Standard pilot engagement contract. Add liability caps and source code sovereignty clause before first use.', tags: ['legal', 'template'], createdAt: new Date().toISOString() },
    { id: uuidv4(), name: 'NDA Template', type: 'NDA', status: 'Draft', description: 'Mutual NDA for prospect conversations. Governs source code access during 48-hr PoV.', tags: ['legal'], createdAt: new Date().toISOString() },
  ],
  inbox: [
    { id: uuidv4(), content: 'Follow up with DSCI / NASSCOM for direct CISO access events in Bengaluru / Mumbai.', converted: false, createdAt: new Date().toISOString() },
    { id: uuidv4(), content: 'Look into CERT-In empaneled audit firms — potential channel partner for BFSI distribution.', converted: false, createdAt: new Date().toISOString() },
  ]
};

function loadData() {
  try {
    const stored = localStorage.getItem('ts_crm_data');
    if (stored) return JSON.parse(stored);
  } catch (e) {}
  return INITIAL_DATA;
}

function saveData(data) {
  try { localStorage.setItem('ts_crm_data', JSON.stringify(data)); } catch (e) {}
}

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
  const [data, setData] = useState(loadData);
  const [activeView, setActiveView] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => { saveData(data); }, [data]);

  const update = (key, val) => setData(prev => ({ ...prev, [key]: val }));

  const views = { dashboard: Dashboard, prospects: Prospects, tasks: Tasks, notes: Notes, comms: Comms, templates: Templates, docs: Docs, inbox: Inbox };
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
