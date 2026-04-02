import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ProtectedRoute } from './components/guards/ProtectedRoute';
import { AppShell } from './components/layout/AppShell';
import { HealthPage } from './pages/HealthPage';
import { LoginPage } from './pages/LoginPage';

// Placeholder pages — replaced in later phases
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
          <Route path="/login" element={<LoginPage />} />
          <Route path="/access-denied" element={<AccessDeniedPlaceholder />} />
          <Route path="/health" element={<HealthPage />} />
          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<HomePlaceholder />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
