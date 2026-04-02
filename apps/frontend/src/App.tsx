import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HealthPage } from './pages/HealthPage';

export function App(): React.JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/health" element={<HealthPage />} />
      </Routes>
    </BrowserRouter>
  );
}
