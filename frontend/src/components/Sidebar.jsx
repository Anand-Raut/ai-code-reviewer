import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Sidebar({ isOpen, questions, onToggle, changeQuestion, setCode, setQuestion }) {
	const { user, email, logout } = useAuth()
	const navigate = useNavigate()

	const handleLogout = () => {
		logout()
		navigate('/auth')
	}

	return (
		<>
			{isOpen && (
				<div
					className="fixed inset-0 bg-black/50 z-40 lg:hidden"
					onClick={onToggle}
				/>
			)}

			<aside className={`
                fixed lg:sticky top-0 left-0 h-screen z-50 
                bg-neutral-900 border-r border-neutral-800
                transition-all duration-300 ease-in-out
                ${isOpen ? 'w-1/3' : 'w-0 -translate-x-full lg:translate-x-0 lg:w-16'}
                flex flex-col justify-between 
                overflow-hidden
            `}>
				<div className="p-4 border-b border-neutral-800 flex items-center justify-between">
					<button
						onClick={onToggle}
						className="p-2 hover:bg-neutral-800 rounded-md transition"
						title={isOpen ? 'Close sidebar' : 'Open sidebar'}
					>
						<svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							{isOpen ? (
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
							) : (
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
							)}
						</svg>
					</button>
					{isOpen && (
						<>
							<h2 className="text-sm font-semibold text-neutral-100">Menu</h2>
							<div className="w-9"></div>
						</>
					)}
				</div>

				{isOpen && (
					<nav className="flex-1 p-3 space-y-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
						<button 
							className="w-full flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-neutral-800 text-neutral-100 text-sm transition"
							onClick={()=> {setCode("");setQuestion(""); onToggle()}}
						>
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
							</svg>
							<span>New Question</span>
						</button>

						<div className="pt-4">
							<div className="text-xs text-neutral-500 px-3 py-2">Previous attempted questions</div>

							<div className="space-y-1 mt-2">
								{questions.map((question, index) => (
									<button
										key={question.id}
										className="w-full text-left px-3 py-2 rounded-md bg-neutral-800 hover:bg-neutral-700 text-sm text-neutral-100 transition"
										onClick={() => {changeQuestion(question.id); onToggle()}}
									>
										{question.question_text}
									</button>
								))}
							</div>
						</div>
					</nav>
				)}

				{/* User Section at Bottom */}
				{isOpen ? (
					<div className="p-3 border-t border-neutral-800" onClick={() => navigate('/profile')}>
						<div className="flex items-center space-x-3 p-3 rounded-md bg-neutral-800">
							<div className="w-9 h-9 rounded-full bg-neutral-700 flex items-center justify-center">
								<svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
								</svg>
							</div>
							<div className="flex-1 min-w-0">
								<div className="text-sm font-medium text-neutral-100 truncate">{user?.name || user?.username || 'User'}</div>
								<div className="text-xs text-neutral-400 truncate">{user?.email || 'No email'}</div>
							</div>
						</div>

						<button
							onClick={handleLogout}
							className="w-full mt-2 flex items-center justify-center space-x-2 px-3 py-2 rounded-md hover:bg-neutral-800 text-red-400 text-sm transition"
						>
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
							</svg>
							<span>Logout</span>
						</button>
					</div>
				) : (
					/* Collapsed user avatar */
					<div className="p-3 border-t border-neutral-800 flex justify-center">
						<button
							onClick={onToggle}
							className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-neutral-700 transition"
							title="Open menu"
						>
							<svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
							</svg>
						</button>
					</div>
				)}
			</aside>
		</>
	)
}