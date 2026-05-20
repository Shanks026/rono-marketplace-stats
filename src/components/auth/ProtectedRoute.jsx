import { Navigate, Outlet } from 'react-router-dom'
import { useAuthContext } from '@/context/AuthContext'
import { Spinner } from '@/components/ui/spinner'

export function ProtectedRoute() {
  const { user, loading } = useAuthContext()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
