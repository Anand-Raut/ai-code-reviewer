import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'
import TextEditor from '@/components/TextEditor'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import AiReviewPanel from '@/components/AiReviewPanel'
import { Button } from '@/components/ui/button'

export default function EditorPage() {
    const { user, logout } = useAuth()
    // const navigate = useNavigate()
    const [stats, setStats] = useState({})
    const [code, setCode] = useState('')
    const [language, setLanguage] = useState('python')
    const [question, setQuestion] = useState('')
    const [review, setReview] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [parameters, setParameter] = useState('Space & Time Complexity')
    const [approaches, setApproaches] = useState(null)

    const handleClear = () => {
        setCode('')
        setQuestion('')
        setReview(null)
        setError(null)
        setApproaches(null)
    }

    const handleSubmit = async () => {
        console.log({ code, language, question, stats, parameters })
        if (!code.trim()) {
            setError('Please enter some code to review')
            return
        }
        if (!question.trim()) {
            setError('Please enter a question')
            return
        }

        setLoading(true)
        setError(null)

        try {
            const token = localStorage.getItem('token')
            const response = await fetch('http://localhost:8000/api/getapproaches', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    code,
                    language,
                    question,
                    parameters,
                })
            })

            if (response.ok) {
                const data = await response.json()
                setApproaches(data)
                console.log(data)
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

    const handleApproachSelect = async (approach) => {
        console.log({ code, language, question, stats, parameters }, "tmmffkdk")
        if (!code.trim()) {
            setError('Please enter some code to review')
            return
        }
        if (!question.trim()) {
            setError('Please enter a question')
            return
        }

        setLoading(true)
        setError(null)

        try {
            const token = localStorage.getItem('token')
            const response = await fetch('http://localhost:8000/api/approachselect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    code,
                    language,
                    question,
                    approach,
                    parameters,
                    stats
                })
            })

            if (response.ok) {
                const data = await response.json()
                setApproaches(null)
                setReview(data)

            }else if (response.status === 401) {
                setError('Session expired. Please login again.')
            } else {
                setError('Failed to review code. Please try again.')
            }

        }catch (err) {
            setError('Network error. Please check your connection.')
            console.log('Review error: ', err)
        }finally{
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-neutral-950 flex relative">

            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">

                <main className="flex-1 flex overflow-hidden gap-4 p-4">

                    {/* Left: Code Editor */}
                    <div className="w-2/3 flex-1 flex flex-col">
                        {error && (
                            <div className="mb-4 p-3 bg-red-950 border border-red-900 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-red-400 text-sm">{error}</p>
                                    </div>
                                    <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}

                        <TopBar
                            language={language}
                            question={question}
                            onLanguageChange={setLanguage}
                            onQuestionChange={setQuestion}
                            parameters={parameters}
                            onParametersChange={setParameter}
                        />

                        <div className="flex-1 flex flex-col pb-4 overflow-hidden">
                            <TextEditor
                                code={code}
                                stats={stats}
                                onCodeChange={setCode}
                                onStatsChange={setStats}
                            />
                        </div>

                        <div className="px-2 py-2 flex justify-between items-center bg-neutral-900 rounded-b-md border-t border-neutral-800">
                            <div className="flex items-center gap-3">
                                <div className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-neutral-400">
                                    <span className="font-mono">{code.length} chars</span>
                                    <span className="mx-2">•</span>
                                    <span className="font-mono">{code.split('\n').length} lines</span>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleClear}
                                    className="bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-700 h-7"
                                >
                                    Clear
                                </Button>
                            </div>

                            <Button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-semibold shadow-lg transition-all duration-200"
                            >
                                {loading ? 'Reviewing...' : 'Submit'}
                            </Button>
                        </div>
                    </div>

                    {/* Right: AI Review Panel */}
                    <AiReviewPanel
                        approaches={approaches}
                        loading={loading}
                        onApproachSelect={handleApproachSelect}
                        review={review}
                    />
                </main>
            </div>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-size-[14px_24px] z-0"></div>
        </div>
    )
}