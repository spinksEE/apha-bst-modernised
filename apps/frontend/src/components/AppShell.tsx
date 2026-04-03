import type { ReactNode } from 'react';
import type { UserContext } from '../types/auth';
import { formatUserContext } from './userContext';

interface AppShellProps {
  userContext: UserContext;
  navigation?: ReactNode;
  children: ReactNode;
}

export function AppShell({ userContext, navigation, children }: AppShellProps): React.JSX.Element {
  const userContextLabel = formatUserContext(userContext);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header
        aria-label="BST system header"
        style={{
          padding: '1.5rem 2rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
        }}
      >
        <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>BST System</div>
        <div style={{ textAlign: 'right', fontSize: '0.95rem', color: '#0f172a' }}>
          {userContextLabel}
        </div>
      </header>
      {navigation ? (
        <nav
          aria-label="Primary"
          style={{
            padding: '1rem 2rem 0',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          {navigation}
        </nav>
      ) : null}
      <main style={{ flex: 1, padding: '2rem' }}>{children}</main>
      <footer
        style={{
          padding: '1rem 2rem',
          fontSize: '0.9rem',
          color: '#475569',
          borderTop: '1px solid #e2e8f0',
        }}
      >
        APHA BST System © 2026
      </footer>
    </div>
  );
}
