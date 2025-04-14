from src.docx_text_replicator import replicate_section
from docx import Document
from src.skill_table_handler import handle_skills_summary, replace_text_in_table
from src.docx_text_replacer import replace_text_in_docx
import streamlit as st
import os


def process_replacements(structured_data, res_dict, profile, cgi_title, years_exp):
    """
    Process all field replacements with error handling
    """
    replacements = []
    failures = []

    # Define all field extractors
    extractors = [
        # Fields from structured_data
        ("full_name", lambda data: data["contact"]["name"].title()),
        # External variables
        ("professional_profile", lambda data: profile),
        ("cgi_title", lambda data: cgi_title),
        ("years_exp", lambda data: years_exp),
        # Fields from res_dict
        ("industry", lambda data: res_dict["other_sections"]["industry_experience"]),
        (
            "tech_specs",
            lambda data: res_dict["other_sections"]["technical_specializations"],
        ),
        ("expertise", lambda data: res_dict["other_sections"]["areas_of_expertise"]),
        ("languages", lambda data: res_dict["other_sections"]["languages"]),
        ("environment", lambda data: res_dict["other_sections"]["environments"]),
        ("tools", lambda data: res_dict["other_sections"]["tools_and_software"]),
        # Complex field with conditional check
        (
            "certs",
            lambda data: [
                f"{i['name']}, {i['issuing_organization']}"
                for i in data["certifications"]
            ],
        ),
    ]

    # Process each field
    for key, extractor_func in extractors:
        try:
            value = extractor_func(structured_data)
            if value is not None:
                replacements.append((f"{{{key}}}", value))
            else:
                failures.append(key)
        except Exception:
            failures.append(key)

    return replacements, failures


def generate_resume(structured_data, years_exp, profile, res_dict):
    # Update the path to include the 'data' folder
    input_filename = os.path.join("data", "resume_sample.docx")

    # Load the Word document
    doc = Document(input_filename)

    output_filename = "updated_resume.docx"

    #     full_name = structured_data['contact']['name']
    cgi_title = "Consultant"
    sector = "Health Services"

    # Usage:
    replacements, failures = process_replacements(
        structured_data, res_dict, profile, cgi_title, years_exp
    )

    # Process CGI Experience
    try:
        cgi_exp = res_dict["experience"]["cgi_experience"]
        for exp in cgi_exp:
            exp["cgi_technologies"] = ", ".join(exp["cgi_technologies"])
            try:
                for key, value in exp.items():
                    replacements.append(("{" + key + "}", value))
            except Exception:
                failures.append(f"CGI Experience entry")

        times_to_repeat = len(cgi_exp) - 1
        replicate_section(
            doc, "{begin_cgi_exp}", "{end_cgi_exp}", replacements, times_to_repeat
        )
    except Exception as e:
        failures.append(("CGI Experience section", e))

    # Process Other Experience
    try:
        o_exp = res_dict["experience"]["other_experience"]
        for exp in o_exp:
            try:
                for key, value in exp.items():
                    replacements.append(("{" + key + "}", value))
            except Exception:
                failures.append(f"Other Experience entry")

        times_to_repeat = len(o_exp) - 1
        replicate_section(
            doc, "{begin_other_exp}", "{end_other_exp}", replacements, times_to_repeat
        )
    except Exception as e:
        failures.append(("Other Experience section", e))

    # Process Skills summary
    try:
        table_reps = []
        for key, value in res_dict["skills_summary"].items():
            table_reps.append(("{" + key + "}", value))
    except Exception:
        failures.append("Skills Summary")

    # Process Education
    try:
        ed_list = [
            ", ".join(
                el[k] for k in ["degree", "field_of_study", "institution"] if k in el
            )
            for el in structured_data["education"]
        ]
        replacements.append(("{education_entry}", ed_list))
    except Exception:
        failures.append("Education")

    # Document operations with error handling
    try:
        replace_text_in_docx(doc, replacements)
    except Exception as e:
        failures.append(("Document text replacement", e))

    try:
        handle_skills_summary(doc, table_reps, res_dict["skills_summary"])
    except Exception as e:
        failures.append(("Skills summary handling", e))

    # Handle skills table
    try:
        skills_replacements = []
        for key, value in res_dict["skills_summary"].items():
            try:
                skills_replacements.extend(
                    [("{" + key + "}", v["skill"]) for v in value]
                )
                skills_replacements.extend(
                    [("{num_years}", str(v["years_of_experience"])) for v in value]
                )
                skills_replacements.extend(
                    [("{skill_level}", str(v["skill_level"])) for v in value]
                )
            except Exception:
                failures.append(f"Skills entry: {key}")

        replace_text_in_table(doc, skills_replacements, res_dict["skills_summary"])
    except Exception:
        failures.append("Skills table replacement")

    print(f"Failures with the following fields: {failures}")
    doc.save(output_filename)
    print(f"Updated document saved as: {output_filename}")
