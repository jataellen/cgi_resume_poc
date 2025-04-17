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

Write a well-crafted, two-to-three paragraph professional profile of the applicant in the third person. 
Each paragraph should be 3-4 sentences, but not too long. Avoid run-on sentences
The length should reflect their experience level, if they have under 10 years exp, consider shortening it
Keep a good balance of detailed and concise. Do not use AI-isms, use human-like language, do not be stuffy
Use specific examples showing aptitude, if applicable
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
GENERAL_EXPERIENCE_SP = "You are an AI that reformats and structures job experience data from resumes into a JSON format."

GENERAL_EXPERIENCE_HP = """
Using the following experience section in JSON format:
{text_input}

Reformat it into the following structured JSON format:
{json_dump}

Reformat the experience section into a structured JSON format, ensuring the following:
- Clearly include fields for 'company', 'job_title', 'start_date', 'end_date', 'responsibilities', and 'technologies'.

- If the entry is under a 'CGI Experience' heading, prepend CGI to the company field along with the entire detailed client descriptor
- Rewrite responsibilities into clear, action-based bullet points.
- Include a 'Technologies' field listing relevant technologies used.
- Ensure consistency, readability, and completeness.
"""

SEP_EXPERIENCE_SP = "You are an AI that reformats and structures job experience data from resumes into a JSON format with clearly separated 'CGI Experience' and 'Other Experience' sections."

SEP_EXPERIENCE_HP = """
Using the following experience section in JSON format:
{text_input}

Reformat it into the following structured JSON format, explicitly separating CGI Experience and Other Experience:

Ensure the following:
- Place a job under 'cgi_experience' only if the job clearly indicates that the work was performed at CGI or that the candidate was employed by CGI. This should be evident if the employer or client name explicitly includes 'CGI' (e.g., 'CGI', 'CGI Inc.', 'CGI Americas'). Do not classify a job as CGI Experience if the connection to CGI is merely tangential or if the job was performed for a CGI client without direct employment.
** IMPORTANT - If no CGI-related jobs are present, leave the 'cgi_experience' section empty. **
- All other jobs should be placed under 'other_experience'.

For CGI experience format:
- client_or_sector: Use client name if available (e.g., "Bank of America"), otherwise use the entire detailed client descriptor (e.g., "Large Canadian Bank & Insurance Company")
- position_title (keep original job title)
- start_date (formatted as MM/YY)
- end_date (formatted as MM/YY or Present)
- responsibilities (as action-based bullet points)
- technologies (as an array of technologies used)

For other experience format:
- company (company name)
- position_title (keep original job title)
- start_date (formatted as MM/YY)
- end_date (formatted as MM/YY or Present)
- responsibilities (as action-based bullet points)

Rewrite responsibilities into clear, action-based bullet points if needed.
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
OTHER_SECTIONS_SP = "You are an AI that extracts and organizes a resume into specific sections like Industry Experience, Technical Specializations, Areas of Expertise, etc."

OTHER_SECTIONS_HP = """
Analyze the resume content below and organize it into the following sections:

Resume: {text_input}

Industry Experience:
Technical Specializations:
Areas of Expertise:
Languages (note: NATURAL languages, not programming. Always include English):
Environments:
Tools & Software:

- Only use information explicitly provided in the resume; do not fabricate entries.
- Do not include too many entries, focus on the most relevant 

Format the extracted information as structured JSON according to this schema:
{json_dump}

Ensure the sections are clearly defined and appropriately categorized.
"""

# --------------------------------------------------------------------------------
SKILLS_SUMMARY_SP = "You are an AI that extracts and organizes a resume into a structured skills summary, categorizing skills into Technical Skills, Application Knowledge, IT Disciplines, Industry Knowledge, and Other Relevant Skills."

SKILLS_SUMMARY_HP = """
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
