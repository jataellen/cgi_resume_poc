# --------------------------------------------------------------------------------
STRUCTURED_DATA_SP = "You are an AI that extracts structured information from plain text resumes and returns JSON output."

STRUCTURED_DATA_HP = """
Extract and structure the following text into JSON format:
{pdf_text}

Ensure the response matches this schema:
{json_input}
"""
# --------------------------------------------------------------------------------
SUMMARY_SP = "You are an AI that takes structured resumes in JSON format and writes a compelling, professional summary of the applicant."

SUMMARY_HP = """
Using the following structured resume data in JSON format:


{structured_data}

Write a well-crafted, three-paragraph professional profile of the applicant in the third person. 
Keep a good balance of detailed and concise. Do not use AI-isms
Incorporate their professional summary, work experience, education, skills, certifications, and any notable achievements. 
Highlight their expertise, impact, and technical skills, ensuring the profile flows naturally and is engaging.
"""
# --------------------------------------------------------------------------------
PROFILE_SP = "You are an AI that takes in a professional summary and determines the applicants years of experience."

PROFILE_HP = """
Using the following professional summary:

{profile}

Write a very concise header desribing their experience in the following format:
<X> years experience in <X_category>
ex: 5 years of experience in Software Development
"""
# --------------------------------------------------------------------------------
EXPERIENCE_SP = "You are an AI that reformats and structures job experience data from resumes into a JSON format with clearly separated 'CGI Experience' and 'Other Experience' sections."

EXPERIENCE_HP = """
Using the following experience section in JSON format:{text_input}

Reformat it into the following structured JSON format, explicitly separating CGI Experience and Other Experience:
{json_dump}

Ensure the following:
- Experience at CGI and its clients should be placed under 'cgi_experience'.
- All other jobs should be placed under 'other_experience'.
- Format job titles and dates as follows: 'Senior Consultant - Data Scientist (11/24 to Present)'.
- Rewrite responsibilities into clear, action-based bullet points.
- Include a 'Technology' field listing relevant technologies used.
- Ensure consistency and readability.
"""
# --------------------------------------------------------------------------------
VOLUNTEER_SP = "You are an AI that reformats and structures volunteer experience from resumes into a structured JSON format."

VOLUNTEER_HP = """
Using the following volunteer experience section from the resume:
{text_input}

Reformat it into structured JSON format following this schema:
{json_dump}

Important Notes:
- If there is **no volunteer experience**, return an empty list.
- Ensure all entries follow a clear structure with 'role', 'organization', 'location', 'start_date', 'end_date', and 'responsibilities'.
- Responsibilities should be rewritten into clear, action-based bullet points.
"""
# --------------------------------------------------------------------------------
OTHER_SECTIONS_HP = """
Please analyze the following resume content and organize it into the sections below:
Resume: {text_input}

Industry Experience:
Technical Specializations:
Areas of Expertise:
Languages:
Environments:
Tools & Software:

Now, format the content into a structured JSON, following the schema below:
{json_dump}

Ensure the sections are clearly organized, and the content under each section is concise and appropriately categorized.
"""
# --------------------------------------------------------------------------------
SKILLS_SUMMARY_SP =  "You are an AI that extracts and organizes a resume into a structured skills summary, categorizing skills into Technical Skills, Application Knowledge, IT Disciplines, Industry Knowledge, and Other Relevant Skills."

SKILLS_SUMMARY_HP =  """
Please analyze the following resume content and organize it into the sections below: 

Resume: {text_input}

Technical Skills:
Application Knowledge:
IT Disciplines:
Industry Knowledge:
Other Relevant Skills:

Now, format the content into a structured table with the following columns:
1. Skill
2. Number of Years
3. Skill Level (on a scale from 1 to 4, 1 = Beginner, 2 = Experienced, 3 = Advanced, 4 = Expert), dont over-award 4s

Ensure the skills are categorized and summarized accordingly into these sections.

Provide the output in the following JSON format:
{json_dump}

Ensure the sections are clear, with each skill listed under the appropriate category with the number of years of experience and skill level.
"""
# --------------------------------------------------------------------------------

