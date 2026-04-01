// ─────────────────────────────────────────────────────────────
//  App.jsx  — Router + auth guard
// ─────────────────────────────────────────────────────────────
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage    from './pages/LoginPage'
import SignupPage   from './pages/SignupPage'
import ChatPage     from './pages/ChatPage'
import DashboardPage from './pages/DashboardPage'
import Spinner from './components/ui/Spinner'

/** Redirect unauthenticated users to /login */
function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f1117]">
        <Spinner size="lg" />
      </div>
    )
  }
  return user ? children : <Navigate to="/login" replace />
}

/** Redirect authenticated users away from auth pages */
function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f1117]">
        <Spinner size="lg" />
      </div>
    )
  }
  return user ? <Navigate to="/chat" replace /> : children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/chat" replace />} />
      <Route path="/login"  element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
      <Route path="/chat"   element={<PrivateRoute><ChatPage /></PrivateRoute>} />
      <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/chat" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: '#1e2130',
              color: '#e8eef5',
              border: '1px solid rgba(99,179,193,0.2)',
              borderRadius: '12px',
              fontSize: '13px',
            },
            success: { iconTheme: { primary: '#a8d8b9', secondary: '#1e2130' } },
            error:   { iconTheme: { primary: '#e07b8a', secondary: '#1e2130' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  )
}
