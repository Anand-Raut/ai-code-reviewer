import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'

export default function LandingPage() {
	const navigate = useNavigate()
	const { user } = useAuth()

	return (
		<div className="min-h-screen bg-neutral-950 relative overflow-hidden">
			{/* Background Grid */}
			<div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]"></div>

			{/* Hero Section */}
			<div className="relative z-10">
				{/* Navigation */}
				<nav className="container mx-auto px-6 py-6 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<svg className="w-8 h-8 text-neutral-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
						</svg>
						<span className="text-2xl font-bold text-neutral-100">CodeReview AI</span>
					</div>

					<div className="flex items-center gap-4">
						{user ? (
							<Button
								onClick={() => navigate('/editor')}
								className="bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-semibold"
							>
								Go to Editor
							</Button>
						) : (
							<>
								<Button
									onClick={() => navigate('/login')}
									variant="ghost"
									className="text-neutral-300 hover:text-neutral-100 hover:bg-neutral-800"
								>
									Log In
								</Button>
								<Button
									onClick={() => navigate('/signup')}
									className="bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-semibold"
								>
									Sign Up
								</Button>
							</>
						)}
					</div>
				</nav>

				{/* Hero Content */}
				<div className="container mx-auto px-6 py-20 text-center">
					<div className="max-w-4xl mx-auto space-y-8">
						<h1 className="text-6xl font-bold text-neutral-100 leading-tight">
							Master Coding with
						<span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">
							AI-Powered Feedback
						</span>
						</h1>

						<p className="text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed">
							Get instant, intelligent code reviews with incremental progress tracking. 
							Learn from your mistakes and watch yourself improve with every attempt.
						</p>

						<div className="flex gap-4 justify-center pt-4">
							<Button
								onClick={() => navigate(user ? '/editor' : '/auth')}
								size="lg"
								className="bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-semibold text-lg px-8 py-6"
							>
								{user ? 'Start Coding' : 'Get Started Free'}
							</Button>
							<Button
								onClick={() => {
									document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
								}}
								size="lg"
								variant="outline"
								className="border-neutral-700 text-neutral-100 hover:bg-neutral-800 text-lg px-8 py-6"
							>
								Learn More
							</Button>
						</div>
					</div>
				</div>
			</div>

			{/* Features Section */}
			<div id="features" className="relative z-10 py-20 bg-neutral-900/30">
				<div className="container mx-auto px-6">
					<h2 className="text-4xl font-bold text-neutral-100 text-center mb-16">
						Why Choose CodeReview AI?
					</h2>

					<div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
						{/* Feature 1 */}
						<div className="bg-neutral-900/50 backdrop-blur rounded-lg border border-neutral-800 p-6 hover:border-neutral-700 transition">
							<div className="w-12 h-12 rounded-lg bg-emerald-900/20 border border-emerald-800/30 flex items-center justify-center mb-4">
								<svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</div>
							<h3 className="text-xl font-semibold text-neutral-100 mb-2">Incremental Progress Tracking</h3>
							<p className="text-neutral-400">
								See what you've fixed and what needs work. Our AI tracks resolved issues vs. existing ones across all your attempts.
							</p>
						</div>

						{/* Feature 2 */}
						<div className="bg-neutral-900/50 backdrop-blur rounded-lg border border-neutral-800 p-6 hover:border-neutral-700 transition">
							<div className="w-12 h-12 rounded-lg bg-blue-900/20 border border-blue-800/30 flex items-center justify-center mb-4">
								<svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
								</svg>
							</div>
							<h3 className="text-xl font-semibold text-neutral-100 mb-2">Smart Approach Detection</h3>
							<p className="text-neutral-400">
								AI analyzes your code structure and identifies your problem-solving approach before giving targeted feedback.
							</p>
						</div>

						{/* Feature 3 */}
						<div className="bg-neutral-900/50 backdrop-blur rounded-lg border border-neutral-800 p-6 hover:border-neutral-700 transition">
							<div className="w-12 h-12 rounded-lg bg-purple-900/20 border border-purple-800/30 flex items-center justify-center mb-4">
								<svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
								</svg>
							</div>
							<h3 className="text-xl font-semibold text-neutral-100 mb-2">Detailed Analytics</h3>
							<p className="text-neutral-400">
								Track editing patterns, time spent per line, and struggle points to understand your coding behavior.
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* CTA Section */}
			<div className="relative z-10 py-20">
				<div className="container mx-auto px-6 text-center">
					<div className="max-w-3xl mx-auto bg-gradient-to-r from-emerald-900/20 to-blue-900/20 border border-neutral-800 rounded-lg p-12">
						<h2 className="text-4xl font-bold text-neutral-100 mb-4">
							Ready to Level Up Your Coding Skills?
						</h2>
						<p className="text-xl text-neutral-400 mb-8">
							Join thousands of developers improving their code quality with AI-powered feedback.
						</p>
						<Button
							onClick={() => navigate(user ? '/editor' : '/signup')}
							size="lg"
							className="bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-semibold text-lg px-8 py-6"
						>
							{user ? 'Go to Editor' : 'Start Free Today'}
						</Button>
					</div>
				</div>
			</div>

			{/* Footer */}
			{/* <footer className="relative z-10 border-t border-neutral-800 py-8">
				<div className="container mx-auto px-6">
					<div className="flex flex-col md:flex-row justify-between items-center gap-4">
						<div className="flex items-center gap-2">
							<svg className="w-6 h-6 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
							</svg>
							<span className="text-neutral-400">© 2026 CodeReview AI</span>
						</div>
						<div className="flex gap-6">
							<a href="#" className="text-neutral-400 hover:text-neutral-100 transition">About</a>
							<a href="#" className="text-neutral-400 hover:text-neutral-100 transition">Privacy</a>
							<a href="#" className="text-neutral-400 hover:text-neutral-100 transition">Terms</a>
							<a href="#" className="text-neutral-400 hover:text-neutral-100 transition">Contact</a>
						</div>
					</div>
				</div>
			</footer> */}
		</div>
	)
}
