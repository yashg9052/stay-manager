'use client';
import { useEffect } from 'react';

export default function Modal({ title, onClose, children, width = 440 }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.32)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: 20,
      }}
    >
      <div style={{
        background: 'var(--bg)',
        border: '0.5px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px 28px',
        width: '100%',
        maxWidth: width,
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 500, color: 'var(--text)' }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              width: 28, height: 28,
              borderRadius: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--bg3)',
              color: 'var(--text2)',
              fontSize: 16,
              border: 'none',
              cursor: 'pointer',
            }}
          >×</button>
        </div>
        {children}
      </div>
    </div>
  );
}