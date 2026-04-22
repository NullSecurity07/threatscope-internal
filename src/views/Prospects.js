import React, { useState } from 'react';
import { useApp } from '../App';
import { Plus, X, Edit2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const STAGES = ['Cold','Contacted','Call Scheduled','PoV','Pilot','Contract'];
const SECTORS = ['Payment','Bank','NBFC','Insurance','IT/ITES','Other'];
const PRIORITIES = ['Critical','High','Medium','Low'];

const STAGE_COLORS = {
  Cold: '#5A5A63', Contacted: '#1E6FD9', 'Call Scheduled': '#F0C040',
  PoV: '#E8622E', Pilot: '#C41E3A', Contract: '#0FD98B'
};

function StageBadge({ stage }) {
  return (
    <span className="badge" style={{ background: `${STAGE_COLORS[stage]}18`, color: STAGE_COLORS[stage], border: `1px solid ${STAGE_COLORS[stage]}40` }}>
      {stage}
    </span>
  );
}

function ProspectModal({ prospect, onSave, onClose }) {
  const [form, setForm] = useState(prospect || {
    name: '', company: '', role: '', stage: 'Cold', sector: 'Bank',
    priority: 'High', email: '', phone: '', lastAction: '', nextAction: '', notes: ''
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">{prospect ? 'Edit Prospect' : 'Add Prospect'}</div>
        <div className="form-row">
          <div className="form-group"><label>Name</label><input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Full name" /></div>
          <div className="form-group"><label>Company</label><input value={form.company} onChange={e => set('company', e.target.value)} placeholder="SBI Card" /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Role</label><input value={form.role} onChange={e => set('role', e.target.value)} placeholder="VP Information Security" /></div>
          <div className="form-group"><label>Email</label><input value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@company.com" /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Stage</label>
            <select value={form.stage} onChange={e => set('stage', e.target.value)}>
              {STAGES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Sector</label>
            <select value={form.sector} onChange={e => set('sector', e.target.value)}>
              {SECTORS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Priority</label>
            <select value={form.priority} onChange={e => set('priority', e.target.value)}>
              {PRIORITIES.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Phone</label><input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 ..." /></div>
        </div>
        <div className="form-group"><label>Last action taken</label><input value={form.lastAction} onChange={e => set('lastAction', e.target.value)} placeholder="LinkedIn DM sent" /></div>
        <div className="form-group"><label>Next action</label><input value={form.nextAction} onChange={e => set('nextAction', e.target.value)} placeholder="Follow up in 2 weeks" /></div>
        <div className="form-group"><label>Notes</label><textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} placeholder="Key context, pain points, objections..." /></div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { if (form.name && form.company) onSave(form); }}>Save</button>
        </div>
      </div>
    </div>
  );
}

export default function Prospects() {
  const { data, update, uuidv4 } = useApp();
  const [modal, setModal] = useState(null);
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState(null);

  const prospects = data.prospects;
  const filtered = filter === 'All' ? prospects : prospects.filter(p => p.stage === filter);

  const save = (form) => {
    if (modal === 'new') {
      update('prospects', [...prospects, { ...form, id: uuidv4(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]);
    } else {
      update('prospects', prospects.map(p => p.id === form.id ? { ...form, updatedAt: new Date().toISOString() } : p));
    }
    setModal(null);
  };

  const del = (id) => { update('prospects', prospects.filter(p => p.id !== id)); setSelected(null); };

  const advance = (prospect) => {
    const idx = STAGES.indexOf(prospect.stage);
    if (idx < STAGES.length - 1) {
      update('prospects', prospects.map(p => p.id === prospect.id ? { ...p, stage: STAGES[idx + 1], updatedAt: new Date().toISOString() } : p));
    }
  };

  return (
    <div className="view">
      <div className="view-header">
        <div><div className="view-title">Prospects</div><div className="view-sub">BFSI outreach pipeline · {prospects.length} total</div></div>
        <button className="btn btn-primary" onClick={() => setModal('new')}><Plus size={14}/> Add Prospect</button>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {['All', ...STAGES].map(s => (
          <button key={s} className={`btn btn-sm ${filter === s ? 'btn-primary' : ''}`} onClick={() => setFilter(s)} style={{ fontSize: 11 }}>
            {s} {s !== 'All' && <span style={{ opacity: 0.6 }}>({prospects.filter(p => p.stage === s).length})</span>}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 340px' : '1fr', gap: 16 }}>
        <div>
          {filtered.length === 0 ? (
            <div className="card empty"><div className="empty-label">No prospects in this stage. Add one above.</div></div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table>
                <thead>
                  <tr>
                    <th>Contact</th>
                    <th>Stage</th>
                    <th>Priority</th>
                    <th>Next action</th>
                    <th>Updated</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => (
                    <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(p.id === selected ? null : p.id)}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>{p.role} · {p.company}</div>
                      </td>
                      <td><StageBadge stage={p.stage} /></td>
                      <td><span className={`badge badge-${p.priority?.toLowerCase()}`}>{p.priority}</span></td>
                      <td style={{ fontSize: 12, color: 'var(--text-secondary)', maxWidth: 180 }}>{p.nextAction}</td>
                      <td style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>{p.updatedAt ? format(new Date(p.updatedAt), 'dd MMM') : '—'}</td>
                      <td onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => setModal(p)}><Edit2 size={12}/></button>
                          <button className="btn btn-danger btn-sm" onClick={() => del(p.id)}><Trash2 size={12}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {selected && (() => {
          const p = prospects.find(pr => pr.id === selected);
          if (!p) return null;
          return (
            <div className="card" style={{ position: 'sticky', top: 0, alignSelf: 'start' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{p.role}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>{p.company}</div>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}><X size={14}/></button>
              </div>

              <div style={{ marginBottom: 12 }}>
                <StageBadge stage={p.stage} />
                <span className={`badge badge-${p.priority?.toLowerCase()}`} style={{ marginLeft: 6 }}>{p.priority}</span>
                <span className="badge badge-gray" style={{ marginLeft: 6 }}>{p.sector}</span>
              </div>

              {p.email && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>✉ {p.email}</div>}
              {p.phone && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>📞 {p.phone}</div>}

              <div className="divider" style={{ margin: '12px 0' }} />

              {p.lastAction && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', marginBottom: 3 }}>LAST ACTION</div>
                  <div style={{ fontSize: 13 }}>{p.lastAction}</div>
                </div>
              )}
              {p.nextAction && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', marginBottom: 3 }}>NEXT ACTION</div>
                  <div style={{ fontSize: 13, color: 'var(--amber)' }}>{p.nextAction}</div>
                </div>
              )}
              {p.notes && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', marginBottom: 3 }}>NOTES</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{p.notes}</div>
                </div>
              )}

              <div className="divider" style={{ margin: '12px 0' }} />
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => advance(p)} disabled={p.stage === 'Contract'}>
                  Advance stage →
                </button>
                <button className="btn btn-sm" onClick={() => setModal(p)}><Edit2 size={12}/></button>
              </div>
            </div>
          );
        })()}
      </div>

      {modal && (
        <ProspectModal
          prospect={modal === 'new' ? null : modal}
          onSave={save}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
