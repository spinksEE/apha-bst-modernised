import { useAuthStore } from '../store/auth';

export function HomePage(): React.JSX.Element {
  const userContext = useAuthStore((state) => state.userContext);

  return (
    <main style={{ padding: '2rem' }}>
      <h1>BST System - Home</h1>
      <p>Welcome{userContext ? `: ${userContext.name} (${userContext.role})` : ''}</p>
    </main>
  );
}

