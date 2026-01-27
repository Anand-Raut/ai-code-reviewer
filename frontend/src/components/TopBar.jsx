import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python 3' },
  { value: 'java', label: 'Java' },
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
  { value: 'go', label: 'Go' },
]

const PARAMETERS = [
  'Space & Time Complexity',
  'Space Complexity',
  'Time Complexity'
]

export default function TopBar({ question, onQuestionChange, language, onLanguageChange, onParametersChange, parameters, handleSubmit, loading, disabled }) {
  const selectedLanguage = LANGUAGES.find(lang => lang.value === language)
  const questionareaRef = useRef(null)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    console.log('Effect running:', isExpanded, questionareaRef.current?.scrollHeight)

    if (questionareaRef.current && isExpanded) {
      questionareaRef.current.style.height = `${questionareaRef.current.scrollHeight}px`
    } else if (questionareaRef.current) {
      questionareaRef.current.style.height = '3rem'
    }
  }, [isExpanded, question])

  return (

    <div className="space-y-3">

      <div
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}>
        <textarea
          placeholder="Enter your question"
          value={question}
          onChange={(e) => onQuestionChange(e.target.value)}
          disabled={disabled}
          ref={questionareaRef}
          className="w-full bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-600 focus:border-neutral-600 transition-[height] duration-300 ease-in-out overflow-hidden resize-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" 
          />
      </div>



      {/* Language Selector Bar */}
      <div className="flex items-center justify-between p-2 bg-neutral-900 border border-neutral-800 rounded-t-lg">
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-neutral-800 border-neutral-700 text-neutral-100 text-xs h-7 px-3 hover:bg-neutral-700 focus:ring-2 focus:ring-neutral-600 transition-all mx-2">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                {(LANGUAGES.find(lang => lang.value === language)).label}
                <svg className="w-3 h-3 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="bg-neutral-800 border-neutral-700 text-neutral-100 text-xs">
              <DropdownMenuRadioGroup value={language} onValueChange={onLanguageChange} className='text-xs'>

                {LANGUAGES.map((lang) => (
                  <DropdownMenuRadioItem key={lang.value} value={lang.value}>{lang.label}</DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className='bg-neutral-800 border-neutral-700 text-neutral-100 text-xs p-1 px-3 h-7 hover:bg-neutral-700 focus:ring-1 focus:ring-neutral-600'>
                <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                {parameters}
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-neutral-800 border-neutral-700 text-neutral-100 text-xs">                        <DropdownMenuRadioGroup value={parameters} onValueChange={onParametersChange} className='text-xs'>
              {PARAMETERS.map((para) => (
                <DropdownMenuRadioItem key={para} value={para}>{para}</DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Button
          onClick={() => handleSubmit()}
          disabled={loading}
          className="bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-semibold shadow-lg transition-all duration-200"
        >
          {loading ? 'Reviewing...' : 'Submit'}
        </Button>
      </div>
    </div>
  )
}