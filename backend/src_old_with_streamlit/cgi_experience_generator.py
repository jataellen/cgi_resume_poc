from datetime import datetime

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
