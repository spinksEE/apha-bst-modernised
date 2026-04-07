import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HealthPage } from './pages/HealthPage';
import { RegisterSitePage } from './pages/RegisterSitePage';
import { SiteTraineesPage } from './pages/SiteTraineesPage';
import { EditSiteNamePage } from './pages/EditSiteNamePage';

export function App(): React.JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/health" element={<HealthPage />} />
        <Route element={<Layout />}>
          <Route path="/sites/register" element={<RegisterSitePage />} />
          <Route path="/sites/:plantNo/edit" element={<EditSiteNamePage />} />
          <Route path="/sites" element={<SiteTraineesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
