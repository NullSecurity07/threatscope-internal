import React, { useState } from 'react';
import { useApp } from '../App';
import { Plus, Trash2, Edit2, Check } from 'lucide-react';
import { format } from 'date-fns';

const STATUSES = ['Todo', 'In Progress', 'Done'];
const PRIORITIES = ['Critical', 'High', 'Medium', 'Low'];

function TaskModal({ task, onSave, onClose }) {
  const [form, setForm] = useState(task || {
    title: '', description: '', status: 'Todo', priority: 'High',
    assignee: 'Adithya', dueDate: '', tags: []
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const [tagInput, setTagInput] = useState('');

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      set('tags', [...(form.tags || []), tagInput.trim()]);
      setTagInput('');
    }
  };
  const removeTag = (t) => set('tags', form.tags.filter(x => x !== t));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">{task ? 'Edit Task' : 'New Task'}</div>
        <div className="form-group"><label>Title</label><input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Task title" /></div>
        <div className="form-group"><label>Description</label><textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} placeholder="Details, context, blockers..." /></div>
        <div className="form-row">
          <div className="form-group"><label>Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value)}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Priority</label>
            <select value={form.priority} onChange={e => set('priority', e.target.value)}>
              {PRIORITIES.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Assignee</label><input value={form.assignee} onChange={e => set('assignee', e.target.value)} /></div>
          <div className="form-group"><label>Due date</label><input type="date" value={form.dueDate ? form.dueDate.slice(0,10) : ''} onChange={e => set('dueDate', e.target.value ? new Date(e.target.value).toISOString() : '')} /></div>
        </div>
        <div className="form-group">
          <label>Tags</label>
          <div style={{ display: 'flex', gap: 6 }}>
            <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTag()} placeholder="Add tag, press Enter" />
            <button className="btn btn-sm" onClick={addTag} style={{ flexShrink: 0 }}>Add</button>
          </div>
          <div className="tag-list">
            {(form.tags || []).map(t => (
              <span key={t} className="tag-chip" style={{ cursor: 'pointer' }} onClick={() => removeTag(t)}>{t} ×</span>
            ))}
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { if (form.title) onSave(form); }}>Save</button>
        </div>
      </div>
    </div>
  );
}

const PCOLORS = { Critical: '#E8254A', High: '#E8622E', Medium: '#F0C040', Low: '#0FD98B' };

function TaskCard({ task, onEdit, onDelete, onToggle }) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done';
  return (
    <div className="card card-sm" style={{ marginBottom: 8, opacity: task.status === 'Done' ? 0.5 : 1 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <button
          onClick={() => onToggle(task)}
          style={{ width: 16, height: 16, borderRadius: 3, border: `1.5px solid ${PCOLORS[task.priority]}`, background: task.status === 'Done' ? PCOLORS[task.priority] : 'transparent', cursor: 'pointer', flexShrink: 0, marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {task.status === 'Done' && <Check size={10} color="#000" />}
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, textDecoration: task.status === 'Done' ? 'line-through' : 'none', marginBottom: 3 }}>{task.title}</div>
          {task.description && <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 6 }}>{task.description.slice(0, 80)}{task.description.length > 80 ? '…' : ''}</div>}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            {task.dueDate && (
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: isOverdue ? '#E8254A' : 'var(--text-tertiary)' }}>
                {isOverdue ? '⚠ ' : ''}{format(new Date(task.dueDate), 'dd MMM')}
              </span>
            )}
            {(task.tags || []).map(t => <span key={t} className="tag-chip">{t}</span>)}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          <button className="btn btn-ghost btn-sm" style={{ padding: '3px 6px' }} onClick={() => onEdit(task)}><Edit2 size={11}/></button>
          <button className="btn btn-ghost btn-sm" style={{ padding: '3px 6px', color: 'var(--crimson)' }} onClick={() => onDelete(task.id)}><Trash2 size={11}/></button>
        </div>
      </div>
    </div>
  );
}

export default function Tasks() {
  const { data, update, uuidv4 } = useApp();
  const [modal, setModal] = useState(null);
  const [view, setView] = useState('kanban');
  const [filterPriority, setFilterPriority] = useState('All');

  const tasks = data.tasks;
  const filtered = filterPriority === 'All' ? tasks : tasks.filter(t => t.priority === filterPriority);

  const save = (form) => {
    if (modal === 'new') {
      update('tasks', [...tasks, { ...form, id: uuidv4(), createdAt: new Date().toISOString() }]);
    } else {
      update('tasks', tasks.map(t => t.id === form.id ? form : t));
    }
    setModal(null);
  };

  const del = (id) => update('tasks', tasks.filter(t => t.id !== id));
  const toggle = (task) => {
    update('tasks', tasks.map(t => t.id === task.id ? { ...t, status: t.status === 'Done' ? 'Todo' : 'Done' } : t));
  };

  return (
    <div className="view">
      <div className="view-header">
        <div>
          <div className="view-title">Tasks</div>
          <div className="view-sub">{tasks.filter(t => t.status !== 'Done').length} open · {tasks.filter(t => t.status === 'Done').length} done</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
            {['kanban', 'list'].map(v => (
              <button key={v} onClick={() => setView(v)} style={{ padding: '6px 12px', background: view === v ? 'var(--crimson)' : 'transparent', border: 'none', color: view === v ? '#fff' : 'var(--text-secondary)', cursor: 'pointer', fontSize: 12 }}>
                {v === 'kanban' ? 'Kanban' : 'List'}
              </button>
            ))}
          </div>
          <button className="btn btn-primary" onClick={() => setModal('new')}><Plus size={14}/> New task</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {['All', ...PRIORITIES].map(p => (
          <button key={p} className={`btn btn-sm ${filterPriority === p ? 'btn-primary' : ''}`} onClick={() => setFilterPriority(p)} style={{ fontSize: 11 }}>{p}</button>
        ))}
      </div>

      {view === 'kanban' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {STATUSES.map(status => {
            const col = filtered.filter(t => t.status === status);
            return (
              <div key={status}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{status}</div>
                  <div style={{ fontSize: 11, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3, padding: '1px 6px', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>{col.length}</div>
                </div>
                {col.sort((a,b) => PRIORITIES.indexOf(a.priority) - PRIORITIES.indexOf(b.priority)).map(t => (
                  <TaskCard key={t.id} task={t} onEdit={setModal} onDelete={del} onToggle={toggle} />
                ))}
                {col.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-tertiary)', padding: '12px 0' }}>Empty</div>}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table>
            <thead><tr><th></th><th>Task</th><th>Priority</th><th>Status</th><th>Assignee</th><th>Due</th><th>Tags</th><th></th></tr></thead>
            <tbody>
              {filtered.sort((a,b) => PRIORITIES.indexOf(a.priority) - PRIORITIES.indexOf(b.priority)).map(t => (
                <tr key={t.id} style={{ opacity: t.status === 'Done' ? 0.5 : 1 }}>
                  <td style={{ width: 32 }}>
                    <button onClick={() => toggle(t)} style={{ width: 16, height: 16, borderRadius: 3, border: `1.5px solid ${PCOLORS[t.priority]}`, background: t.status === 'Done' ? PCOLORS[t.priority] : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {t.status === 'Done' && <Check size={10} color="#000" />}
                    </button>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500, textDecoration: t.status === 'Done' ? 'line-through' : 'none' }}>{t.title}</div>
                    {t.description && <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{t.description.slice(0,60)}…</div>}
                  </td>
                  <td><span className={`badge badge-${t.priority.toLowerCase()}`}>{t.priority}</span></td>
                  <td style={{ fontSize: 12 }}>{t.status}</td>
                  <td style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{t.assignee}</td>
                  <td style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Done' ? '#E8254A' : 'var(--text-tertiary)' }}>
                    {t.dueDate ? format(new Date(t.dueDate), 'dd MMM') : '—'}
                  </td>
                  <td><div className="tag-list">{(t.tags||[]).map(tg => <span key={tg} className="tag-chip">{tg}</span>)}</div></td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setModal(t)}><Edit2 size={11}/></button>
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--crimson)' }} onClick={() => del(t.id)}><Trash2 size={11}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="empty"><div className="empty-label">No tasks. Add one above.</div></div>}
        </div>
      )}

      {modal && <TaskModal task={modal === 'new' ? null : modal} onSave={save} onClose={() => setModal(null)} />}
    </div>
  );
}
