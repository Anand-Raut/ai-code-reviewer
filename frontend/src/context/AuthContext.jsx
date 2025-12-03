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
            fetch('http://localhost:8000/auth/me', {
                headers: { 
                    'Authorization': `Bearer ${token}` 
                }
            })
            .then(res => {
                // Check status code specifically
                if (res.status === 401 || res.status === 403) {
                    // Token is invalid/expired
                    throw new Error('Invalid token')
                }
                if (!res.ok) {
                    console.error('Server error, keeping user logged in')
                    setUser({ token })
                    return null
                }
                return res.json()
            })
            .then(userData => {
                if (userData) {
                    setUser(userData)
                }
            })
           .catch((error) => {
                // Check if it's actually an invalid token error
                if (error.message === 'Invalid token') {
                    console.log('Clearing invalid token')
                    localStorage.removeItem('token')
                    setUser(null)
                } else {
                    // Network error or other - keep user logged in
                    console.error('Network error, keeping user logged in:', error.message)
                    setUser({ token })
                }
            })
            .finally(() => {
                setLoading(false)
                
            })
        } else {
            setLoading(false)
        }
    }, [])

    const login = async (email, password) => {
        try {
            const response = await fetch('http://localhost:8000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })            
            })
            const data = await response.json()

            if (response.ok) {
                localStorage.setItem('token', data.access_token)
                
                const userResponse = await fetch('http://localhost:8000/auth/me', {
                    headers: { 'Authorization': `Bearer ${data.access_token}` }
                })
                
                if (userResponse.ok) {
                    const userData = await userResponse.json()
                    setUser({ token: data.access_token, ...userData })
                } else {
                    // Login succeeded but couldn't fetch user data
                    setUser({ token: data.access_token })
                }
                
                navigate('/')
                return { success: true }
            }
            return { success: false, error: data.detail }
        } catch (error) {
            console.error('Login error:', error)
            return { success: false, error: 'Network error. Please try again.' }
        }
    }

    const signup = async (name, email, password) => {
        try {
            const response = await fetch('http://localhost:8000/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            })
            const data = await response.json()

            if (response.ok) {
                localStorage.setItem('token', data.access_token)
                
                const userResponse = await fetch('http://localhost:8000/auth/me', {
                    headers: { 'Authorization': `Bearer ${data.access_token}` }
                })
                
                if (userResponse.ok) {
                    const userData = await userResponse.json()
                    setUser({ token: data.access_token, ...userData })
                } else {
                    setUser({ token: data.access_token })
                }
                
                navigate('/')
                return { success: true}
            }
            return { success: false, error: data.detail }
        } catch (error) {
            console.error('Signup error:', error)
            return { success: false, error: 'Network error. Please try again.' }
        }
    }

    const logout = () => {
        localStorage.removeItem('token')
        setUser(null)
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