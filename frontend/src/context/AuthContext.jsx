import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null)

export function AuthProvider({ children }){
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            setUser({ token })
        }
        setLoading(false)
    }, [])

    const login = async (email, password) => {
        const response = await fetch('http://localhost:8000/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })            
        })
        const data = await response.json()

        if (response.ok) {
            localStorage.setItem('token', data.access_token)
            setUser({ token: data.access_token })
            navigate('/')
            return { success: true }
        }
        return { success: false, error: data.detail }
    }
    const signup = async (name, email, password) => {
        const response = await fetch('http://localhost:8000/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        })
        const data = await response.json()

        if (response.ok) {
            localStorage.setItem('token', data.access_token)
            setUser({ token: data.access_token })
            navigate('/')
            return { success: true}
        }
        return { success: false, error: data.detail }
    }
    const logout = () => {
        localStorage.removeItem('token')
        setUser(null)
        navigate('/auth')
    }

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
        if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }
    return context
}