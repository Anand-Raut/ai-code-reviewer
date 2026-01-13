import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import AuthPage from './pages/AuthPage'
import ProtectedRoute from './components/ProtectedRoute'
import EditorPage from './pages/EditorPage'
import LandingPage from './pages/LandingPage'
import ProfilePage from './pages/ProfilePage'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={
          <ProtectedRoute>
            <EditorPage />
          </ProtectedRoute>
        } />
        <Route path='/landing' element={
          <LandingPage />
        } />
        <Route path='/profile' element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />

        <Route path="/auth" element={<AuthPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/signup" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/landing" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App