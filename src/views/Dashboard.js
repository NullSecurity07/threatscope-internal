import React from 'react';
import { useApp } from '../App';
import { format } from 'date-fns';
import { AlertCircle, TrendingUp, CheckSquare, Users, Zap } from 'lucide-react';

const STAGE_ORDER = ['Cold','Contacted','Call Scheduled','PoV','Pilot','Contract'];

export default function Dashboard() {
  const { data } = useApp();
  const { tasks, prospects, inbox, messages } = data;

  const todayTasks = tasks.filter(t => t.status !== 'Done');
  const criticalTasks = tasks.filter(t => t.priority === 'Critical' && t.status !== 'Done');
  const activeProspects = prospects.filter(p => p.stage !== 'Cold');
  const pendingInbox = inbox.filter(i => !i.converted);

  const stageCounts = STAGE_ORDER.reduce((acc, s) => {
    acc[s] = prospects.filter(p => p.stage === s).length;
    return acc;
  }, {});

  const recentMsgs = [...messages].sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 4);
  const urgentTasks = tasks.filter(t => (t.priority === 'Critical' || t.priority === 'High') && t.status !== 'Done').slice(0, 5);

  return (
    <div className="view">
      <div className="view-header">
        <div>
          <div className="view-title">Dashboard</div>
          <div className="view-sub">{format(new Date(), 'EEEE, d MMMM yyyy')} · Business track active</div>
        </div>
      </div>

      {criticalTasks.length > 0 && (
        <div style={{ background: 'rgba(196,30,58,0.08)', border: '1px solid rgba(196,30,58,0.25)', borderRadius: 'var(--radius-lg)', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <AlertCircle size={16} color="#C41E3A" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#E8254A', marginBottom: 4 }}>
              {criticalTasks.length} critical task{criticalTasks.length > 1 ? 's' : ''} blocking revenue
            </div>
            {criticalTasks.map(t => (
              <div key={t.id} style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>→ {t.title}</div>
            ))}
          </div>
        </div>
      )}

      <div className="grid-4 mb-24">
        <div className="card card-sm">
          <div className="stat-label">Open tasks</div>
          <div className="stat-num" style={{ color: todayTasks.length > 5 ? 'var(--amber)' : 'var(--text-primary)' }}>{todayTasks.length}</div>
        </div>
        <div className="card card-sm">
          <div className="stat-label">Active prospects</div>
          <div className="stat-num" style={{ color: 'var(--blue)' }}>{prospects.length}</div>
        </div>
        <div className="card card-sm">
          <div className="stat-label">Inbox items</div>
          <div className="stat-num" style={{ color: pendingInbox.length > 0 ? 'var(--amber)' : 'var(--green)' }}>{pendingInbox.length}</div>
        </div>
        <div className="card card-sm">
          <div className="stat-label">In pilot/contract</div>
          <div className="stat-num" style={{ color: 'var(--green)' }}>{(stageCounts['Pilot'] || 0) + (stageCounts['Contract'] || 0)}</div>
        </div>
      </div>

      <div className="grid-2 mb-24">
        <div>
          <div className="section-header">
            <span className="section-title">Priority tasks</span>
            <CheckSquare size={13} color="var(--text-tertiary)" />
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {urgentTasks.length === 0 ? (
              <div className="empty"><div className="empty-label">No urgent tasks</div></div>
            ) : urgentTasks.map(t => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
                <div className={`priority-dot dot-${t.priority.toLowerCase()}`} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, truncate: 'ellipsis', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</div>
                  {t.dueDate && <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>Due {format(new Date(t.dueDate), 'dd MMM')}</div>}
                </div>
                <span className={`badge badge-${t.priority.toLowerCase()}`}>{t.priority}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="section-header">
            <span className="section-title">Pipeline</span>
            <TrendingUp size={13} color="var(--text-tertiary)" />
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {STAGE_ORDER.map((stage, i) => {
              const count = stageCounts[stage] || 0;
              const pct = prospects.length > 0 ? (count / prospects.length) * 100 : 0;
              const colors = { Cold: '#5A5A63', Contacted: '#1E6FD9', 'Call Scheduled': '#F0C040', PoV: '#E8622E', Pilot: '#C41E3A', Contract: '#0FD98B' };
              return (
                <div key={stage} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderBottom: i < STAGE_ORDER.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', width: 110, flexShrink: 0 }}>{stage}</div>
                  <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                    {count > 0 && <div style={{ height: '100%', width: `${Math.max(pct, 8)}%`, background: colors[stage], borderRadius: 2 }} />}
                  </div>
                  <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: count > 0 ? colors[stage] : 'var(--text-tertiary)', width: 20, textAlign: 'right' }}>{count}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div>
        <div className="section-header">
          <span className="section-title">Recent activity</span>
          <Users size={13} color="var(--text-tertiary)" />
        </div>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {recentMsgs.length === 0 ? (
            <div className="empty"><div className="empty-label">No messages yet</div></div>
          ) : recentMsgs.map(m => (
            <div key={m.id} style={{ display: 'flex', gap: 10, padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--crimson-bg)', border: '1px solid var(--crimson-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: 'var(--crimson)', flexShrink: 0 }}>
                {m.author[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', marginBottom: 2 }}>
                  <span style={{ fontSize: 12, fontWeight: 500 }}>{m.author}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>{format(new Date(m.timestamp), 'dd MMM, HH:mm')}</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{m.content}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
