import React, { useState } from 'react';
import { useApp } from '../App';
import { Plus, Pin, Trash2, Edit2, X } from 'lucide-react';
import { format } from 'date-fns';

function NoteEditor({ note, onSave, onClose }) {
  const [form, setForm] = useState(note || { title: '', content: '', tags: [], pinned: false });
  const [tagInput, setTagInput] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const addTag = () => { if (tagInput.trim()) { set('tags', [...(form.tags||[]), tagInput.trim()]); setTagInput(''); } };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 680 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Note title" style={{ fontSize: 18, fontFamily: 'var(--font-display)', fontWeight: 700, background: 'transparent', border: 'none', borderBottom: '1px solid var(--border)', borderRadius: 0, padding: '4px 0', flex: 1 }} />
          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ marginLeft: 8 }}><X size={14}/></button>
        </div>
        <textarea value={form.content} onChange={e => set('content', e.target.value)} rows={14} placeholder="Write anything — meeting notes, frameworks, context..." style={{ fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.8 }} />
        <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
          <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTag()} placeholder="Add tag" style={{ flex: 1 }} />
          <button className="btn btn-sm" onClick={addTag}>Add tag</button>
          <button className={`btn btn-sm ${form.pinned ? 'btn-primary' : ''}`} onClick={() => set('pinned', !form.pinned)}>
            <Pin size={12}/> {form.pinned ? 'Pinned' : 'Pin'}
          </button>
        </div>
        <div className="tag-list">
          {(form.tags||[]).map(t => <span key={t} className="tag-chip" style={{ cursor: 'pointer' }} onClick={() => set('tags', form.tags.filter(x=>x!==t))}>{t} ×</span>)}
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { if(form.title) onSave(form); }}>Save</button>
        </div>
      </div>
    </div>
  );
}

export default function Notes() {
  const { data, update, uuidv4 } = useApp();
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState('');

  const notes = data.notes;
  const filtered = notes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase()) ||
    (n.tags||[]).some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  const pinned = filtered.filter(n => n.pinned);
  const unpinned = filtered.filter(n => !n.pinned);

  const save = (form) => {
    if (modal === 'new') {
      update('notes', [...notes, { ...form, id: uuidv4(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]);
    } else {
      update('notes', notes.map(n => n.id === form.id ? { ...form, updatedAt: new Date().toISOString() } : n));
    }
    setModal(null);
  };

  const del = (id) => update('notes', notes.filter(n => n.id !== id));
  const togglePin = (note) => update('notes', notes.map(n => n.id === note.id ? { ...n, pinned: !n.pinned } : n));

  const NoteCard = ({ note }) => (
    <div className="card" style={{ cursor: 'pointer', transition: 'border-color 0.18s' }} onClick={() => setModal(note)}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, flex: 1, marginRight: 8 }}>{note.title}</div>
        <div style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
          <button className="btn btn-ghost btn-sm" style={{ padding: '3px 6px', color: note.pinned ? 'var(--crimson)' : undefined }} onClick={() => togglePin(note)}><Pin size={11}/></button>
          <button className="btn btn-ghost btn-sm" style={{ padding: '3px 6px', color: 'var(--crimson)' }} onClick={() => del(note.id)}><Trash2 size={11}/></button>
        </div>
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 8, fontFamily: 'var(--font-mono)', whiteSpace: 'pre-wrap' }}>
        {note.content.slice(0, 120)}{note.content.length > 120 ? '…' : ''}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="tag-list" style={{ margin: 0 }}>
          {(note.tags||[]).map(t => <span key={t} className="tag-chip">{t}</span>)}
        </div>
        <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>
          {note.updatedAt ? format(new Date(note.updatedAt), 'dd MMM') : ''}
        </div>
      </div>
    </div>
  );

  return (
    <div className="view">
      <div className="view-header">
        <div><div className="view-title">Notes</div><div className="view-sub">{notes.length} notes · meeting notes, frameworks, context</div></div>
        <button className="btn btn-primary" onClick={() => setModal('new')}><Plus size={14}/> New note</button>
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notes..." style={{ marginBottom: 20 }} />

      {pinned.length > 0 && (
        <>
          <div className="section-header" style={{ marginBottom: 10 }}>
            <span className="section-title"><Pin size={10} style={{ marginRight: 4 }}/>Pinned</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12, marginBottom: 24 }}>
            {pinned.map(n => <NoteCard key={n.id} note={n} />)}
          </div>
        </>
      )}

      {unpinned.length > 0 && (
        <>
          {pinned.length > 0 && <div className="section-header" style={{ marginBottom: 10 }}><span className="section-title">All notes</span></div>}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {unpinned.map(n => <NoteCard key={n.id} note={n} />)}
          </div>
        </>
      )}

      {filtered.length === 0 && (
        <div className="empty"><div className="empty-label">No notes found.</div></div>
      )}

      {modal && <NoteEditor note={modal === 'new' ? null : modal} onSave={save} onClose={() => setModal(null)} />}
    </div>
  );
}
