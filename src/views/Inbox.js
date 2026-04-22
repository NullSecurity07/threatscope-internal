import React, { useState } from 'react';
import { useApp } from '../App';
import { Zap, Check, Trash2, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

export default function Inbox() {
  const { data, update, uuidv4 } = useApp();
  const [input, setInput] = useState('');
  const [convertTarget, setConvertTarget] = useState(null);
  const [taskTitle, setTaskTitle] = useState('');

  const inbox = data.inbox || [];
  const pending = inbox.filter(i => !i.converted);
  const done = inbox.filter(i => i.converted);

  const add = () => {
    if (!input.trim()) return;
    update('inbox', [...inbox, { id: uuidv4(), content: input.trim(), converted: false, createdAt: new Date().toISOString() }]);
    setInput('');
  };

  const del = (id) => update('inbox', inbox.filter(i => i.id !== id));

  const convertToTask = (item) => {
    const title = taskTitle || item.content.slice(0, 60);
    update('tasks', [...(data.tasks||[]), {
      id: uuidv4(), title, description: item.content, status: 'Todo', priority: 'Medium',
      assignee: 'Adithya', dueDate: '', tags: ['from-inbox'], createdAt: new Date().toISOString()
    }]);
    update('inbox', inbox.map(i => i.id === item.id ? { ...i, converted: true, convertedAt: new Date().toISOString() } : i));
    setConvertTarget(null);
    setTaskTitle('');
  };

  return (
    <div className="view">
      <div className="view-header">
        <div>
          <div className="view-title">Quick Capture</div>
          <div className="view-sub">Dump ideas here. Convert to tasks later. Nothing gets lost.</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
        <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) add(); }} placeholder="Capture anything — an idea, a lead, a thing to look into later... (Ctrl+Enter to save)" style={{ flex: 1, minHeight: 72, resize: 'none' }} />
        <button className="btn btn-primary" onClick={add} style={{ alignSelf: 'flex-end', padding: '8px 16px' }}><Zap size={14}/> Capture</button>
      </div>

      <div className="section-header">
        <span className="section-title">Inbox <span style={{ color: 'var(--crimson)' }}>({pending.length})</span></span>
      </div>

      {pending.length === 0 ? (
        <div className="card empty" style={{ marginBottom: 24 }}><div className="empty-label">Inbox zero. You're clear.</div></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
          {pending.map(item => (
            <div key={item.id}>
              <div className="card card-sm" style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 4 }}>{item.content}</div>
                  <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>{format(new Date(item.createdAt), 'dd MMM, HH:mm')}</div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button className="btn btn-sm" onClick={() => { setConvertTarget(item.id); setTaskTitle(item.content.slice(0, 60)); }} style={{ fontSize: 11 }}>
                    <ArrowRight size={12}/> → Task
                  </button>
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--crimson)', padding: '4px 8px' }} onClick={() => del(item.id)}><Trash2 size={12}/></button>
                </div>
              </div>
              {convertTarget === item.id && (
                <div style={{ background: 'var(--surface)', border: '1px solid var(--crimson)', borderTop: 'none', borderRadius: '0 0 var(--radius) var(--radius)', padding: '10px 14px', display: 'flex', gap: 8 }}>
                  <input value={taskTitle} onChange={e => setTaskTitle(e.target.value)} placeholder="Task title (or keep as-is)" style={{ flex: 1, fontSize: 12 }} />
                  <button className="btn btn-primary btn-sm" onClick={() => convertToTask(item)}>Create task</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setConvertTarget(null)}>Cancel</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {done.length > 0 && (
        <>
          <div className="section-header"><span className="section-title">Converted ({done.length})</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {done.map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', opacity: 0.5 }}>
                <Check size={13} color="var(--green)" />
                <div style={{ flex: 1, fontSize: 12, color: 'var(--text-secondary)', textDecoration: 'line-through' }}>{item.content.slice(0, 100)}</div>
                <button className="btn btn-ghost btn-sm" style={{ padding: '2px 6px', color: 'var(--text-tertiary)' }} onClick={() => del(item.id)}><Trash2 size={11}/></button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
