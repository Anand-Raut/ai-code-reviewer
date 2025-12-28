import { Button } from '@/components/ui/button'


const AiReviewPanel = ({ approaches, onApproachSelect, feedback }) => {
	return (
		<div className="flex-1 overflow-y-auto p-4">
			{feedback && ( //FEEDBACK
				<div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
					{/* Feedback Section */}
					<div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700/50">
						<div className="flex items-center gap-2 mb-3 text-emerald-400">
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							<h3 className="font-semibold text-sm uppercase tracking-wider">Analysis</h3>
						</div>
						<p className="text-neutral-300 text-sm leading-relaxed">
							{feedback.feedback_text}
						</p>
					</div>

					{/* Drawbacks Section */}
					<div className="space-y-3">
						<div className="flex items-center gap-2 text-amber-400/80 px-1">
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
							</svg>
							<h3 className="font-semibold text-sm uppercase tracking-wider">Optimization Points</h3>
						</div>

						<div className="space-y-2">
							{feedback.drawbacks.map((drawback, index) => (
								<div
									key={index}
									className="flex items-start gap-3 p-3 rounded-md bg-neutral-800/30 border border-neutral-800/50"
								>
									<span className="text-amber-500/50 mt-1.5 text-[10px]">●</span>
									<p className="text-neutral-300 text-sm leading-relaxed">
										{drawback.drawback_text}
									</p>
								</div>
							))}
						</div>
					</div>
				</div>
			)}
			{(approaches) && ( //APPROACHES
				<div className="space-y-4">
					<div className="flex items-center gap-2 text-neutral-400 text-sm font-medium">
						Select your approach
					</div>
					{approaches.approaches.map((approach, index) => (
						<Button
							key={index}
							variant="outline"
							className="w-full text-left h-auto py-4 px-4 bg-neutral-800 border-neutral-700 hover:bg-neutral-700 hover:border-neutral-600 whitespace-normal"
							onClick={() => onApproachSelect(approach)}
						>
							<div className="w-full">
								<h3 className="text-neutral-100 font-semibold mb-2">{approach.title}</h3>
								<p className="text-neutral-400 text-sm font-normal">{approach.description}</p>
							</div>
						</Button>
					))}
				</div>
			)}
			{(!feedback && !approaches) && ( //DEFAULT TEXT
				<div className="flex flex-col items-center justify-center h-full text-center text-neutral-500">
					<svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
					</svg>
					<p className="text-sm">Write your code and click</p>
					<p className="text-sm font-semibold text-neutral-100 mt-1">"Submit"</p>
					<p className="text-xs mt-2">to get AI-powered feedback</p>
				</div>
			)}
		</div>

	)
}

export default AiReviewPanel
