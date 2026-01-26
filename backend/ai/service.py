from openai import OpenAI
from datetime import datetime
from dotenv import load_dotenv
import json
import os


load_dotenv()
client = OpenAI()

LOGS_DIR = "temp\\ai_logs"
os.makedirs(LOGS_DIR, exist_ok=True)


system_prompt = """
You are acting as a deterministic code-evaluation engine, not a conversational assistant.
You must strictly follow the rules below even if they conflict with common tutoring behavior.

You are an expert programming mentor.

REQUIRED JSON OUTPUT:
{
  "approach_name": string,
  "feedback_text": string,
  "drawback_analysis": [
    {
      "drawback_text": string,
      "status": "fixed" | "still_present" | "unclear"
    }
  ],
  "new_drawbacks": [string]
}

INPUTS:
- QUESTION: Problem statement
- STUDENT_CODE: Code submission
- CODING_LOGS: Line-level stats (time_spent, edit_count)
- FOCUS_PARAMETERS: Evaluation criteria (may include Space & Time Complexity)
- PREVIOUS_DRAWBACKS: Known issues from prior attempts

RULES:
- Output valid JSON only. No markdown.
- All fields required (arrays can be empty).
- Copy PREVIOUS_DRAWBACKS text exactly (verbatim).
- Use status "unclear" ONLY under the conditions explicitly defined below.

DEFINITION OF DRAWBACKS (STRICT):
Drawbacks MUST be only:
1) Logical errors
2) Major syntactical errors
3) Space & Time Complexity issues ONLY if FOCUS_PARAMETERS includes them

Do NOT include:
- Style, naming, or readability
- Minor inefficiencies or micro-optimizations
- Suggestions or best practices unless they are logical errors
- Vague statements like "inefficient"
- Inherent characteristics of optimal algorithms

OPTIMAL ALGORITHM RULE:
If the code implements the optimal algorithm:
- Do NOT flag inherent characteristics as drawbacks
- Only flag complexity issues if a BETTER algorithm exists

WORKFLOW:

1) VALIDITY
If code is empty or invalid:
→ approach_name: "invalid"
→ drawback_analysis: []
→ new_drawbacks: []
→ brief feedback_text

2) APPROACH
Infer approach_name conservatively from observable code patterns only.
Do NOT infer strategies not clearly supported by the code.

3) FEEDBACK
Provide mentor-style feedback strictly tied to FOCUS_PARAMETERS.
Use CODING_LOGS only for context, not as evidence of correctness or incorrectness.

4) ANALYZE PREVIOUS_DRAWBACKS (CRITICAL)
For each PREVIOUS_DRAWBACK:

- Identify the exact code pattern or condition that originally caused this drawback.
- Check whether that same pattern or condition exists in STUDENT_CODE now.

Status rules:
- "fixed": the exact pattern or condition is provably absent
- "still_present": the exact pattern or condition is present
- "unclear": ONLY if one of the following is true:
    a) The exact pattern or condition cannot be confidently identified in the code, OR
    b) The determination depends on missing or unspecified problem constraints

STRICT LIMITATION ON "UNCLEAR":
- Do NOT use "unclear" due to uncertainty about algorithm optimality
  if the code structure clearly matches a known optimal approach.
- Do NOT use "unclear" as a fallback for incomplete reasoning.

IMPORTANT:
- Do NOT broadly re-evaluate correctness.
- Do NOT reinterpret or rephrase the drawback.
- Only determine presence or absence of the exact issue described.

SPECIAL CASE – OPTIMAL ALGORITHM:
If a previous drawback describes behavior inherent to a now-optimal algorithm:
→ status MUST be "fixed"

5) NEW DRAWBACKS (STRICT)
CRITICAL RULES:
- Do NOT create any new drawback that duplicates, rephrases, or semantically overlaps
  with any PREVIOUS_DRAWBACK.
- If a potential new drawback refers to the same underlying issue as a previous one,
  discard it entirely.

Before adding a new drawback, verify ALL of the following:
- It is NOT already covered in PREVIOUS_DRAWBACKS
- It is a logical error or major syntax error, OR
- It is a complexity issue where a BETTER algorithm exists AND
  FOCUS_PARAMETERS includes complexity

Examples of DUPLICATES (DO NOT CREATE):
Previous: "Uses O(n+m) time instead of O(log(min(n,m)))"
New (WRONG): "Suboptimal time complexity: O(n+m) vs O(log(min(n,m)))"

GOOD DRAWBACKS:
- "Off-by-one error skips last element"
- "Missing base case causes infinite recursion"
- "Division by zero when input is 0"
- "Nested loops cause O(n²) when O(n) hash map exists" (only if complexity selected)

BAD DRAWBACKS:
- "Inefficient algorithm"
- "Needs comments"
- "Binary search calls function log n times"
"""

def log_ai_interaction(input_data: dict, output_data: dict = None, error: str = None):
	"""Log AI interactions to timestamped JSON files"""
	timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
	log_file = os.path.join(LOGS_DIR, f"ai_log_{timestamp}.json")

	log_entry = {
			"timestamp": datetime.now().isoformat(),
			"input": input_data,
			"output": output_data,
			"error": error
	}
	try:
			with open(log_file, 'w', encoding='utf-8') as f:
					json.dump(log_entry, f, indent=2, ensure_ascii=False)
			print(f"AI interaction logged to: {log_file}")
	except Exception as e:
		print(f"Failed to write log file: {e}")

def get_feedback(question, code, stats, parameters, prev_drawbacks):
		"""Get AI feedback on code submission"""

		print(f"Generating feedback for question: {question[:50]}...")
		print(f"Parameters: {parameters}")
		print(f"Previous drawbacks: {prev_drawbacks}")

		# Prepare input for logging
		input_data = {
			"question": question,
			"code": code,
			"parameters": parameters,
			"previous_drawbacks": prev_drawbacks
		}
		
		try:
			response = client.responses.create(
					model="gpt-5-mini",
					instructions=system_prompt,
					input=f"""
							QUESTION: {question}
							STUDENT_CODE:{code}
							CODING_LOGS:{stats}
							FOCUS_PARAMETERS:{parameters}
							PREVIOUS_DRAWBACKS:{prev_drawbacks if prev_drawbacks else []}
							TASK:Generate mentoring feedback focused ONLY on the specified FOCUS_PARAMETERS.
					""",
					store=False,
			)
			
			if not response.output_text:
					raise ValueError("Empty model response")

			data = json.loads(response.output_text)

			# Validate response structure
			if not isinstance(data.get("feedback_text"), str):
					raise ValueError("Invalid response: 'feedback_text' must be a string")
			
			if not isinstance(data.get("drawback_analysis"), list):
					raise ValueError("Invalid response: 'drawback_analysis' must be an array")
			
			if not isinstance(data.get("new_drawbacks"), list):
					raise ValueError("Invalid response: 'new_drawbacks' must be an array")
			
			# Backend decision logic: convert analysis to resolved/existing
			resolved_drawbacks = []
			existing_drawbacks = []
			
			for analysis in data["drawback_analysis"]:
					if analysis["status"] == "fixed":
							resolved_drawbacks.append(analysis["drawback_text"])
					else:
							# "still_present" or "unclear" → conservative (treat as existing)
							existing_drawbacks.append(analysis["drawback_text"])
			
			# Add new drawbacks to existing
			existing_drawbacks.extend(data["new_drawbacks"])
			
			print(f"Feedback generated: {len(resolved_drawbacks)} resolved, {len(existing_drawbacks)} existing")
			
			# Log successful interaction (with raw AI output)
			log_ai_interaction(input_data, output_data=data)
			
			# Return processed format for backward compatibility
			return {
					"approach_name": data.get("approach_name"),
					"feedback_text": data["feedback_text"],
					"resolved_drawbacks": resolved_drawbacks,
					"existing_drawbacks": existing_drawbacks
			}
				
		except json.JSONDecodeError as e:
				error_msg = f"JSON decode error: {e}\nResponse: {response.output_text}"
				print(error_msg)
				log_ai_interaction(input_data, error=error_msg)
				raise
		except Exception as e:
				error_msg = f"Error in get_feedback: {str(e)}"
				print(error_msg)
				log_ai_interaction(input_data, error=error_msg)
				raise
		


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