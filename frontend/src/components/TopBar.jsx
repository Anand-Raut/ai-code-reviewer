import React from 'react'

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

export default function TopBar({ question, onQuestionChange, language, onLanguageChange, onParametersChange, parameters }) {
    return (
        <div className="">
            {/* Question Input */}
            <div className="py-2">
                <input
                    type="text"
                    placeholder="Enter your question"
                    value={question}
                    onChange={(e) => onQuestionChange(e.target.value)}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-sm text-[#c9d1d9] placeholder-[#8b949e] focus:outline-none focus:ring-1 focus:ring-[#58a6ff] focus:border-[#58a6ff]"
                />
            </div>

            {/* Language Selector Bar */}
            <div className="p-2 flex items-center justify-between border-t border-[#30363d] bg-[#161b22] rounded-t-md">
                <select
                    value={language}
                    onChange={(e) => onLanguageChange(e.target.value)}
                    className="bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] text-sm rounded-md px-3 py-1.5 hover:bg-[#21262d] focus:outline-none focus:ring-1 focus:ring-[#58a6ff] cursor-pointer transition"
                >
                    {LANGUAGES.map((lang) => (
                        <option key={lang.value} value={lang.value}>{lang.label}</option>
                    ))}
                </select>
                <select
                    value={parameters}
                    onChange={(e) => onParametersChange(e.target.value)}
                    className="bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] text-sm rounded-md px-3 py-1.5 hover:bg-[#21262d] focus:outline-none focus:ring-1 focus:ring-[#58a6ff] cursor-pointer transition"
                >
                    {PARAMETERS.map((value) => (
                        <option key={value} value={value}>{value}</option>
                    ))}
                </select>
            </div>
        </div>
    )
}