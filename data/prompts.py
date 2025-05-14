# --------------------------------------------------------------------------------
# Role Title Generator
ROLE_TITLE_GEN_SP = "You are an AI that analyzes resume data and determines the most appropriate professional title."

ROLE_TITLE_GEN_HP = """
Based on the following structured resume data:

{structured_data}

And considering the target role type of {selected_role}:

Determine the most appropriate professional title for this individual that accurately reflects their experience level, skills, and career trajectory. The title should:

1. Be industry-standard and recognizable (e.g., "Senior Software Developer" rather than "Code Wizard")
2. Incorporate their primary technical domain or specialty if clear
3. Be appropriately specific but not overly niche
4. Align with the general role type ({selected_role}) while being more general
5. Be 2-5 words in length

Only return the professional title, with no additional explanation or commentary.
"""
# --------------------------------------------------------------------------------
# Structured Data
STRUCTURED_DATA_SP = "You are an AI that extracts structured information from plain text resumes and returns JSON output."

STRUCTURED_DATA_HP = """
Extract and structure the following text into JSON format:
{pdf_text}

Ensure the response matches this schema:
{json_input}
"""
# --------------------------------------------------------------------------------
# Summary
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

# Tailored professional summary
TAILORED_SUMMARY_SP = "You are an AI that takes structured resumes in JSON format and job descriptions to write a compelling, professional summary of the applicant that is optimized for the specific job."

TAILORED_SUMMARY_HP = """
Using the following structured resume data in JSON format:

{structured_data}

And this job description for a {role} position:

{job_description}

Write a well-crafted, two-to-three paragraph professional profile of the applicant in the third person that is specifically tailored to match the job requirements. 
Each paragraph should be 3-4 sentences, but not too long. Avoid run-on sentences.
The length should reflect their experience level, if they have under 10 years exp, consider shortening it.
Keep a good balance of detailed and concise. Do not use AI-isms, use human-like language, do not be stuffy.
Use specific examples showing aptitude, especially those that align with the job requirements.
Incorporate key skills, experiences, and qualifications from their resume that match the job posting.
Strategically include keywords and phrases from the job description to maximize ATS compatibility.
Highlight how their expertise and past achievements demonstrate their fit for this specific role.
The profile should flow naturally and be engaging while demonstrating relevant qualifications.

CRITICAL - ACCURACY FIRST: Maintain 90% fidelity to the original resume content. Make only minor, truthful adjustments (10% at most) to highlight relevant experience for the job description. Never fabricate skills, experiences, or qualifications. Only use terminology from the job description when it genuinely reflects the candidate's actual experience. Always prioritize accuracy over optimization.

Important: Do not explicitly reference the job description or make it obvious that the resume was tailored for a specific role. Instead, naturally integrate relevant keywords and experiences as if they were always part of the applicant's profile. The resume should appear organically well-suited for the position, rather than obviously customized.
"""
# --------------------------------------------------------------------------------
# Profile
PROFILE_SP = "You are an AI that takes in a professional summary and determines the applicants years of experience."

PROFILE_HP = """
Using the following professional summary:

{profile}

Write a very concise header desribing their experience in the following format:
<X> years experience in <X_category>
ex: 5 years of experience in Software Development
"""
# --------------------------------------------------------------------------------
# General Experience
GENERAL_EXPERIENCE_SP = "You are an AI that reformats and structures job experience data from resumes into a JSON format."

GENERAL_EXPERIENCE_HP = """
Using the following experience section in JSON format:
{text_input}

Reformat it into the following structured JSON format:
{json_dump}

Reformat the experience section into a structured JSON format, ensuring the following:
- Clearly include fields for 'company', 'job_title', 'start_date', 'end_date', 'responsibilities', and 'technologies'.

- If the entry is under a 'CGI Experience' heading, prepend CGI to the company field along with the entire detailed client descriptor
- Include a 'Technologies' field listing relevant technologies used.
- Ensure consistency, readability, and completeness.
"""

# Separated Experience
SEP_EXPERIENCE_SP = "You are an AI that reformats and structures job experience data from resumes into a JSON format with clearly separated 'CGI Experience' and 'Other Experience' sections."

SEP_EXPERIENCE_HP = """
Using the following experience section in JSON format:
{text_input}

Reformat it into the following structured JSON format, explicitly separating CGI Experience and Other Experience:

Ensure the following:
- CRITICAL RULE: Place a job under 'cgi_experience' ONLY if the company name EXPLICITLY contains 'CGI' as a standalone word (e.g., 'CGI', 'CGI Inc.', 'CGI Americas', 'CGI Federal'). 
- Check the company field for the exact string 'CGI' (all capital letters).
- DO NOT classify as CGI Experience if:
  * The text merely mentions CGI as a client
  * There's a similar acronym that isn't exactly 'CGI'
  * The relationship to CGI is merely tangential or unclear
  * The job was performed for a CGI client without direct employment by CGI
- If no jobs have 'CGI' explicitly in the company name, the 'cgi_experience' array MUST be empty.
- All non-CGI jobs must be placed under 'other_experience'.

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
- technologies (as an array of technologies used, if mentioned in the experience)

Rewrite responsibilities into clear, action-based bullet points if needed. The bullet points should be detailed and at least 15 words
"""


# Tailored separated experience
TAILORED_SEP_EXPERIENCE_SP = "You are an AI that reformats job experience data from resumes into a JSON format with 'CGI Experience' and 'Other Experience' sections, tailored to a specific job description."


TAILORED_SEP_EXPERIENCE_HP = """
Using the following experience section in JSON format:
{text_input}

And this job description for a {role} position:

{job_description}

Reformat the experience into the following structured JSON format, explicitly separating CGI Experience and Other Experience:
{json_dump}

Ensure the following:
1. CRITICAL RULE: Place a job under 'cgi_experience' ONLY if the company name EXPLICITLY contains 'CGI' as a standalone word (e.g., 'CGI', 'CGI Inc.', 'CGI Americas', 'CGI Federal'). 
2. Check the company field for the exact string 'CGI' (all capital letters).
3. DO NOT classify as CGI Experience if:
   * The text merely mentions CGI as a client
   * There's a similar acronym that isn't exactly 'CGI'
   * The relationship to CGI is merely tangential or unclear
   * The job was performed for a CGI client without direct employment by CGI
4. If no jobs have 'CGI' explicitly in the company name, the 'cgi_experience' array MUST be empty.
5. All non-CGI jobs must be placed under 'other_experience'.
6. For each experience entry, highlight responsibilities and achievements that align with the job description requirements.
7. Prioritize and emphasize experiences most relevant to the target job.
8. Use keywords and terminology from the job description where appropriate and accurate.
9. The bullet points should be adequately detailed


CRITICAL - ACCURACY FIRST: Maintain 90% fidelity to the original resume content. Make only minor, truthful adjustments (10% at most) to highlight relevant experience for the job description. Never fabricate responsibilities, achievements, technologies or qualifications. Only use terminology from the job description when it genuinely reflects what the candidate actually did. Always prioritize accuracy over optimization. Do not add new technologies or responsibilities that weren't in the original resume.

Important: Do not explicitly reference the job description or make it obvious that the resume was tailored for a specific role. Instead, naturally integrate relevant keywords and experiences as if they were always part of the applicant's profile. The resume should appear organically well-suited for the position, rather than obviously customized.

For CGI experience format:
- client_or_sector: Use client name if available, otherwise use the sector
- position_title (keep original job title)
- start_date (formatted as MM/YY)
- end_date (formatted as MM/YY or Present)
- responsibilities (as action-based bullet points tailored to the job description)
- technologies (as an array of technologies used, emphasizing those mentioned in the job description)

For other experience format:
- company (company name)
- position_title (keep original job title)
- start_date (formatted as MM/YY)
- end_date (formatted as MM/YY or Present)
- responsibilities (as action-based bullet points tailored to the job description)
- technologies (as an array of technologies used, emphasizing those mentioned in the job description if they appear in the original resume)

Remember to maintain accuracy while optimizing the content for the target role.
"""

# --------------------------------------------------------------------------------
# Volunteer
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

# Tailored volunteer experience
TAILORED_VOLUNTEER_SP = "You are an AI that reformats volunteer experience from resumes into a structured JSON format, tailored to a specific job description."

TAILORED_VOLUNTEER_HP = """
Using the following volunteer experience section from the resume:
{text_input}

And this job description for a {role} position:

{job_description}

Reformat it into structured JSON format following this schema:
{json_dump}

Important Notes:
- If there is **no volunteer experience**, return an empty list.
- Ensure all entries follow a clear structure with 'role', 'organization', 'location', 'start_date', 'end_date', and 'responsibilities'.
- Highlight volunteer activities that demonstrate skills or experiences relevant to the job description.
- Rewrite responsibilities into clear, action-based bullet points that emphasize transferable skills for the target role.
- Use relevant terminology from the job description where appropriate.
- Do not explicitly reference the job description or make it obvious that the resume was tailored for a specific role. Instead, naturally integrate relevant keywords and experiences as if they were always part of the applicant's profile.

CRITICAL - ACCURACY FIRST: Maintain 90% fidelity to the original resume content. Make only minor, truthful adjustments (10% at most) to highlight relevant experience for the job description. Never fabricate volunteer work, responsibilities, or achievements. Only use terminology from the job description when it genuinely reflects what the candidate actually did. Always prioritize accuracy over optimization.
"""
# --------------------------------------------------------------------------------
# Other Sections
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

# Tailored other sections
TAILORED_OTHER_SECTIONS_SP = "You are an AI that extracts and organizes a resume into specific sections like Industry Experience, Technical Specializations, Areas of Expertise, etc., tailored to a specific job description."

TAILORED_OTHER_SECTIONS_HP = """
Analyze the resume content below and organize it into the following sections, prioritizing elements that align with the job description:

Resume: {text_input}

Job Description for {role} position:
{job_description}

Industry Experience:
Technical Specializations:
Areas of Expertise:
Languages (note: NATURAL languages, not programming. Always include English):
Environments:
Tools & Software:

- Only use information explicitly provided in the resume; do not fabricate entries.
- Prioritize experiences, specializations, and expertise areas that match the job requirements.
- Use terminology consistent with the job description where appropriate.
- Focus on the most relevant entries for the target position.
- Do not explicitly reference the job description or make it obvious that the resume was tailored for a specific role. Instead, naturally integrate relevant keywords and terminology as if they were always part of the applicant's profile.

CRITICAL - ACCURACY FIRST: Maintain 90% fidelity to the original resume content. Make only minor, truthful adjustments (10% at most) to highlight relevant experience for the job description. Never fabricate industry experience, technical specializations, areas of expertise, languages, environments, or tools. Only use terminology from the job description when it genuinely reflects the candidate's actual knowledge and experience. Always prioritize accuracy over optimization. If a skill or technology in the job description doesn't appear in the resume, do not add it.

Format the extracted information as structured JSON according to this schema:
{json_dump}

Ensure the sections are clearly defined and appropriately categorized to highlight the candidate's fit for the target role.
"""

# --------------------------------------------------------------------------------
# Skills Summary
SKILLS_SUMMARY_SP = "You are an AI that extracts and organizes a resume into a structured skills summary, categorizing skills into Technical Skills, Application Knowledge, IT Disciplines, Industry Knowledge, and Other Relevant Skills."

SKILLS_SUMMARY_HP = """
Please analyze the following resume content and extract the most relevant skills (maximum 5-7 per category). Organize them into these categories:

Resume: {text_input}

Technical Skills:
Application Knowledge:
IT Disciplines:
Industry Knowledge:
Other Relevant Skills:

Format the content into a structured table with these columns:
1. Skill (only include the most significant skills, maximum 15-20 skills total across all categories)
2. Number of Years (if mentioned or can be inferred from the resume)
3. Skill Level (on a scale from 1 to 4, where 1 = Beginner, 2 = Experienced, 3 = Advanced, 4 = Expert)
   - Reserve level 4 (Expert) only for skills with extensive experience or explicit expertise
   - Level 3 (Advanced) for skills with substantial experience
   - Level 2 (Experienced) for skills with moderate experience
   - Level 1 (Beginner) for skills with minimal experience

Focus on quality over quantity - prioritize the most relevant and impactful skills rather than listing every possible skill mentioned.
Include up to 10 skills for each category

Provide the output in the following JSON format:
{json_dump}
"""

# Tailored skills summary
TAILORED_SKILLS_SUMMARY_SP = "You are an AI that extracts and organizes a resume into a structured skills summary, tailored to a specific job description."

TAILORED_SKILLS_SUMMARY_HP = """
Please analyze the following resume content and job description, then organize the skills into the sections below, prioritizing those most relevant to the job: 

Resume: {text_input}

Job Description for {role} position:
{job_description}

Technical Skills:
Application Knowledge:
IT Disciplines:
Industry Knowledge:
Other Relevant Skills:

Format the content into a structured table with the following columns:
1. Skill (prioritize skills mentioned in the job description)
2. Number of Years
3. Skill Level (on a scale from 1 to 4, 1 = Beginner, 2 = Experienced, 3 = Advanced, 4 = Expert)

Instructions:
- Prioritize skills that appear in both the resume and job description
- Place the most relevant skills for the position at the top of each category
- Include all important skills from the resume, even if not mentioned in the job description
- Use the same terminology for skills as found in the job description when possible
- Do not fabricate skills or experience levels
- Do not explicitly reference the job description or make it obvious that the resume was tailored for a specific role. Instead, naturally integrate relevant skills and terminology as if they were always part of the applicant's profile.

CRITICAL - ACCURACY FIRST: Maintain 90% fidelity to the original resume content. Make only minor, truthful adjustments (10% at most) to highlight relevant skills for the job description. Never fabricate skills that don't exist in the resume. Do not extend years of experience or inflate skill levels. Only use terminology from the job description when it genuinely describes a skill the candidate actually has. Always prioritize accuracy over optimization. If a skill in the job description doesn't appear in the resume, do not add it.

Provide the output in the following JSON format:
{json_dump}

Ensure the sections are clear, with each skill listed under the appropriate category with years of experience and skill level.
"""
# --------------------------------------------------------------------------------
# RFP Summarization
RFP_SP = """
You are a proposal manager for a large consulting company. 
Your task is to create compelling and detailed job descriptions for roles in RFP responses. 
Each description should highlight specific qualifications, responsibilities, and how the role contributes to project success.
"""

RFP_HP = """
Based on the RFP details provided, create a professional 2-paragraph job description for the {input} position. 

- The first paragraph should outline key responsibilities and project contributions. 
- The second paragraph should detail required skills, experience, and qualifications. 

Include specific technical requirements and domain knowledge relevant to the client's industry. 

Context from RFP: {context}
"""
