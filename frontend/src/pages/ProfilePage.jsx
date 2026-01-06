import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function ProfilePage() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
                <p className="text-neutral-400">Loading...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-neutral-950 relative">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-size-[14px_24px] z-0"></div>

            <div className="relative z-10 container mx-auto px-4 py-12">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-neutral-100 mb-2">Profile</h1>
                        <p className="text-neutral-400">Manage your account settings</p>
                    </div>
                    <Button
                        onClick={() => navigate('/editor')}
                        variant="outline"
                        className="bg-neutral-800 border-neutral-700 text-neutral-100 hover:bg-neutral-700"
                    >
                        Back to Editor
                    </Button>
                </div>

                {/* Profile Card */}
                <Card className="bg-neutral-900 border-neutral-800 p-8 max-w-2xl">
                    <div className="space-y-6">
                        {/* Avatar Section */}
                        <div className="flex items-center gap-6 pb-6 border-b border-neutral-800">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center">
                                <span className="text-3xl font-bold text-neutral-900">
                                    {user.name?.charAt(0).toUpperCase() || 'U'}
                                </span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-semibold text-neutral-100">{user.name}</h2>
                                <p className="text-neutral-400">{user.email}</p>
                            </div>
                        </div>

                        {/* Account Details */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-neutral-100">Account Details</h3>
                            
                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-3 px-4 bg-neutral-800/50 rounded-lg">
                                    <span className="text-neutral-400">Name</span>
                                    <span className="text-neutral-100 font-medium">{user.name}</span>
                                </div>
                                
                                <div className="flex justify-between items-center py-3 px-4 bg-neutral-800/50 rounded-lg">
                                    <span className="text-neutral-400">Email</span>
                                    <span className="text-neutral-100 font-medium">{user.email}</span>
                                </div>
                                
                                <div className="flex justify-between items-center py-3 px-4 bg-neutral-800/50 rounded-lg">
                                    <span className="text-neutral-400">User ID</span>
                                    <span className="text-neutral-100 font-mono text-sm">{user.id}</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-6 border-t border-neutral-800">
                            <Button
                                onClick={handleLogout}
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold"
                            >
                                Sign Out
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}