import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

function ProtectedRoute({ children }) {
    const { user, loading } = useAuth()
    
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-neutral-950">
                <div className="text-neutral-400">Loading...</div>
            </div>
        )
    }
    
    if (!user) {
        return <Navigate to="/auth" replace />
    }
    
    return children
}

export default ProtectedRoute