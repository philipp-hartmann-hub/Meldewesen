// App.jsx – HEUREKA 2.0 | A2 eMeldewesen
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { RollenProvider } from './context/RollenContext'
import JVPDashboard from './pages/JVPDashboard'
import EMeldewesenHub from './pages/EMeldewesenHub'
import MeldungenListe from './pages/MeldungenListe'
import MeldungDetail from './pages/MeldungDetail'
import MeldungNeu from './pages/MeldungNeu'
import Arbeitskorb from './pages/Arbeitskorb'
import ArbeitskorbAufgabe from './pages/ArbeitskorbAufgabe'
import FallDetail from './pages/FallDetail'

export default function App() {
  return (
    <RollenProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<JVPDashboard />} />
          <Route path="/emeldewesen" element={<EMeldewesenHub />} />
          <Route path="/meldungen" element={<MeldungenListe />} />
          <Route path="/arbeitskorb" element={<Arbeitskorb />} />
          <Route path="/arbeitskorb/aufgabe/:aufgabeId" element={<ArbeitskorbAufgabe />} />
          <Route path="/faelle/:id" element={<FallDetail />} />
          <Route path="/meldungen/neu" element={<MeldungNeu />} />
          <Route path="/meldungen/:id" element={<MeldungDetail />} />
          <Route path="/meldungen/:id/bearbeiten" element={<MeldungDetail editMode />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </RollenProvider>
  )
}
