const AttemptPanel = ({ attempts }) => {
    return (
        <div className="flex-1 overflow-y-auto p-4">
            {attempts && attempts.length > 0 ? (
                <div className="space-y-2">
                    {attempts.map((attempt, index) => (
                        <div
                            key={index}
                            className="group p-3 rounded-lg bg-neutral-800/50 border border-neutral-700/50 hover:bg-neutral-700/50 hover:border-neutral-600 transition-all cursor-pointer"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <h3 className="font-medium text-neutral-100 text-sm flex-1">
                                    {attempt.selected_approach.title}
                                </h3>
                                <span className="text-neutral-500 text-xs whitespace-nowrap">
                                    {new Date(attempt.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-neutral-500">
                    <svg className="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm">No previous attempts</p>
                </div>
            )}
        </div>
    )
}

export default AttemptPanel