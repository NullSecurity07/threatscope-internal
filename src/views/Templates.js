import React, { useState } from 'react';
import { useApp } from '../App';
import { Plus, Copy, Check, Trash2, Edit2 } from 'lucide-react';

const CATEGORIES = ['Outreach', 'Sales', 'Legal', 'Ops', 'Other'];

function TemplateModal({ template, onSave, onClose }) {
  const [form, setForm] = useState(template || { name: '', category: 'Outreach', content: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 680 }} onClick={e => e.stopPropagation()}>
        <div className="modal-title">{template ? 'Edit Template' : 'New Template'}</div>
        <div className="form-row">
          <div className="form-group"><label>Name</label><input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Template name" /></div>
          <div className="form-group"><label>Category</label>
            <select value={form.category} onChange={e => set('category', e.target.value)}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Content — use [Name], [Company], [Role] as placeholders</label>
          <textarea value={form.content} onChange={e => set('content', e.target.value)} rows={14} style={{ fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.8 }} placeholder="Template content..." />
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { if (form.name && form.content) onSave(form); }}>Save</button>
        </div>
      </div>
    </div>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button className="btn btn-sm" onClick={copy} style={{ minWidth: 80 }}>
      {copied ? <><Check size={12} color="var(--green)"/> Copied</> : <><Copy size={12}/> Copy</>}
    </button>
  );
}

export default function Templates() {
  const { data, update, uuidv4 } = useApp();
  const [modal, setModal] = useState(null);
  const [filter, setFilter] = useState('All');
  const [active, setActive] = useState(null);
  const [customise, setCustomise] = useState({ Name: '', Company: '', Role: '' });

  const templates = data.templates;
  const filtered = filter === 'All' ? templates : templates.filter(t => t.category === filter);
  const activeTemplate = templates.find(t => t.id === active);

  const filled = activeTemplate ? activeTemplate.content
    .replace(/\[Name\]/g, customise.Name || '[Name]')
    .replace(/\[Company\]/g, customise.Company || '[Company]')
    .replace(/\[Role\]/g, customise.Role || '[Role]')
    : '';

  const save = (form) => {
    if (modal === 'new') {
      update('templates', [...templates, { ...form, id: uuidv4(), createdAt: new Date().toISOString() }]);
    } else {
      update('templates', templates.map(t => t.id === form.id ? form : t));
    }
    setModal(null);
  };

  const del = (id) => { update('templates', templates.filter(t => t.id !== id)); if (active === id) setActive(null); };

  return (
    <div className="view">
      <div className="view-header">
        <div><div className="view-title">Templates</div><div className="view-sub">Outreach, sales, legal — copy and personalise in one click</div></div>
        <button className="btn btn-primary" onClick={() => setModal('new')}><Plus size={14}/> New template</button>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {['All', ...CATEGORIES].map(c => (
          <button key={c} className={`btn btn-sm ${filter === c ? 'btn-primary' : ''}`} onClick={() => setFilter(c)} style={{ fontSize: 11 }}>{c}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: activeTemplate ? '300px 1fr' : 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(t => (
            <div key={t.id} className="card" style={{ cursor: 'pointer', borderColor: active === t.id ? 'var(--crimson)' : undefined }} onClick={() => setActive(active === t.id ? null : t.id)}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 3 }}>{t.name}</div>
                  <span className="badge badge-gray">{t.category}</span>
                </div>
                <div style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
                  <button className="btn btn-ghost btn-sm" style={{ padding: '3px 6px' }} onClick={() => setModal(t)}><Edit2 size={11}/></button>
                  <button className="btn btn-ghost btn-sm" style={{ padding: '3px 6px', color: 'var(--crimson)' }} onClick={() => del(t.id)}><Trash2 size={11}/></button>
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', marginTop: 8, lineHeight: 1.5 }}>
                {t.content.slice(0, 80)}…
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="empty"><div className="empty-label">No templates yet.</div></div>}
        </div>

        {activeTemplate && (
          <div className="card" style={{ position: 'sticky', top: 20 }}>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{activeTemplate.name}</div>
              <span className="badge badge-gray">{activeTemplate.category}</span>
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)', marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Personalise</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {['Name', 'Company', 'Role'].map(field => (
                  <div key={field} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', width: 60, flexShrink: 0, fontFamily: 'var(--font-mono)' }}>[{field}]</span>
                    <input value={customise[field]} onChange={e => setCustomise(c => ({ ...c, [field]: e.target.value }))} placeholder={field} style={{ flex: 1, padding: '5px 8px', fontSize: 12 }} />
                  </div>
                ))}
              </div>
            </div>

            <div className="divider" style={{ margin: '12px 0' }} />

            <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', lineHeight: 1.8, whiteSpace: 'pre-wrap', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '12px', marginBottom: 12, maxHeight: 360, overflowY: 'auto', color: 'var(--text-secondary)' }}>
              {filled}
            </div>

            <CopyButton text={filled} />
          </div>
        )}
      </div>

      {modal && <TemplateModal template={modal === 'new' ? null : modal} onSave={save} onClose={() => setModal(null)} />}
    </div>
  );
}
