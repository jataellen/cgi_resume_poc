from openai import AzureOpenAI
from langchain_openai import AzureChatOpenAI
from langchain.schema import SystemMessage, HumanMessage
from langchain_community.document_loaders import PyPDFLoader
from src.experience_chain import experience_chain
from src.logs_manager import log
from src.resume_generator import generate_resume
import os
import json
import datetime

from data.prompts import *


def generate_llm_content(
    llm,
    system_prompt,
    human_prompt_template,
    format_args=None,
    functions=None,
    extract_function_call=False,
):

    try:
        format_args = format_args or {}
        current_date = datetime.datetime.now().date()
        human_content = (
            human_prompt_template.format(**format_args)
            + f"\n\nCurrent Date: {current_date}"
        )

        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=human_content),
        ]

        response = llm.invoke(messages, functions=functions if functions else None)

        if extract_function_call and "function_call" in response.additional_kwargs:
            function_args = response.additional_kwargs["function_call"]["arguments"]
            return json.loads(function_args)
        else:
            return response.content.strip()
    except Exception as e:
        return f"Error generating content: {str(e)}"


def resume_stream(
    st,
    progress_bar,
    base_progress,
    file_progress_weight,
    file_path,
    selected_role,
    custom_role_title="",
    job_description="",
):

    llm = AzureChatOpenAI(
        azure_endpoint=os.environ["AZURE_OPENAI_ENDPOINT"],
        api_key=os.environ["AZURE_OPENAI_API_KEY"],
        api_version="2024-12-01-preview",
        deployment_name="gpt-4o",
        model="gpt-4o",  # Ensure function calling support
    )

    loader = PyPDFLoader(file_path)
    pages = []
    # async for page in loader.alazy_load():
    #     pages.append(page)
    pages = loader.load()

    pdf_text = "\n".join([doc.page_content for doc in pages])

    current_date = datetime.datetime.now().date()

    with open("data/json_schema.json", "r") as file:  # Updated path
        json_schema = json.load(file)

    # Generate structured data
    structured_data = generate_llm_content(
        llm=llm,
        system_prompt=STRUCTURED_DATA_SP,
        human_prompt_template=STRUCTURED_DATA_HP,
        format_args={
            "pdf_text": pdf_text,
            "json_input": json.dumps(json_schema, indent=2),
        },
        functions=[json_schema],
        extract_function_call=True,
    )

    log("Completed Structured Data")
    # Update progress - 20% complete for this file
    progress_bar.progress(base_progress + file_progress_weight * 0.2)

    # Generate an appropriate role title if not provided by user
    if not custom_role_title or not custom_role_title.strip():
        role_title = generate_llm_content(
            llm=llm,
            system_prompt=ROLE_TITLE_GEN_SP,
            human_prompt_template=ROLE_TITLE_GEN_HP,
            format_args={
                "structured_data": json.dumps(structured_data, indent=2),
                "selected_role": selected_role,
            },
        )
        log(f"Generated role title: {role_title}")

        # Validate that the role title doesn't contain skills not in the resume
        # Extract skills from structured data
        skills_in_resume = []
        if "skills" in structured_data:
            for skill_category in structured_data["skills"]:
                if isinstance(skill_category, list):
                    skills_in_resume.extend([s.lower() for s in skill_category])

        # Common programming languages and frameworks to check against
        tech_keywords = [
            "java",
            "python",
            "javascript",
            "c++",
            "ruby",
            "golang",
            "react",
            "angular",
            "vue",
            "node",
            "aws",
            "azure",
            "mongodb",
            "sql",
            "nosql",
            "docker",
            "kubernetes",
            ".net",
            "php",
            "swift",
            "kotlin",
            "rust",
            "typescript",
            "scala",
            "r ",
            "matlab",
            "tableau",
            "powershell",
            "bash",
            "perl",
            "c#",
            "django",
            "flask",
            "spring",
            "laravel",
        ]

        # Check if role title contains skills not in resume
        role_title_lower = role_title.lower()
        for tech in tech_keywords:
            # Use word boundary check to avoid partial matches (e.g., "java" in "javascript")
            if f" {tech} " in f" {role_title_lower} " and tech not in skills_in_resume:
                log(
                    f"WARNING: Generated role title contains skill '{tech}' not found in resume. Using generic title."
                )
                role_title = selected_role.title()
                break
    else:
        role_title = custom_role_title.strip()
        log(f"Using provided role title: {role_title}")

    # Use the custom role title if provided, otherwise use the selected role type
    # role_title = custom_role_title.strip() if custom_role_title and custom_role_title.strip() else selected_role

    # Generate tailored profile based on job description if provided
    if job_description and job_description.strip():
        profile = generate_llm_content(
            llm=llm,
            system_prompt=TAILORED_SUMMARY_SP,
            human_prompt_template=TAILORED_SUMMARY_HP,
            format_args={
                "structured_data": structured_data,
                "job_description": job_description,
                "role": role_title,
            },
            functions=[json_schema],
        )
        log(f"Generated tailored profile with job description for {role_title}")
    else:
        profile = generate_llm_content(
            llm=llm,
            system_prompt=SUMMARY_SP,
            human_prompt_template=SUMMARY_HP,
            format_args={"structured_data": structured_data},
            functions=[json_schema],
        )
        log("Generated standard profile")

    # Generate years of experience
    years_exp = generate_llm_content(
        llm=llm,
        system_prompt=PROFILE_SP,
        human_prompt_template=PROFILE_HP,
        format_args={"profile": profile},
    )

    # Define function to call LLM with appropriate schema
    def call_llm(all_schemas, section, text_input=pdf_text, job_desc=""):
        sp_var = f"{section.upper()}_SP"
        hp_var = f"{section.upper()}_HP"

        # Only use tailored prompts if job description is provided and not empty
        if (
            job_desc
            and job_desc.strip()
            and f"TAILORED_{section.upper()}_SP" in globals()
        ):
            sp_var = f"TAILORED_{section.upper()}_SP"
            hp_var = f"TAILORED_{section.upper()}_HP"

        sp = eval(sp_var)
        hp = eval(hp_var)

        # Add job description to format args if available and needed
        format_args = {
            "text_input": text_input,
            "json_dump": json.dumps(all_schemas[section]["json_schema"], indent=2),
        }

        if (
            job_desc
            and job_desc.strip()
            and f"TAILORED_{section.upper()}_HP" in globals()
        ):
            format_args["job_description"] = job_desc
            format_args["role"] = role_title

        messages = [
            SystemMessage(content=sp),
            HumanMessage(content=hp.format(**format_args)),
        ]

        response = llm.invoke(messages, functions=[all_schemas[section]["json_schema"]])
        structured_data = response.additional_kwargs["function_call"]["arguments"]
        json_structured_data = json.loads(structured_data)

        return json_structured_data

    with open("data/all_schemas.json", "r") as file:
        all_schemas = json.load(file)

    res_dict = dict()

    log("Loading...")
    # Process experience with job description if available and not empty
    if job_description and job_description.strip():
        res_dict["experience"] = call_tailored_experience_chain(
            pdf_text, job_description, role_title, llm
        )
        log(f"\t>> Completed key: experience (tailored for {role_title})")
    else:
        res_dict["experience"] = experience_chain(pdf_text, llm)
        log(f"\t>> Completed key: experience")

    # Process other sections
    for key in all_schemas.keys():
        res_dict[key] = call_llm(all_schemas, key, pdf_text, job_description)
        log(f"\t>> Completed key: {key}")
    progress_bar.progress(base_progress + file_progress_weight * 0.4)

    # For testing
    data = {
        "structured_data": structured_data,
        "years_exp": years_exp,
        "profile": profile,
        "res_dict": res_dict,
        "job_description": job_description if job_description else "None provided",
    }
    with open("resume_data.json", "w") as json_file:
        json.dump(data, json_file, indent=4)

    print("Data saved to resume_data.json")

    # Pass job description and role title to generate_resume
    generate_resume(
        structured_data, years_exp, profile, res_dict, job_description, role_title
    )


def call_tailored_experience_chain(pdf_text, job_description, role, llm):
    """Modified experience chain that incorporates job description"""

    with open("data/experience_schema.json", "r") as file:
        exp_schemas = json.load(file)

    current_date = datetime.datetime.now().date()

    # First get general experience
    messages = [
        SystemMessage(content=GENERAL_EXPERIENCE_SP),
        HumanMessage(
            content=(
                GENERAL_EXPERIENCE_HP.format(
                    text_input=pdf_text,
                    json_dump=json.dumps(
                        exp_schemas["general_experience"]["json_schema"], indent=2
                    ),
                )
                + f"\n\nCurrent Date: {current_date}"
            )
        ),
    ]

    response = llm.invoke(
        messages, functions=[exp_schemas["general_experience"]["json_schema"]]
    )
    structured_data = response.additional_kwargs["function_call"]["arguments"]
    general_exp_output_json = json.loads(structured_data)

    # Then use tailored experience prompt with job description
    messages = [
        SystemMessage(content=TAILORED_SEP_EXPERIENCE_SP),
        HumanMessage(
            content=(
                TAILORED_SEP_EXPERIENCE_HP.format(
                    text_input=json.dumps(general_exp_output_json, indent=2),
                    json_dump=json.dumps(
                        exp_schemas["sep_experience"]["json_schema"], indent=2
                    ),
                    job_description=job_description,
                    role=role,
                )
                + f"\n\nCurrent Date: {current_date}"
            )
        ),
    ]
    response = llm.invoke(
        messages, functions=[exp_schemas["sep_experience"]["json_schema"]]
    )
    structured_data = response.additional_kwargs["function_call"]["arguments"]
    json_structured_data = json.loads(structured_data)

    # Define the filename where you want to store the data
    filename = "structured_experience.json"

    modified_cgi_experience = []
    for entry in json_structured_data["cgi_experience"]:
        modified_entry = {f"cgi_{key}": value for key, value in entry.items()}
        modified_cgi_experience.append(modified_entry)
    json_structured_data["cgi_experience"] = modified_cgi_experience

    # Write the JSON data to the file
    with open(filename, "w") as file:
        json.dump(
            json_structured_data, file, indent=2
        )  # Use json.dump to format the data and write to the file

    return json_structured_data
