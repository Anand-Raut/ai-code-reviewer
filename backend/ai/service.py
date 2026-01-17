from http.client import HTTPException
from openai import OpenAI
from dotenv import load_dotenv
import json

load_dotenv()
client = OpenAI()

# system_prompt1 = """
# You are a programming tutor analyzing a student written solution to a coding question
# OUTPUT FORMAT MUST be valid JSON:
# {
#   "approaches": [
#     {
#       "title": string,
#       "description": string
#     }
#   ]
# }

# TASK:
# ACT like a tutor
# Infer the student's possible problem-solving approach(es) based on:
# - The problem statement (QUESTION)
# - The structure of the final code
# - Control flow (loops, conditions)
# - Data structures used or avoided
# - Focus on the student reasoning and APPROACH.

# RULES:
# - The title must be short and technical (e.g., "Brute-force nested loops").
# - The description must explain HOW the student attempted to solve the problem,
#   focusing on  their reasoning and structure, NOT correctness or efficiency.
# - Do NOT evaluate the approach as good, bad, optimal, or inefficient.
# - Do NOT include feedback, drawbacks, hints, or suggestions.
# - Do NOT include extra keys outside the schema.
# - If exactly one approach is evident, return a list with one item.
# - If no clear approach can be inferred, return:
#   { "approaches": [] }

# IMPORTANT:
# - Do NOT hallucinate advanced strategies not reflected in the code.
# - If logs do not add insight, ignore them.
# - Output ONLY valid JSON. No prose. No markdown.
# - Use the QUESTION only to disambiguate intent.
# - Do NOT infer strategies that are not clearly supported by the code.
# """

system_prompt2 = """
You are a programming tutor analyzing a student's attempt at a coding question.

OUTPUT FORMAT (strict JSON only; no markdown, no extra keys):
{
  "approach_name": string,
  "feedback_text": string,
  "resolved_drawbacks": [string, ...],
  "existing_drawbacks": [string, ...]
}

INPUTS:
- QUESTION: Problem statement (may contain random text, gibberish, or incomplete descriptions)
- STUDENT_CODE: Final submission (may contain random text, gibberish, pseudocode, or invalid code)
- CODING_LOGS: Per-line stats (e.g., time_spent, edit_count)
- FOCUS_PARAMETERS: Areas to analyze (e.g., "Space & Time Complexity", "Best Practices", "Code Quality")
- PREVIOUS_DRAWBACKS: Issues identified in earlier attempts (may be empty)

VALIDITY CHECKS (perform first):
If QUESTION appears to be random text/gibberish OR STUDENT_CODE appears to be random text/gibberish/empty:
- Set "Approach Name" to "invalid"
- Set "feedback_text" to a brief explanation (e.g., "Invalid code submission" or "Invalid question")
- Leave both drawback arrays empty and stop analysis.

APPROACH INFERENCE RULES (only if valid):
- Infer "Approach Name" conservatively from observable code patterns:
  - Control flow: loops, recursion, conditionals
  - Data structures: arrays/lists, hash maps/dicts, stacks, queues, trees/graphs
  - Algorithmic strategy examples: brute force, two-pointer, sliding window, binary search, sorting + scanning, recursion + memoization/DP, BFS/DFS, greedy, divide-and-conquer
- If the submission contains incomplete/partial code but is attempting a valid solution:
  - Set "Approach Name" to "Incomplete Implementation"
- If no clear strategy is evident but code is valid, set "Approach Name" to "Unknown".
- Do not invent advanced strategies not clearly supported by the code.

FEEDBACK REQUIREMENTS (only if valid):
- In "feedback_text", mentor with technical, actionable guidance tied strictly to FOCUS_PARAMETERS.
- Reference CODING_LOGS only to highlight struggle points (e.g., lines with high time_spent/edit_count); do not turn logs into drawbacks.
- Keep feedback specific to observable code patterns and algorithmic implications.

DRAWBACK CATEGORIZATION RULES (only if valid):
- Only include drawbacks that directly relate to FOCUS_PARAMETERS.
- For each item in PREVIOUS_DRAWBACKS:
  - If the issue is no longer present in the current code, add to "resolved_drawbacks".
  - If the issue still exists in the current code, add to "existing_drawbacks".
- Add NEW issues found (relevant to FOCUS_PARAMETERS) to "existing_drawbacks".
- Be specific and cite concrete patterns or implications (e.g., "Nested loops cause O(n²)", "No input validation", "Inefficient string concatenation in loop").
- Do not include style/comments as drawbacks unless they are explicitly part of FOCUS_PARAMETERS.

EXAMPLES OF VALID DRAWBACKS:
- Space & Time Complexity:
  - "Nested loops cause O(n²) time complexity"
  - "Multiple passes over data when one pass would suffice"
  - "Unnecessary auxiliary array increases space to O(n)"
- Best Practices:
  - "Missing error handling for edge cases"
  - "No input validation"
  - "Hardcoded values should be configurable"
- Code Quality (if selected in FOCUS_PARAMETERS):
  - "Long function without clear separation of concerns"
  - "Ambiguous variable names hinder readability"

STRICT CONSTRAINTS:
- Return valid JSON only; all fields must always be present.
- Arrays can be empty.
- Keep items unique, concrete, and trimmed.
- No prose outside the JSON.
- Treat PREVIOUS_DRAWBACKS as empty if none provided.
- Perform validity checks FIRST before any technical analysis.

TASK:
1. First check if QUESTION and STUDENT_CODE are valid (not gibberish/random text/empty).
2. If invalid, set "Approach Name" to "invalid" and return brief error message with empty arrays.
3. If valid, proceed with full analysis and categorization.
"""
# def get_approaches(question, code):
#     prompt = f"""
#             QUESTION:
#             {question}
#             STUDENT_CODE:
#             {code}
#         """
#     # print("Prompt to get the approaches: ", prompt)
#     response = client.responses.create(
#         model="gpt-4o-mini",
#         instructions=system_prompt1,
#         input=prompt,
#         store=False,
#     )
    
#     if not response.output_text:
#         raise ValueError("Empty model response")

#     try:
#         data = json.loads(response.output_text)
        
#         # Validate response structure
#         if not isinstance(data.get("approaches"), list):
#             raise ValueError("Invalid response: 'approaches' must be an array")
            
#         return data
        
#     except json.JSONDecodeError as e:
#         print(f"JSON decode error in get_approaches: {e}")
#         print(f"Response text: {response.output_text}")
#         raise


def get_feedback(question, code, stats, parameters, prev_drawbacks):
    """Get AI feedback on code submission"""
    
    print(f"Generating feedback for question: {question[:50]}...")
    print(f"Parameters: {parameters}")
    print(f"Previous drawbacks: {prev_drawbacks}")
    
    response = client.responses.create(
        model="gpt-4o-mini",
        instructions=system_prompt2,
        input=f"""
            QUESTION: 
            {question}
            STUDENT_CODE:
            {code}
            CODING_LOGS:
            {stats}
            FOCUS_PARAMETERS:
            {parameters}
            PREVIOUS_DRAWBACKS:
            {prev_drawbacks if prev_drawbacks else "None"}
            TASK:
            Generate mentoring feedback focused ONLY on the specified FOCUS_PARAMETERS.
        """,
        store=False,
    )
    
    if not response.output_text:
        raise ValueError("Empty model response")

    try:
        data = json.loads(response.output_text)

        # Validate response structure
        if not isinstance(data.get("feedback_text"), str):
            raise ValueError("Invalid response: 'feedback_text' must be a string")
        
        if not isinstance(data.get("resolved_drawbacks"), list):
            raise ValueError("Invalid response: 'resolved_drawbacks' must be an array")
            
        if not isinstance(data.get("existing_drawbacks"), list):
            raise ValueError("Invalid response: 'existing_drawbacks' must be an array")
        
        print(f"Feedback generated: {len(data['resolved_drawbacks'])} resolved, {len(data['existing_drawbacks'])} existing")
        
        return data
        
    except json.JSONDecodeError as e:
        print(f"JSON decode error in get_feedback: {e}")
        print(f"Response text: {response.output_text}")
        raise