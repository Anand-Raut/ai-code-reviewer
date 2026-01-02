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
        <div className="space-y-2">
          {attempts.map((attempt, index) => (
            <div key={index}>  {/* Add this wrapper */}
              <Button
                onClick={() => toggleExpand(attempt.id)}
                className="group w-full p-3 rounded-lg bg-neutral-800/50 border border-neutral-700/50 hover:bg-neutral-700/50 hover:border-neutral-600 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-medium text-neutral-100 text-sm flex-1">
                    {attempt.selected_approach.title}
                  </h3>
                  <span className="text-neutral-500 text-xs whitespace-nowrap">
                    {new Date(attempt.created_at).toLocaleDateString()}
                  </span>
                </div>
              </Button>

              {expandedId === attempt.id && (
                <div className="p-3 rounded-lg bg-neutral-900/50 border border-neutral-700/30 text-neutral-100">
                  <SyntaxHighlighter
                    language='python'
                    style={vs2015}
                    customStyle={{
                      margin: 0,
                      padding: '1rem',
                      borderRadius: '0.5rem',
                      maxHeight: '300px',
                      overflowX: 'hidden',
                      fontSize: '0.75rem',
                    }}>
                    {attempt.code}
                  </SyntaxHighlighter>
                  <p>Time Complexity: {attempt.time_complexity}</p>
                  <p>Space Complexity: {attempt.space_complexity}</p>

                  <Button className='border border-neutral-50' onClick = {()=> {changeCode(attempt.id)}}>copy to editor</Button>
                  <p onClick={() => fetchReview()}>Click here to fetch the review</p>
                </div>
              )}
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