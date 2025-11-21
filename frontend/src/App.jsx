import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import AuthPage from './pages/authPage'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
      <AuthProvider>
        <Routes>
          <Route path="/" 
            element={
              <ProtectedRoute>
                <div>Home Page (logged in)</div>
              </ProtectedRoute>
            } 
          />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
  )
}

export default App
