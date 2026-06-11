import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AppShell } from '@/components/layout/AppShell'

import LoginPage          from '@/pages/auth/LoginPage'
import RegisterPage       from '@/pages/auth/RegisterPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'

import PortalView         from '@/pages/PortalView'
import PortalDetailsPage  from '@/pages/PortalDetailsPage'
import SettingsPage  from '@/pages/SettingsPage'
import InstancesPage from '@/pages/InstancesPage'
import InstanceDetailsPage from '@/pages/InstanceDetailsPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login"           element={<LoginPage />} />
      <Route path="/register"        element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/"              element={<Navigate to="/instances" replace />} />
          <Route path="/portals"       element={<PortalView />} />
          <Route path="/portals/:id"   element={<PortalDetailsPage />} />
          <Route path="/settings"      element={<SettingsPage />} />
          <Route path="/instances"     element={<InstancesPage />} />
          <Route path="/instances/:id" element={<InstanceDetailsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
