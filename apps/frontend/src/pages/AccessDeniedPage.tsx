import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

export function AccessDeniedPage(): React.JSX.Element {
  const referenceId = useAuthStore((state) => state.referenceId);
  const navigate = useNavigate();

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '1.5rem 2rem', fontWeight: 600 }}>BST System</header>
      <section
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '520px',
            border: '1px solid #f1c0c0',
            borderRadius: '8px',
            padding: '2rem',
            background: '#fff5f5',
          }}
        >
          <h1>Access Denied</h1>
          <p>You do not have permission to access the Brainstem Training System.</p>
          <p>Your access attempt has been logged.</p>
          <p>
            If you believe you should have access to this system, please contact
            your system administrator.
          </p>
          <p style={{ fontWeight: 600 }}>
            Reference ID: {referenceId ?? 'Unavailable'}
          </p>
          <button
            type="button"
            onClick={() => navigate('/login', { replace: true })}
            style={{
              marginTop: '1rem',
              padding: '0.65rem 1.25rem',
              borderRadius: '4px',
              border: 'none',
              background: '#0f172a',
              color: '#ffffff',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Return
          </button>
        </div>
      </section>
      <footer style={{ padding: '1rem 2rem', fontSize: '0.9rem', color: '#475569' }}>
        APHA BST System © 2026
      </footer>
    </main>
  );
}

