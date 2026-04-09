import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HealthPage } from './pages/HealthPage';
import { RegisterSitePage } from './pages/RegisterSitePage';
import { SiteTraineesPage } from './pages/SiteTraineesPage';
import { EditSiteNamePage } from './pages/EditSiteNamePage';
import { AddPersonPage } from './pages/AddPersonPage';
import { EditPersonPage } from './pages/EditPersonPage';
import { ManageTrainersPage } from './pages/ManageTrainersPage';
import { RecordTrainingPage } from './pages/RecordTrainingPage';
import { TrainingHistoryPage } from './pages/TrainingHistoryPage';
import { EditTrainingPage } from './pages/EditTrainingPage';

export function App(): React.JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/health" element={<HealthPage />} />
        <Route element={<Layout />}>
          <Route path="/sites/register" element={<RegisterSitePage />} />
          <Route path="/sites/:plantNo/edit" element={<EditSiteNamePage />} />
          <Route path="/sites" element={<SiteTraineesPage />} />
          <Route path="/persons/add" element={<AddPersonPage />} />
          <Route path="/persons/:id/edit" element={<EditPersonPage />} />
          <Route path="/trainers" element={<ManageTrainersPage />} />
          <Route path="/training/add" element={<RecordTrainingPage />} />
          <Route path="/training/:id/edit" element={<EditTrainingPage />} />
          <Route path="/persons/:id/training" element={<TrainingHistoryPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
