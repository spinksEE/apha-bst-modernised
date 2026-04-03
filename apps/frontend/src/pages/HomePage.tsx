import { AppShell } from '../components/AppShell';
import { formatUserContext } from '../components/userContext';
import { useAuthStore } from '../store/auth';

export function HomePage(): React.JSX.Element {
  const userContext = useAuthStore((state) => state.userContext);

  if (!userContext) {
    return (
      <main style={{ padding: '2rem' }}>
        <h1>BST System - Home</h1>
        <p>Loading...</p>
      </main>
    );
  }

  const userContextLabel = formatUserContext(userContext);

  return (
    <AppShell userContext={userContext}>
      <h1 style={{ marginBottom: '1.5rem' }}>BST System - Home</h1>
      <section
        aria-label="User context"
        style={{
          border: '1px solid #cbd5f5',
          borderRadius: '8px',
          padding: '1.25rem 1.5rem',
          background: '#f8fafc',
          fontWeight: 600,
        }}
      >
        {userContextLabel}
      </section>
    </AppShell>
  );
}
