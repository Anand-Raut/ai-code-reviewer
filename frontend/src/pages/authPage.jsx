import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Code2, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function AuthPage() {
    const navigate = useNavigate()
    const { login, signup, user } = useAuth()
    const [loginData, setLoginData] = useState({email: "", password: ""})
    const [signupData, setSignupData] = useState({name: "", email: "", password: ""})
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        if (user) {
            navigate('/')
        }
    }, [user, navigate])

    const handleLogin = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")
        
        const result = await login(loginData.email, loginData.password)
        
        if (!result.success) {
            setError(result.error || "Login failed")
        }
        setIsLoading(false)
    }
    
    const handleSignup = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")
        
        const result = await signup(signupData.name, signupData.email, signupData.password)
        
        if (!result.success) {
            setError(result.error || "Signup failed")
        }
        setIsLoading(false)
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-neutral-950">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-size-[14px_24px]"></div>
            
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neutral-800 rounded-full mix-blend-normal filter blur-3xl opacity-20"></div>

            <Card className="w-full max-w-md mx-4 bg-neutral-900 border-neutral-800 relative z-10 shadow-2xl">
                <CardHeader className="space-y-3 pb-6">
                    <div className="flex items-center justify-center mb-2">
                        <div className="bg-neutral-800 p-3 rounded-xl border border-neutral-700">
                            <Code2 className="w-8 h-8 text-neutral-100" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-center text-neutral-100">
                        AI Code Reviewer
                    </CardTitle>
                    <CardDescription className="text-center text-neutral-400">
                        Get instant AI-powered code reviews
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="login" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6 bg-neutral-800 border border-neutral-700">
                            <TabsTrigger 
                                value="login" 
                                className="data-[state=active]:bg-neutral-700 data-[state=active]:text-neutral-100 text-neutral-400"
                            >
                                Login
                            </TabsTrigger>
                            <TabsTrigger 
                                value="signup" 
                                className="data-[state=active]:bg-neutral-700 data-[state=active]:text-neutral-100 text-neutral-400"
                            >
                                Sign Up
                            </TabsTrigger>
                        </TabsList>

                        {error && (
                            <div className="mb-4 p-3 bg-red-950 border border-red-900 text-red-400 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <TabsContent value="login">
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="login-email" className="text-neutral-200">Email</Label>
                                    <Input 
                                        id="login-email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={loginData.email}
                                        onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                                        className="bg-neutral-800 border-neutral-700 text-neutral-100 placeholder:text-neutral-500 focus:border-neutral-600 focus:ring-neutral-600"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="login-password" className="text-neutral-200">Password</Label>
                                    <Input
                                        id="login-password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={loginData.password}
                                        onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                                        className="bg-neutral-800 border-neutral-700 text-neutral-100 placeholder:text-neutral-500 focus:border-neutral-600 focus:ring-neutral-600"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                <Button 
                                    type="submit" 
                                    className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-semibold py-2 shadow-lg transition-all duration-200"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Logging in...
                                        </>
                                    ) : (
                                        "Login"
                                    )}
                                </Button>
                            </form>
                        </TabsContent>
                        
                        <TabsContent value="signup">
                            <form onSubmit={handleSignup} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="signup-name" className="text-neutral-200">Full Name</Label>
                                    <Input
                                        id="signup-name"
                                        type="text"
                                        placeholder="John Doe"
                                        value={signupData.name}
                                        onChange={(e) => setSignupData({...signupData, name: e.target.value})}
                                        className="bg-neutral-800 border-neutral-700 text-neutral-100 placeholder:text-neutral-500 focus:border-neutral-600 focus:ring-neutral-600"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="signup-email" className="text-neutral-200">Email</Label>
                                    <Input
                                        id="signup-email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={signupData.email}
                                        onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                                        className="bg-neutral-800 border-neutral-700 text-neutral-100 placeholder:text-neutral-500 focus:border-neutral-600 focus:ring-neutral-600"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="signup-password" className="text-neutral-200">Password</Label>
                                    <Input
                                        id="signup-password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={signupData.password}
                                        onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                                        className="bg-neutral-800 border-neutral-700 text-neutral-100 placeholder:text-neutral-500 focus:border-neutral-600 focus:ring-neutral-600"
                                        required
                                        disabled={isLoading}
                                    />
                                    <p className="text-xs text-neutral-500">Must be at least 8 characters</p>
                                </div>
                                <Button 
                                    type="submit" 
                                    className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-semibold py-2 shadow-lg transition-all duration-200"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating account...
                                        </>
                                    ) : (
                                        "Create Account"
                                    )}
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    )
}

export default AuthPage