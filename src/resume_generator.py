from src.docx_text_replicator import replicate_section
from docx import Document
from src.skill_table_handler import handle_skills_summary, replace_text_in_table
from src.docx_text_replacer import replace_text_in_docx
import streamlit as st
import os

def generate_resume(structured_data, years_exp, profile, res_dict):
    # Update the path to include the 'data' folder
    input_filename = os.path.join("data", "resume_sample.docx")
    
    # Load the Word document
    doc = Document(input_filename)
    
    output_filename = "updated_resume.docx"
    
    full_name = structured_data['contact']['name']
    cgi_title = "Consultant"
    sector = "Health Services"
    certs = None
    if 'certifications' in structured_data:
        certs = [f"{i['name']}, {i['issuing_organization']}" for i in structured_data['certifications']]
    replacements = [
        ("{full_name}", full_name),
        ("{cgi_title}", cgi_title),
        ("{years_exp}", years_exp),
        ("{professional_profile}", profile),
        ("{industry}", res_dict['other_sections']['industry_experience']),
        ("{tech_specs}", res_dict['other_sections']['technical_specializations']),
        ("{expertise}", res_dict['other_sections']['areas_of_expertise']),
        ("{languages}", res_dict['other_sections']['languages']),
        ("{environment}", res_dict['other_sections']['environments']),
        ("{tools}", res_dict['other_sections']['tools_and_software']),
        ("{certs}", certs),
    ]
    
    # if 'certifications' in structured_data:

    
    # CGI Experience
    cgi_exp =  res_dict['experience']['cgi_experience']
    for exp in cgi_exp:
        exp = {k: v for k, v in exp.items() if k in ['sector', 'job_title', 'start_date', 'end_date', 'responsibilities']}
        for key, value in exp.items():
            replacements.append( ("{" + key + "}", value) )
    times_to_repeat = len(cgi_exp) -1
    
    replicate_section(doc, "{begin_cgi_exp}", "{end_cgi_exp}", replacements, times_to_repeat)

    # Other Experience
    o_exp =  res_dict['experience']['other_experience']
    for exp in o_exp:
        exp = {k: v for k, v in exp.items() if k in ['company', 'job_title', 'start_date', 'end_date', 'responsibilities']}
        for key, value in exp.items():
            replacements.append( ("{" + key + "}", value) )
    times_to_repeat = len(o_exp) -1
    replicate_section(doc, "{begin_other_exp}", "{end_other_exp}", replacements, times_to_repeat)
    st.write(structured_data['education'])
    # Skills summary
    table_reps = []
    for key, value in res_dict['skills_summary'].items():
        table_reps.append( ("{" + key + "}", value) )
    # ed_list = [f"{el['degree']}, {el['field_of_study']} - {el['institution']}" for el in structured_data['education']]
    ed_list = [
        ', '.join(el[k] for k in ['degree', 'field_of_study', 'institution'] if k in el)
        for el in structured_data['education']
    ]
    replacements.append( ("{education_entry}", ed_list) )


    replace_text_in_docx(doc, replacements)
    handle_skills_summary(doc, table_reps, res_dict['skills_summary'])

    replacements = []
    for key, value in res_dict['skills_summary'].items():
        replacements.extend( [ ("{" + key + "}", v['skill']) for v in value] )
        replacements.extend( [ ("{num_years}", str(v['years_of_experience'])) for v in value] )
        replacements.extend( [ ("{skill_level}", str(v['skill_level'])) for v in value] )

    replace_text_in_table(doc, replacements,  res_dict['skills_summary'])

    
    doc.save(output_filename)
    print(f"Updated document saved as: {output_filename}")
