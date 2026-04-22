import React, { useState } from 'react';
import { useApp } from '../App';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { format } from 'date-fns';

const TYPES = ['Contract', 'NDA', 'Proposal', 'Report', 'Reference', 'Other'];
const STATUSES = ['Draft', 'Review', 'Final', 'Signed', 'Archived'];

function DocModal({ doc, onSave, onClose }) {
  const [form, setForm] = useState(doc || { name: '', type: 'Contract', status: 'Draft', description: '', tags: [] });
  const [tagInput, setTagInput] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const addTag = () => { if (tagInput.trim()) { set('tags', [...(form.tags||[]), tagInput.trim()]); setTagInput(''); } };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">{doc ? 'Edit Document' : 'Add Document'}</div>
        <div className="form-group"><label>Name</label><input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Document name" /></div>
        <div className="form-row">
          <div className="form-group"><label>Type</label>
            <select value={form.type} onChange={e => set('type', e.target.value)}>
              {TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value)}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="form-group"><label>Description / notes</label><textarea value={form.description} onChange={e => set('description', e.target.value)} rows={4} /></div>
        <div className="form-group">
          <label>Tags</label>
          <div style={{ display: 'flex', gap: 6 }}>
            <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTag()} placeholder="Add tag" />
            <button className="btn btn-sm" onClick={addTag}>Add</button>
          </div>
          <div className="tag-list">{(form.tags||[]).map(t => <span key={t} className="tag-chip" style={{ cursor: 'pointer' }} onClick={() => set('tags', form.tags.filter(x=>x!==t))}>{t} ×</span>)}</div>
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { if (form.name) onSave(form); }}>Save</button>
        </div>
      </div>
    </div>
  );
}

const STATUS_COLORS = { Draft: '#5A5A63', Review: '#1E6FD9', Final: '#0FD98B', Signed: '#C41E3A', Archived: '#3a3a3c' };
const TYPE_ICONS = { Contract: '📄', NDA: '🔒', Proposal: '📋', Report: '📊', Reference: '📚', Other: '📁' };

export default function Docs() {
  const { data, update, uuidv4 } = useApp();
  const [modal, setModal] = useState(null);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const docs = data.docs || [];
  let filtered = filter === 'All' ? docs : docs.filter(d => d.type === filter);
  filtered = filtered.filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || (d.description||'').toLowerCase().includes(search.toLowerCase()));

  const save = (form) => {
    if (modal === 'new') {
      update('docs', [...docs, { ...form, id: uuidv4(), createdAt: new Date().toISOString() }]);
    } else {
      update('docs', docs.map(d => d.id === form.id ? form : d));
    }
    setModal(null);
  };

  const del = (id) => update('docs', docs.filter(d => d.id !== id));

  return (
    <div className="view">
      <div className="view-header">
        <div><div className="view-title">Docs</div><div className="view-sub">Contracts, NDAs, proposals — document vault</div></div>
        <button className="btn btn-primary" onClick={() => setModal('new')}><Plus size={14}/> Add doc</button>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20, alignItems: 'center' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search docs..." style={{ width: 240 }} />
        <div style={{ display: 'flex', gap: 6 }}>
          {['All', ...TYPES].map(t => (
            <button key={t} className={`btn btn-sm ${filter === t ? 'btn-primary' : ''}`} onClick={() => setFilter(t)} style={{ fontSize: 11 }}>{t}</button>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div className="empty"><div className="empty-label">No documents. Add one above.</div></div>
        ) : (
          <table>
            <thead><tr><th>Document</th><th>Type</th><th>Status</th><th>Tags</th><th>Added</th><th></th></tr></thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 18 }}>{TYPE_ICONS[d.type] || '📄'}</span>
                      <div>
                        <div style={{ fontWeight: 500 }}>{d.name}</div>
                        {d.description && <div style={{ fontSize: 11, color: 'var(--text-tertiary)', maxWidth: 300 }}>{d.description.slice(0, 60)}{d.description.length > 60 ? '…' : ''}</div>}
                      </div>
                    </div>
                  </td>
                  <td><span className="badge badge-gray">{d.type}</span></td>
                  <td>
                    <span className="badge" style={{ background: `${STATUS_COLORS[d.status]}18`, color: STATUS_COLORS[d.status], border: `1px solid ${STATUS_COLORS[d.status]}40` }}>{d.status}</span>
                  </td>
                  <td><div className="tag-list">{(d.tags||[]).map(t => <span key={t} className="tag-chip">{t}</span>)}</div></td>
                  <td style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>{d.createdAt ? format(new Date(d.createdAt), 'dd MMM yy') : '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setModal(d)}><Edit2 size={11}/></button>
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--crimson)' }} onClick={() => del(d.id)}><Trash2 size={11}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && <DocModal doc={modal === 'new' ? null : modal} onSave={save} onClose={() => setModal(null)} />}
    </div>
  );
}
