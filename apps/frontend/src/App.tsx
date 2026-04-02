import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ProtectedRoute } from './components/guards/ProtectedRoute';
import { AppShell } from './components/layout/AppShell';
import { AccessDeniedPage } from './pages/AccessDeniedPage';
import { HealthPage } from './pages/HealthPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';

export function App(): React.JSX.Element {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/access-denied" element={<AccessDeniedPage />} />
          <Route path="/health" element={<HealthPage />} />
          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<HomePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
