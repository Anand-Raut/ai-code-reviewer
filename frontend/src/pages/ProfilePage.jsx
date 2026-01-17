import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

export default function ProfilePage() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [isEditingName, setIsEditingName] = useState(false)
    const [isChangingPassword, setIsChangingPassword] = useState(false)
    const [newName, setNewName] = useState(user?.name || '')
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    })
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const handleNameUpdate = async () => {
        if (!newName.trim()) {
            setError('Name cannot be empty')
            return
        }

        setLoading(true)
        setError('')
        setMessage('')

        try {
            const token = localStorage.getItem('token')
            const response = await fetch('http://localhost:8000/auth/change-name', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ new_name: newName })
            })

            if (response.ok) {
                setMessage('Name updated successfully!')
                setIsEditingName(false)
                // Update user context if needed
                window.location.reload() // Simple refresh - you might want to update context instead
            } else {
                const data = await response.json()
                setError(data.detail || 'Failed to update name')
            }
        } catch (err) {
            setError('Network error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handlePasswordChange = async () => {
        if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            setError('All password fields are required')
            return
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('New passwords do not match')
            return
        }

        if (passwordData.newPassword.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        setLoading(true)
        setError('')
        setMessage('')

        try {
            const token = localStorage.getItem('token')
            const response = await fetch('http://localhost:8000/auth/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    old_password: passwordData.oldPassword,
                    new_password: passwordData.newPassword
                })
            })

            if (response.ok) {
                setMessage('Password updated successfully!')
                setIsChangingPassword(false)
                setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' })
            } else {
                const data = await response.json()
                setError(data.detail || 'Failed to update password')
            }
        } catch (err) {
            setError('Network error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400 mx-auto mb-4"></div>
                    <p className="text-neutral-400">Loading profile...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-neutral-950 relative">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-size-[14px_24px] z-0"></div>

            <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-neutral-100 mb-2">Account Settings</h1>
                        <p className="text-neutral-400">Manage your profile and account preferences</p>
                    </div>
                    <Button
                        onClick={() => navigate('/')}
                        variant="outline"
                        className="bg-neutral-800 border-neutral-700 text-neutral-100 hover:bg-neutral-700 gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Editor
                    </Button>
                </div>

                {/* Success/Error Messages */}
                {message && (
                    <div className="mb-6 p-4 rounded-lg bg-emerald-900/20 border border-emerald-800/30 text-emerald-400">
                        {message}
                    </div>
                )}
                {error && (
                    <div className="mb-6 p-4 rounded-lg bg-red-900/20 border border-red-800/30 text-red-400">
                        {error}
                    </div>
                )}

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Profile Information */}
                    <Card className="bg-neutral-900 border-neutral-800">
                        <CardHeader>
                            <CardTitle className="text-neutral-100 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Profile Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Avatar */}
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-linear-to-br from-emerald-400 to-cyan-400 flex items-center justify-center">
                                    <span className="text-2xl font-bold text-neutral-900">
                                        {user.name?.charAt(0).toUpperCase() || 'U'}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-neutral-100">{user.name}</h3>
                                    <p className="text-neutral-400 text-sm">{user.email}</p>
                                </div>
                            </div>

                            <Separator className="bg-neutral-800" />

                            {/* Name Field */}
                            <div className="space-y-2">
                                <Label className="text-neutral-300">Display Name</Label>
                                {isEditingName ? (
                                    <div className="flex gap-2">
                                        <Input
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            className="bg-neutral-800 border-neutral-700 text-neutral-100"
                                            placeholder="Enter your name"
                                        />
                                        <Button
                                            onClick={handleNameUpdate}
                                            disabled={loading}
                                            size="sm"
                                            className="bg-emerald-600 hover:bg-emerald-700"
                                        >
                                            Save
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                setIsEditingName(false)
                                                setNewName(user.name || '')
                                                setError('')
                                            }}
                                            variant="outline"
                                            size="sm"
                                            className="border-neutral-700 text-neutral-400"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg">
                                        <span className="text-neutral-100">{user.name}</span>
                                        <Button
                                            onClick={() => setIsEditingName(true)}
                                            variant="ghost"
                                            size="sm"
                                            className="text-neutral-400 hover:text-neutral-100"
                                        >
                                            Edit
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Email Field */}
                            <div className="space-y-2">
                                <Label className="text-neutral-300">Email Address</Label>
                                <div className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg">
                                    <span className="text-neutral-100">{user.email}</span>
                                    <span className="text-xs text-neutral-500">Cannot be changed</span>
                                </div>
                            </div>

                            {/* User ID */}
                            <div className="space-y-2">
                                <Label className="text-neutral-300">User ID</Label>
                                <div className="p-3 bg-neutral-800/50 rounded-lg">
                                    <code className="text-neutral-400 text-sm font-mono">{user.id}</code>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Security Settings */}
                    <Card className="bg-neutral-900 border-neutral-800">
                        <CardHeader>
                            <CardTitle className="text-neutral-100 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Security Settings
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Change Password */}
                            <div className="space-y-3">
                                <Label className="text-neutral-300">Password</Label>
                                {isChangingPassword ? (
                                    <div className="space-y-3">
                                        <Input
                                            type="password"
                                            placeholder="Current password"
                                            value={passwordData.oldPassword}
                                            onChange={(e) => setPasswordData(prev => ({ ...prev, oldPassword: e.target.value }))}
                                            className="bg-neutral-800 border-neutral-700 text-neutral-100"
                                        />
                                        <Input
                                            type="password"
                                            placeholder="New password"
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                            className="bg-neutral-800 border-neutral-700 text-neutral-100"
                                        />
                                        <Input
                                            type="password"
                                            placeholder="Confirm new password"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                            className="bg-neutral-800 border-neutral-700 text-neutral-100"
                                        />
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={handlePasswordChange}
                                                disabled={loading}
                                                className="bg-emerald-600 hover:bg-emerald-700"
                                            >
                                                Update Password
                                            </Button>
                                            <Button
                                                onClick={() => {
                                                    setIsChangingPassword(false)
                                                    setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' })
                                                    setError('')
                                                }}
                                                variant="outline"
                                                className="border-neutral-700 text-neutral-400"
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg">
                                        <span className="text-neutral-400">••••••••</span>
                                        <Button
                                            onClick={() => setIsChangingPassword(true)}
                                            variant="ghost"
                                            size="sm"
                                            className="text-neutral-400 hover:text-neutral-100"
                                        >
                                            Change
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <Separator className="bg-neutral-800" />

                            {/* Account Actions */}
                            <div className="space-y-3">
                                <Label className="text-neutral-300">Account Actions</Label>
                                <Button
                                    onClick={handleLogout}
                                    variant="destructive"
                                    className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Sign Out
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}