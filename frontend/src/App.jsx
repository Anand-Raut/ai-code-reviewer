import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import AuthPage from './pages/AuthPage'
import ProtectedRoute from './components/ProtectedRoute'
import EditorPage from './pages/EditorPage'

function App() {
  return (
      <AuthProvider>
        <Routes>
          <Route path="/" element={
                            <ProtectedRoute>
                              <div>Home Page (logged in)</div>
                            </ProtectedRoute>
                          }/>
          <Route path='/editor' element = {
            <ProtectedRoute>
              <EditorPage/>
            </ProtectedRoute>

          }/>

          <Route path="/auth" element={<AuthPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
  )
}

export default App
