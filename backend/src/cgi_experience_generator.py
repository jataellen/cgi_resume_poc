from datetime import datetime
import json
from langchain.schema import SystemMessage, HumanMessage

# No need for predefined templates - will use LLM instead


def generate_default_cgi_prompt(format_type, custom_role_title=None):
    """
    Creates a prompt for the LLM to generate a default CGI experience entry
    based on the selected format type.

    Args:
        format_type (str): The selected resume format (Developer, Business Analyst, or Director)
        custom_role_title (str, optional): Custom role title if provided

    Returns:
        str: A prompt for the LLM to generate a CGI experience entry
    """
    # Get current month and year for the start date
    current_date = datetime.now()
    start_date = f"{current_date.month:02d}/{current_date.year}"

    # Use custom role title if provided, otherwise use format type
    role = custom_role_title if custom_role_title else format_type

    prompt = f"""
    Generate a realistic CGI consulting experience entry for a {role} that started in {start_date} and is ongoing.

    Use past tense!
    
    The experience should include:
    1. A plausible client or sector description (like "Major Financial Institution" or "Healthcare Provider")
    2. A position title that matches a {format_type} role at CGI (use "{custom_role_title}" if appropriate)
    3. Start date of {start_date} and end date of "Present"
    4. 3-4 detailed and specific responsibilities that would be typical for this role
    5. 4-8 relevant technologies or methodologies used in this role
    
    Format the response as a JSON object with these fields:
    - cgi_client_or_sector
    - cgi_position_title
    - cgi_start_date
    - cgi_end_date
    - cgi_responsibilities (as an array of strings)
    - cgi_technologies (as an array of strings)
    
    Make the responsibilities detailed, specific, and action-oriented. They should be between 15-20 words. Ensure they reflect actual work someone would do in this role.
    """

    return prompt


def generate_cgi_experience(llm, format_type, custom_role_title=None):
    """
    Generate a default CGI experience entry using the LLM
    
    Args:
        llm: The language model instance
        format_type (str): The selected resume format (Developer, Business Analyst, or Director)
        custom_role_title (str, optional): Custom role title if provided
        
    Returns:
        dict: A formatted CGI experience entry
    """
    try:
        # Generate the prompt
        prompt = generate_default_cgi_prompt(format_type, custom_role_title)
        
        # Create messages for the LLM
        messages = [
            SystemMessage(content="You are a professional resume writer specializing in CGI consulting roles. Generate realistic and compelling experience entries."),
            HumanMessage(content=prompt)
        ]
        
        # Get response from LLM
        response = llm.invoke(messages)
        
        # Try to parse JSON response
        try:
            # Look for JSON in the response
            response_text = response.content
            if "{" in response_text and "}" in response_text:
                # Extract JSON part
                start = response_text.find("{")
                end = response_text.rfind("}") + 1
                json_text = response_text[start:end]
                cgi_exp = json.loads(json_text)
                
                # Validate required fields
                required_fields = ["cgi_client_or_sector", "cgi_position_title", "cgi_start_date", "cgi_end_date", "cgi_responsibilities", "cgi_technologies"]
                for field in required_fields:
                    if field not in cgi_exp:
                        cgi_exp[field] = ""
                
                return cgi_exp
                
        except json.JSONDecodeError:
            pass
        
        # Fallback: create a basic entry if JSON parsing fails
        current_date = datetime.now()
        start_date = f"{current_date.month:02d}/{current_date.year}"
        role = custom_role_title if custom_role_title else format_type
        
        return {
            "cgi_client_or_sector": "Major Client Engagement",
            "cgi_position_title": role,
            "cgi_start_date": start_date,
            "cgi_end_date": "Present",
            "cgi_responsibilities": [
                f"Led {format_type.lower()} initiatives for enterprise client solutions",
                "Collaborated with cross-functional teams to deliver project objectives",
                "Implemented best practices and methodologies for client success"
            ],
            "cgi_technologies": ["Agile", "Scrum", "Microsoft Office", "Project Management"]
        }
        
    except Exception as e:
        print(f"Error generating CGI experience: {e}")
        # Return a basic fallback entry
        current_date = datetime.now()
        start_date = f"{current_date.month:02d}/{current_date.year}"
        role = custom_role_title if custom_role_title else format_type
        
        return {
            "cgi_client_or_sector": "Client Project",
            "cgi_position_title": role,
            "cgi_start_date": start_date,
            "cgi_end_date": "Present",
            "cgi_responsibilities": ["Delivered consulting services for client engagement"],
            "cgi_technologies": ["Various technologies"]
        }
