'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/flats',     label: 'Flats'     },
  { href: '/tenants',   label: 'Tenants'   },
  { href: '/dashboard', label: 'Dashboard' },
];

export default function Navbar() {
  const path = usePathname();

  return (
    <nav style={{
      background: 'var(--bg)',
      borderBottom: '0.5px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        maxWidth: 1080,
        margin: '0 auto',
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 32,
        height: 52,
      }}>
        <span style={{ fontWeight: 500, fontSize: 15, color: 'var(--text)', letterSpacing: '-0.01em' }}>
          Stay Manager
        </span>
        <div style={{ display: 'flex', gap: 4 }}>
          {links.map(({ href, label }) => {
            const active = path === href || path.startsWith(href + '/');
            return (
              <Link key={href} href={href} style={{
                fontSize: 13,
                fontWeight: active ? 500 : 400,
                color: active ? 'var(--text)' : 'var(--text2)',
                padding: '5px 10px',
                borderRadius: 'var(--radius)',
                background: active ? 'var(--bg3)' : 'transparent',
                transition: 'background 0.12s, color 0.12s',
              }}>
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}