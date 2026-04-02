import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ProtectedRoute } from './components/guards/ProtectedRoute';
import { HealthPage } from './pages/HealthPage';

// Placeholder pages — replaced in Phase 6
function LoginPlaceholder(): React.JSX.Element {
  return <div data-testid="login-page">Login</div>;
}

function HomePlaceholder(): React.JSX.Element {
  return <div data-testid="home-page">Home</div>;
}

function AccessDeniedPlaceholder(): React.JSX.Element {
  return <div data-testid="access-denied-page">Access Denied</div>;
}

export function App(): React.JSX.Element {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPlaceholder />} />
          <Route path="/access-denied" element={<AccessDeniedPlaceholder />} />
          <Route path="/health" element={<HealthPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePlaceholder />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
