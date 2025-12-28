import { useEffect, useEffectEvent, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import TextEditor from '@/components/TextEditor'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import AiReviewPanel from '@/components/AiReviewPanel'
import { Button } from '@/components/ui/button'
import Error from '@/components/ui/Error'
import AttemptPanel from '@/components/AttemptPanel'

export default function EditorPage() {
	const { user, logout } = useAuth()
	const [stats, setStats] = useState({})
	const [code, setCode] = useState('')
	const [language, setLanguage] = useState('python')
	const [question, setQuestion] = useState('')
	const [feedback, setFeedback] = useState(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(null)
	const [sidebarOpen, setSidebarOpen] = useState(false)
	const [parameters, setParameter] = useState('Space & Time Complexity')
	const [approaches, setApproaches] = useState(null)
	const [questions, setQuestions] = useState([])
	const [attempts, setAttempts] = useState([])
	const [reviewSection, setReviewSection] = useState(true)

	const handleClear = () => {
		setCode('')
		setQuestion('')
		setFeedback(null)
		setError(null)
		setApproaches(null)
	}
	useEffect(() => {
		const fetchQuestions = async () => {
			try {
				const token = localStorage.getItem('token')
				const response = await fetch('http://localhost:8000/api/questions', {
					method: "GET",
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${token}`
					}
				})
				if (response.ok) {
					const data = await response.json()
					console.log(data.questions)
					setQuestions(data.questions)
				} else if (response.status === 401) {
					setError('Session expired. Please login again.')
					setTimeout(() => logout(), 2000)
				} else {
					setError('Failed to fetch questions.')
				}
			} catch (err) {
				setError('Network error. Please check your connection.')
				console.error('Fetch error:', err)
			}
		}
		fetchQuestions()
	}, [])

	const changeQuestion = async (questionId) => {
		const q = questions.find(q => q.id === questionId)
		if (!q) return
		setLoading(true)
		const token = localStorage.getItem('token')

		try {
			const response = await fetch(`http://localhost:8000/api/attempts/${questionId}`, {
				method: "GET",
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				}
			})
			if (response.ok) {
				const data = await response.json()
				console.log(data.attempts)
				setAttempts(data.attempts)
				setCode(data.attempts[0].code)
				setQuestion(q.question_text)
			} else if (response.status === 401) {
				setError('Session expired. Please login again.')
				setTimeout(() => logout(), 2000)
			} else {
				setError('Failed to fetch questions.')
			}
		} catch (error) {
			setError('Network error. Please check your connection.')
			console.error('Fetch error:', error)
		} finally {
			setLoading(false)
		}
		// console.log(attempts)
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
				setFeedback(null)
				setApproaches(data)

				// console.log(data)
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
				setFeedback(data)

			} else if (response.status === 401) {
				setError('Session expired. Please login again.')
			} else {
				setError('Failed to review code. Please try again.')
			}

		} catch (err) {
			setError('Network error. Please check your connection.')
			console.log('Review error: ', err)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="min-h-screen bg-neutral-950 flex relative">

			{/* Sidebar */}
			<Sidebar
				questions={questions}
				isOpen={sidebarOpen}
				onToggle={() => setSidebarOpen(!sidebarOpen)}
				changeQuestion={changeQuestion}
				setCode={setCode}
				setQuestion={setQuestion}
			/>

			{/* Main Content */}
			<div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">

				<main className="flex-1 flex overflow-hidden gap-4 p-4">

					{/* Left: Code Editor */}
					<div className="w-2/3 flex-1 flex flex-col">
						{error && (
							<Error error={error} onClose={() => setError(null)} />
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
					<div className="w-1/3 flex flex-col">
						<div className="flex-1 rounded-md bg-neutral-900 border-l border-neutral-800 overflow-hidden flex flex-col">
							<div className="p-4 border-b border-neutral-800">
								<div className="flex items-center justify-between mb-2">
									<h2 className="text-lg font-semibold text-neutral-100 flex items-center gap-2">
										<svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
										</svg>
										AI Code Review
									</h2>
								</div>
								{/* Tab Buttons */}
								<div className="flex gap-2">
									<button
										onClick={() => setReviewSection(true)}
										className={`flex-1 px-3 py-2 text-sm rounded-md transition ${reviewSection
											? 'bg-neutral-800 text-neutral-100 border border-neutral-700'
											: 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/50'
											}`}
									>
										AI Review
									</button>
									<button
										onClick={() => setReviewSection(false)}
										className={`flex-1 px-3 py-2 text-sm rounded-md transition ${!reviewSection
											? 'bg-neutral-800 text-neutral-100 border border-neutral-700'
											: 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/50'
											}`}
									>
										Previous Attempts
									</button>
								</div>
							</div>

							{/* Content Area */}
							{reviewSection ? (
								<AiReviewPanel
									approaches={approaches}
									loading={loading}
									onApproachSelect={handleApproachSelect}
									feedback={feedback}
								/>
							) : (
								<AttemptPanel attempts={attempts} />
							)}
						</div>
					</div>

				</main>
			</div>
			<div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-size-[14px_24px] z-0"></div>
		</div>
	)
}