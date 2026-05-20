import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AppShell } from '@/components/layout/AppShell'

import LoginPage         from '@/pages/auth/LoginPage'
import RegisterPage      from '@/pages/auth/RegisterPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'

import DailyLog    from '@/pages/DailyLog'
import GoalsView   from '@/pages/GoalsView'
import PortalView  from '@/pages/PortalView'
import ReportView  from '@/pages/ReportView'
import SettingsPage from '@/pages/SettingsPage'
import InstancesPage from '@/pages/InstancesPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login"           element={<LoginPage />} />
      <Route path="/register"        element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/"         element={<DailyLog />} />
          <Route path="/goals"    element={<GoalsView />} />
          <Route path="/portals"  element={<PortalView />} />
          <Route path="/report"   element={<ReportView />} />
          <Route path="/settings"   element={<SettingsPage />} />
          <Route path="/instances" element={<InstancesPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
