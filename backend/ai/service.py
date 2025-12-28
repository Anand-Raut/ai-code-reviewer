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

Rules:
- The title must be short and technical (e.g., "Brute-force nested loops").
- The description must explain the reasoning behind the approach, not its correctness.
- Do NOT include feedback, drawbacks, or suggestions.
- Do NOT include extra keys.
- If only one approach is evident, return a list with exactly one item.
- If no approach can be inferred, return an empty list inside list [].
"""
system_prompt2 = """
You are a programming mentor analyzing a student's coding session.

OUTPUT FORMAT (strict JSON):
{
  "feedback_text": string,
  "drawbacks": [string, string, ...]
}

INPUTS:
- CONFIRMED_APPROACH: Student's intended algorithm
- QUESTION: Problem statement
- STUDENT_CODE: Final submission
- CODING_LOGS: Per-line stats {time_spent: ms, edit_count: number, content: code}

FEEDBACK REQUIREMENTS:
1. Acknowledge their approach
2. Assess correctness and efficiency
3. Highlight struggle points from logs (high time_spent/edit_count)
4. Address misconceptions

DRAWBACK EVIDENCE (cite at least one):
- Line numbers & variable names
- Timing data (e.g., "Line 8: 45000ms, 12 edits")
- High edit_count = confusion/struggle
- Code issues (bugs, O(n²), poor naming)

RULES:
- Valid JSON only, no markdown
- Evidence MUST be specific and cite logs or code
- Be constructive, focus on learning

"""

def get_approaches(question, code):
	# response1 = client.responses.create(
	# 	model="gpt-5-nano",
	# 	reasoning={"effort": "low"},
	# 	# response_format={"type": "json"},
	# 	instructions= system_prompt1,
	# 	input=f"""
	# 		QUESTION:
	# 		{question}
	# 		STUDENT_CODE:
	# 		{code}
	# 		""",
	# 	store=False,
	# )
	
	# print(response1.output_text)
	# return json.loads(response1.output_text)
	return json.loads("""{
	"approaches": [
		{
		"title": "Hash-map complement lookup",
		"description": "As you iterate the array, store each seen value with its index in a hash map. For the current value, compute the needed complement as target minus the current value and check if that complement has already appeared. If it has, you can return the index of the complement and the current index. This enables a single-pass solution with O(n) average time and O(n) extra space."
		}
	]
	}"""
)
def get_feedback(question, approach, code, stats, paramaters):
	# response2 = client.responses.create(
	# 	model="gpt-5-nano",
	# 	reasoning={"effort": "low"},
	# 	instructions= system_prompt2,
	# 	input=f"""
	# 		CONFIRMED_APPROACH (AUTHORITATIVE):
	# 		{approach}
	# 		QUESTION: 
	# 		{question}
	# 		STUDENT_CODE:
	# 		{code}
	# 		CODING_LOGS:
	# 		{stats}
	# 		TASK:
	# 		Generate mentoring feedback following the required JSON format.
	# 		""",
	# 	store=False,
	# )
	# return json.loads(response2.output_text)
	return json.loads("""{
		"feedback_text": "Your solution demonstrates understanding...",
		"drawbacks": [
			"Inefficient nested loop structure increases time complexity to O(n²)",
			"No input validation - code will crash with empty arrays",
			"Variable names like 'temp' and 'x' are not descriptive",
			"Missing edge case handling for negative numbers",
			"Code lacks comments explaining the algorithm logic"
		]
	}""")