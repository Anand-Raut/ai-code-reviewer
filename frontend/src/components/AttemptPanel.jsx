import { useState } from 'react'
import { Button } from "@/components/ui/button"
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';


const AttemptPanel = ({ attempts, changeCode, fetchReview }) => {
  const [expandedId, setExpandedId] = useState(null)

  const toggleExpand = (attemptId) => {
    setExpandedId(expandedId === attemptId ? null : attemptId)
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {attempts && attempts.length > 0 ? (
        <div className="space-y-3">
          {attempts.map((attempt, index) => (
            <div key={attempt.id} className="transition-all duration-200">
              <button
                onClick={() => toggleExpand(attempt.id)}
                className="group w-full p-4 rounded-lg bg-neutral-800/60 border border-neutral-700/50 hover:bg-neutral-700/60 hover:border-neutral-600 transition-all cursor-pointer text-left"
              >
                <div className="flex flex-col gap-2.5 w-full">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-neutral-100 text-sm flex-1 leading-relaxed">
                      {typeof attempt.selected_approach === 'string' 
                        ? attempt.selected_approach 
                        : attempt.selected_approach?.title || 'Unknown Approach'}
                    </h3>
                    <span className="text-neutral-400 text-xs whitespace-nowrap mt-0.5">
                      {new Date(attempt.created_at).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-neutral-900/50 border border-neutral-700/30">
                      <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                      <span className="text-neutral-300 font-medium">{attempt.language || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-neutral-900/50 border border-neutral-700/30">
                      <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span className="text-neutral-300 font-medium">{attempt.parameters || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </button>

              {expandedId === attempt.id && (
                <div className="mt-2 p-4 rounded-lg bg-neutral-900/70 border border-neutral-700/40 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="mb-3">
                    <SyntaxHighlighter
                      language={attempt.language?.toLowerCase() || 'python'}
                      style={vs2015}
                      customStyle={{
                        margin: 0,
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        maxHeight: '320px',
                        overflowY: 'auto',
                        overflowX: 'auto',
                        fontSize: '0.875rem',
                        backgroundColor: '#1a1a1a',
                        border: '1px solid rgba(64, 64, 64, 0.3)',
                      }}
                      showLineNumbers={true}
                    >
                      {attempt.code}
                    </SyntaxHighlighter>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={() => changeCode(attempt.id)}
                      className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 border border-neutral-600 hover:border-neutral-500 transition-all shadow-sm"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy to Editor
                    </Button>
                    <Button 
                      onClick={() => fetchReview(attempt.id)}
                      className="flex-1 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Review
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-center text-neutral-500 py-12">
          <div className="p-4 rounded-full bg-neutral-800/30 mb-4">
            <svg className="w-12 h-12 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-neutral-400">No previous attempts</p>
          <p className="text-xs text-neutral-600 mt-1">Your submission history will appear here</p>
        </div>
      )}
    </div>
  )
}

export default AttemptPanel