import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'
import TextEditor from '@/components/TextEditor'
import Sidebar from '@/components/Sidebar'

export default function EditorPage() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    
    const [code, setCode] = useState('')
    const [language, setLanguage] = useState('python')
    const [question, setQuestion] = useState('')
    const [review, setReview] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const handleReview = async () => {
        if (!code.trim()) {
            setError('Please enter some code to review')
            return
        }
        
        setLoading(true)
        setError(null)
        
        try {
            const token = localStorage.getItem('token')
            const response = await fetch('http://localhost:8000/api/review', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    code, 
                    language,
                    question  // ✅ Send question to backend
                })
            })
            
            if (response.ok) {
                const data = await response.json()
                setReview(data)
            } else if (response.status === 401) {
                setError('Session expired. Please login again.')
                setTimeout(() => logout(), 2000)
            } else {
                setError('Failed to review code. Please try again.')
            }
        } catch (err) {
            setError('Network error. Please check your connection.')
            console.error('Review error:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleClear = () => {
        setCode('')
        setQuestion('')
        setReview(null)
        setError(null)
    }

    const handleLogout = () => {
        logout()
        navigate('/auth')
    }

    return (
        <div className="min-h-screen bg-[#0d1117] flex">
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Top Header Bar */}
                <header className="bg-[#161b22] border-b border-[#30363d] px-6 py-3 sticky top-0 z-30">
                    <div className="flex items-center justify-between">
                        <button 
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden p-2 hover:bg-[#21262d] rounded-md transition"
                        >
                            <svg className="w-5 h-5 text-[#8b949e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <h1 className="text-[#c9d1d9] text-lg font-semibold">AI powered Code Review</h1>
                        <div className="w-9"></div>
                    </div>
                </header>

            <main className="flex-1 flex overflow-hidden gap-4 p-4">
                {/* Left: Code Editor */}
                <div className="flex-1 flex flex-col">
                    {error && (
                        <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-red-300 text-sm">{error}</p>
                                </div>
                                <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="flex-1">
                        <TextEditor
                            code={code}
                            language={language}
                            question={question}
                            loading={loading}
                            onCodeChange={setCode}
                            onLanguageChange={setLanguage}
                            onQuestionChange={setQuestion}
                                onReview={handleReview}
                            onClear={handleClear}
                        />
                    </div>
                </div>

                {/* Right: AI Review Panel */}
                <div className="w-96 flex flex-col">
                    <div className="flex-1 bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-[#30363d]">
                            <h2 className="text-lg font-semibold text-[#c9d1d9] flex items-center gap-2">
                                <svg className="w-5 h-5 text-[#58a6ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                                AI Code Review
                            </h2>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4">
                            {review ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-green-500 text-sm font-medium">
                                        <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        Analysis Complete
                                    </div>
                                    <div className="bg-[#0d1117] rounded-lg p-4">
                                        <pre className="whitespace-pre-wrap text-sm text-[#c9d1d9] font-mono leading-relaxed">
                                            {review.analysis || review.message}
                                        </pre>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center text-[#8b949e]">
                                    <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                    <p className="text-sm">Write your code and click</p>
                                    <p className="text-sm font-semibold text-[#c9d1d9] mt-1">"Review"</p>
                                    <p className="text-xs mt-2">to get AI-powered feedback</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            </div>
        </div>
    )
}