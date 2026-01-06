from openai import OpenAI
from dotenv import load_dotenv
import json

load_dotenv()
client = OpenAI()

system_prompt1 = """
You MUST output valid JSON matching this schema exactly:

{
  "approaches": [
    {
      "title": string,
      "description": string
    }
  ]
}

TASK:
Infer the student's possible problem-solving approach(es) based ONLY on:
- The structure of the final code
- Control flow (loops, conditions)
- Data structures used or avoided
- Optional coding logs (edit patterns, rewrites)

RULES:
- The title must be short and technical (e.g., "Brute-force nested loops").
- The description must explain HOW the student attempted to solve the problem,
  focusing on reasoning and structure, NOT correctness or efficiency.
- Do NOT evaluate the approach as good, bad, optimal, or inefficient.
- Do NOT include feedback, drawbacks, hints, or suggestions.
- Do NOT restate or summarize the problem.
- Do NOT include extra keys outside the schema.
- If exactly one approach is evident, return a list with one item.
- If no clear approach can be inferred, return:
  { "approaches": [] }

IMPORTANT:
- Do NOT hallucinate advanced strategies not reflected in the code.
- If logs do not add insight, ignore them.
- Output ONLY valid JSON. No prose. No markdown.

"""
system_prompt2 = """
You are a programming mentor analyzing a student's coding session.

OUTPUT FORMAT (strict JSON):
{
  "feedback_text": string,
  "resolved_drawbacks": [string, string, ...],
  "existing_drawbacks": [string, string, ...]
}

INPUTS:
- CONFIRMED_APPROACH: Student's intended algorithm
- QUESTION: Problem statement
- STUDENT_CODE: Final submission
- CODING_LOGS: Per-line stats {time_spent: ms, edit_count: number, content: code}
- PREVIOUS_DRAWBACKS: Issues identified in previous attempts (if any)
- FOCUS_PARAMETERS: Specific areas to analyze (e.g., "Space & Time Complexity", "Code Quality", "Best Practices")

FEEDBACK REQUIREMENTS:
1. Acknowledge their approach
2. Focus feedback and drawbacks ONLY on the FOCUS_PARAMETERS specified
3. Assess based on the given parameters (e.g., if "Space & Time Complexity", analyze Big-O, memory usage)
4. Highlight struggle points from logs (high time_spent/edit_count)
5. Address misconceptions related to the focus parameters

DRAWBACK CATEGORIZATION:
- For FIRST attempt: All drawbacks go in "existing_drawbacks", "resolved_drawbacks" is empty []
- For SUBSEQUENT attempts with PREVIOUS_DRAWBACKS:
  * "resolved_drawbacks": Issues from previous attempts that are now fixed in current code
  * "existing_drawbacks": Issues that still exist from before + any NEW issues found

DRAWBACK FOCUS:
- ONLY identify drawbacks related to the FOCUS_PARAMETERS
- Examples:
  * "Space & Time Complexity": O(n²) loops, unnecessary memory allocation, redundant iterations
  * "Code Quality": Poor naming, lack of comments, magic numbers, code duplication
  * "Best Practices": Missing error handling, no input validation, security issues

RULES:
- Valid JSON only, no markdown
- Evidence MUST be specific and cite logs or code
- Be constructive, focus on learning
- ALWAYS include both "resolved_drawbacks" and "existing_drawbacks" arrays (can be empty)
- STAY FOCUSED on the specified FOCUS_PARAMETERS only
"""

def get_approaches(question, code):
	response1 = client.responses.create(
		model="gpt-5-nano",
		reasoning={"effort": "low"},
		# response_format={"type": "json"},
		instructions= system_prompt1,
		input=f"""
			QUESTION:
			{question}
			STUDENT_CODE:
			{code}
			""",
		store=False,
	)
	
	try:
		return json.loads(response1.output_text)
	except json.JSONDecodeError as e:
		print(f"JSON decode error in get_approaches: {e}")
		print(f"Response text: {response1.output_text}")
		raise


def get_feedback(question, approach, code, stats, parameters, prev_drawbacks):
	response2 = client.responses.create(
		model="gpt-5-nano",
		reasoning={"effort": "low"},
		instructions= system_prompt2,
		input=f"""
			CONFIRMED_APPROACH (AUTHORITATIVE):
			{approach}
			QUESTION: 
			{question}
			STUDENT_CODE:
			{code}
			CODING_LOGS:
			{stats}
			FOCUS_PARAMETERS:
			{parameters}
			PREVIOUS_DRAWBACKS:
			{prev_drawbacks if prev_drawbacks else "None (first attempt)"}
			TASK:
			Generate mentoring feedback focused ONLY on the specified FOCUS_PARAMETERS.
			""",
		store=False,
	)
	
	try:
		return json.loads(response2.output_text)
	except json.JSONDecodeError as e:
		print(f"JSON decode error in get_feedback: {e}")
		print(f"Response text: {response2.output_text}")
		raise