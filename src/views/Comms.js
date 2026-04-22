import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../App';
import { Send, Hash, Plus, X } from 'lucide-react';
import { format } from 'date-fns';

const DEFAULT_CHANNELS = ['general', 'gtm', 'engineering', 'investor'];

export default function Comms() {
  const { data, update, uuidv4 } = useApp();
  const [activeChannel, setActiveChannel] = useState('general');
  const [input, setInput] = useState('');
  const [author, setAuthor] = useState('Adithya');
  const [newChannel, setNewChannel] = useState('');
  const [showNewChannel, setShowNewChannel] = useState(false);
  const bottomRef = useRef(null);

  const messages = data.messages || [];
  const channels = [...new Set([...DEFAULT_CHANNELS, ...messages.map(m => m.channel)])];
  const channelMsgs = messages.filter(m => m.channel === activeChannel).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [channelMsgs.length, activeChannel]);

  const send = () => {
    if (!input.trim()) return;
    update('messages', [...messages, { id: uuidv4(), author, content: input.trim(), channel: activeChannel, timestamp: new Date().toISOString() }]);
    setInput('');
  };

  const addChannel = () => {
    if (newChannel.trim() && !channels.includes(newChannel.trim().toLowerCase())) {
      setActiveChannel(newChannel.trim().toLowerCase());
      setNewChannel('');
      setShowNewChannel(false);
    }
  };

  const deleteMsg = (id) => update('messages', messages.filter(m => m.id !== id));

  const grouped = channelMsgs.reduce((acc, msg) => {
    const day = format(new Date(msg.timestamp), 'dd MMMM yyyy');
    if (!acc[day]) acc[day] = [];
    acc[day].push(msg);
    return acc;
  }, {});

  return (
    <div className="view" style={{ padding: 0, height: '100vh', display: 'flex', maxWidth: '100%' }}>
      <div style={{ width: 180, minWidth: 180, background: 'var(--surface)', borderRight: '1px solid var(--border)', padding: '20px 0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '0 14px 12px', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-tertiary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Channels</div>
        {channels.map(ch => (
          <button key={ch} onClick={() => setActiveChannel(ch)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: activeChannel === ch ? 'var(--crimson-bg)' : 'transparent', border: 'none', cursor: 'pointer', color: activeChannel === ch ? 'var(--crimson)' : 'var(--text-secondary)', fontSize: 13, textAlign: 'left', width: '100%' }}>
            <Hash size={13}/> {ch}
            {messages.filter(m => m.channel === ch).length > 0 && (
              <span style={{ marginLeft: 'auto', fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>{messages.filter(m => m.channel === ch).length}</span>
            )}
          </button>
        ))}
        {showNewChannel ? (
          <div style={{ padding: '8px 10px', display: 'flex', gap: 4 }}>
            <input value={newChannel} onChange={e => setNewChannel(e.target.value)} onKeyDown={e => e.key === 'Enter' && addChannel()} placeholder="channel-name" style={{ fontSize: 12, padding: '4px 6px' }} autoFocus />
            <button className="btn btn-ghost btn-sm" onClick={() => setShowNewChannel(false)}><X size={12}/></button>
          </div>
        ) : (
          <button onClick={() => setShowNewChannel(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', fontSize: 12, marginTop: 4 }}>
            <Plus size={12}/> Add channel
          </button>
        )}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Hash size={15} color="var(--text-tertiary)" />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>{activeChannel}</span>
          <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>· {channelMsgs.length} messages</span>
        </div>

        <div style={{ flex: 1, overflow: 'y auto', overflowY: 'auto', padding: '16px 20px' }}>
          {channelMsgs.length === 0 ? (
            <div className="empty" style={{ padding: '48px 0' }}><div className="empty-label">No messages in #{activeChannel} yet.</div></div>
          ) : (
            Object.entries(grouped).map(([day, msgs]) => (
              <div key={day}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0 10px' }}>
                  <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>{day}</span>
                  <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                </div>
                {msgs.map(m => (
                  <div key={m.id} style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'flex-start' }}
                    onMouseEnter={e => e.currentTarget.querySelector('.del-btn').style.opacity = '1'}
                    onMouseLeave={e => e.currentTarget.querySelector('.del-btn').style.opacity = '0'}
                  >
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--crimson-bg)', border: '1px solid var(--crimson-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: 'var(--crimson)', flexShrink: 0 }}>
                      {m.author[0]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', marginBottom: 2 }}>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{m.author}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>{format(new Date(m.timestamp), 'HH:mm')}</span>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{m.content}</div>
                    </div>
                    <button className="del-btn" onClick={() => deleteMsg(m.id)} style={{ opacity: 0, transition: 'opacity 0.15s', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: '2px 4px', fontSize: 12 }}>×</button>
                  </div>
                ))}
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <select value={author} onChange={e => setAuthor(e.target.value)} style={{ width: 110, flexShrink: 0, fontSize: 12, padding: '7px 8px' }}>
            <option>Adithya</option>
            <option>Team</option>
            <option>System</option>
          </select>
          <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder={`Message #${activeChannel}... (Enter to send)`} style={{ flex: 1, minHeight: 38, maxHeight: 120, resize: 'none' }} rows={1} />
          <button className="btn btn-primary" onClick={send} style={{ flexShrink: 0, padding: '8px 12px' }}><Send size={14}/></button>
        </div>
      </div>
    </div>
  );
}
