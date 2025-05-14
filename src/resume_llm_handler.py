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
from dotenv import load_dotenv
from data.prompts import *

# Import additional RAG-related libraries
from langchain_community.vectorstores import FAISS
from langchain.text_splitter import CharacterTextSplitter
from langchain_openai import AzureOpenAIEmbeddings
from langchain_core.prompts import ChatPromptTemplate
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains import create_retrieval_chain
import traceback


def generate_rag_job_description(llm, file_path, role_title):
    """
    Uses RAG to analyze an RFP document and generate a comprehensive job description.
    """
    try:
        log(
            f"Generating job description from RFP file using RAG for role: {role_title}"
        )

        # Load the PDF
        loader = PyPDFLoader(file_path)
        pages = loader.load()
        pdf_text = "\n".join([doc.page_content for doc in pages])

        # Split text into chunks
        text_splitter = CharacterTextSplitter(chunk_size=3000, chunk_overlap=100)
        documents = text_splitter.split_text(pdf_text)

        # Ensure documents are clean and valid
        documents = [
            doc for doc in documents if doc and isinstance(doc, str) and doc.strip()
        ]

        if not documents:
            log("Warning: No valid text extracted from the document")
            return ""

        # Create embeddings with proper deployment
        embeddings = AzureOpenAIEmbeddings(
            model="text-embedding-3-large",
            azure_endpoint=os.environ["AZURE_OPENAI_EMBEDDINGS_ENDPOINT"],
            api_key=os.environ["AZURE_OPENAI_API_KEY"],
        )

        # Log for debugging
        log(f"Creating vector store with {len(documents)} document chunks")

        # Create vector store
        vector_store = FAISS.from_texts(documents, embeddings)
        retriever = vector_store.as_retriever()

        # Create prompt
        prompt = ChatPromptTemplate.from_messages(
            [
                ("system", RFP_SP),
                ("human", RFP_HP),
            ]
        )

        # Create and execute retrieval chain
        question_answer_chain = create_stuff_documents_chain(llm, prompt)
        chain = create_retrieval_chain(retriever, question_answer_chain)

        # Invoke with the specific role
        log(f"Executing RAG retrieval chain for {role_title}")
        response = chain.invoke({"input": role_title})
        job_description = response["answer"]

        log(
            f"Successfully generated job description from RFP ({len(job_description)} chars)"
        )
        return job_description

    except Exception as e:
        log(f"Error generating job description from RFP: {str(e)}")
        log(traceback.format_exc())  # Corrected to format_exc() to get string
        return ""


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
    selected_format,  # Changed from selected_role to selected_format
    custom_role_title="",
    job_description="",
    rfp_file_path=None,  # Added parameter for RFP file
):
    load_dotenv()

    llm = AzureChatOpenAI(
        azure_endpoint=os.environ["AZURE_OPENAI_ENDPOINT"],
        api_key=os.environ["AZURE_OPENAI_API_KEY"],
        api_version="2024-12-01-preview",
        deployment_name="gpt-4o",
        model="gpt-4o",  # Ensure function calling support
    )

    # If RFP file is provided, generate a job description from it
    if rfp_file_path and os.path.exists(rfp_file_path):
        log(f"RFP file detected: {rfp_file_path}")
        # Determine role title to use for the RAG job description generation
        role_for_rag = (
            custom_role_title.strip() if custom_role_title else selected_format
        )  # Changed from selected_role

        # Generate job description from RFP
        rfp_job_description = generate_rag_job_description(
            llm, rfp_file_path, role_for_rag
        )

        # If successful and user didn't provide a job description, use the generated one
        if rfp_job_description and not (job_description and job_description.strip()):
            log("Using RFP-generated job description")
            job_description = rfp_job_description
        # If user provided a job description, combine it with the RFP-generated one
        elif rfp_job_description and job_description and job_description.strip():
            log(
                "Combining user-provided job description with RFP-generated description"
            )
            job_description = f"{job_description}\n\nAdditional requirements from RFP:\n{rfp_job_description}"

    # Update progress
    progress_bar.progress(base_progress + file_progress_weight * 0.1)

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

    custom_role_title_string = (
        f"\nAnd considering the target role type of {custom_role_title}, aligning with the general role type, while being more general:\n"
        if custom_role_title
        else ""
    )

    # Generate an appropriate role title if not provided by user
    if not custom_role_title or not custom_role_title.strip():
        role_title = generate_llm_content(
            llm=llm,
            system_prompt=ROLE_TITLE_GEN_SP,
            human_prompt_template=ROLE_TITLE_GEN_HP,
            format_args={
                "structured_data": json.dumps(structured_data, indent=2),
                "custom_role_title_string": custom_role_title_string,
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
                role_title = selected_format.title()  # Changed from selected_role
                break
    else:
        role_title = custom_role_title.strip()
        log(f"Using provided role title: {role_title}")

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

    # Pass job description, role title, and format type to generate_resume
    generate_resume(
        structured_data,
        years_exp,
        profile,
        res_dict,
        job_description,
        role_title,
        selected_format,  # Add selected_format parameter
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
