from openai import OpenAI
from dotenv import load_dotenv
import json

load_dotenv()
client = OpenAI()

system_prompt1 = """
You are a programming tutor analyzing a student written solution to a coding question
OUTPUT FORMAT MUST be valid JSON:
{
  "approaches": [
    {
      "title": string,
      "description": string
    }
  ]
}

TASK:
ACT like a tutor
Infer the student's possible problem-solving approach(es) based on:
- The problem statement (QUESTION)
- The structure of the final code
- Control flow (loops, conditions)
- Data structures used or avoided
- Focus on the student reasoning and APPROACH.

RULES:
- The title must be short and technical (e.g., "Brute-force nested loops").
- The description must explain HOW the student attempted to solve the problem,
  focusing on  their reasoning and structure, NOT correctness or efficiency.
- Do NOT evaluate the approach as good, bad, optimal, or inefficient.
- Do NOT include feedback, drawbacks, hints, or suggestions.
- Do NOT include extra keys outside the schema.
- If exactly one approach is evident, return a list with one item.
- If no clear approach can be inferred, return:
  { "approaches": [] }

IMPORTANT:
- Do NOT hallucinate advanced strategies not reflected in the code.
- If logs do not add insight, ignore them.
- Output ONLY valid JSON. No prose. No markdown.
- Use the QUESTION only to disambiguate intent.
- Do NOT infer strategies that are not clearly supported by the code.
"""

system_prompt2 = """
You are a programming tutor analyzing a student's attempt at the question.

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
- CODING_LOGS: Per-line stats
- PREVIOUS_DRAWBACKS: Issues identified in previous attempts (if any)
- FOCUS_PARAMETERS: Specific areas to analyze (e.g., "Space & Time Complexity", "Code Quality", "Best Practices")

FEEDBACK REQUIREMENTS:
1. Acknowledge their approach
2. In feedback_text: Provide feedback, mention struggle points from CODING_LOGS (high time_spent/edit_count), and discuss the FOCUS_PARAMETERS

DRAWBACK CATEGORIZATION RULES:
- DRAWBACKS MUST BE TECHNICAL ISSUES RELATED TO FOCUS_PARAMETERS ONLY
- DO NOT include observations about time spent, comments, or code style UNLESS those are the FOCUS_PARAMETERS
- For each drawback in PREVIOUS_DRAWBACKS:
  * If the drawback DOESN'T EXISTS in current code put it in the "resolved_drawbacks" list
  * If it STILL EXISTS in current code put it in the "existing_drawbacks" list
- For NEW technical issues found related to FOCUS_PARAMETERS:
  * Add to "existing_drawbacks"

DRAWBACK EXAMPLES BY FOCUS PARAMETER:
- "Space and Time Complexity":
  * "Nested loops cause O(n²) time complexity"
  * "Unnecessary auxiliary array increases space to O(n)"
  * "Multiple passes over data when one pass would suffice"
  * "Inefficient string concatenation in loop"

- "Best Practices":
  * "Missing error handling for edge cases"
  * "No input validation"
  * "Hardcoded values should be configurable"

CRITICAL RULES:
- If a prev drawback is resolved/not present in the current code, put it in resolved.
- Valid JSON only, no markdown
- ONLY create drawbacks that match the FOCUS_PARAMETERS
- ALWAYS include both "resolved_drawbacks" and "existing_drawbacks" arrays (can be empty)
- Use CODING_LOGS for context in feedback_text, NOT for creating drawbacks
- Be specific: cite actual code patterns or algorithmic issues
- For PREVIOUS_DRAWBACKS verification:
  * Carefully analyze the CURRENT code structure
  * Count actual loop nesting levels
  * If a drawback (e.g., "O(n²) nested loops") is NOT present in current code, 
    it MUST go in "resolved_drawbacks"
  * Only put in "existing_drawbacks" if you can cite the EXACT code pattern 
    causing the issue in the CURRENT submission
"""

def get_approaches(question, code):
    prompt = f"""
            QUESTION:
            {question}
            STUDENT_CODE:
            {code}
        """
    # print("Prompt to get the approaches: ", prompt)
    response = client.responses.create(
        model="gpt-4o-mini",
        instructions=system_prompt1,
        input=prompt,
        store=False,
    )
    
    if not response.output_text:
        raise ValueError("Empty model response")

    try:
        data = json.loads(response.output_text)
        
        # Validate response structure
        if not isinstance(data.get("approaches"), list):
            raise ValueError("Invalid response: 'approaches' must be an array")
            
        return data
        
    except json.JSONDecodeError as e:
        print(f"JSON decode error in get_approaches: {e}")
        print(f"Response text: {response.output_text}")
        raise


def get_feedback(question, approach, code, stats, parameters, prev_drawbacks):
    """Get AI feedback on code submission"""
    
    print(f"Generating feedback for question: {question[:50]}...")
    print(f"Parameters: {parameters}")
    print(f"Previous drawbacks: {prev_drawbacks}")
    
    response = client.responses.create(
        model="gpt-4o-mini",
        instructions=system_prompt2,
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