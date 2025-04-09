from openai import AzureOpenAI
from langchain_openai import AzureChatOpenAI
from langchain.schema import SystemMessage, HumanMessage
from langchain_community.document_loaders import PyPDFLoader
from src.logs_manager import log
from src.resume_generator import generate_resume
import os
import json
import datetime
from dotenv import load_dotenv

def resume_stream(st, file_path):
    load_dotenv()
    
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

    pdf_text = "\n".join([doc.page_content for doc in  pages])

    current_date = datetime.datetime.now().date()

    with open('data/json_schema.json', 'r') as file:  # Updated path
        json_schema = json.load(file)

    messages = [
        SystemMessage(
            content="You are an AI that extracts structured information from plain text resumes and returns JSON output."
        ),
        HumanMessage(
            content=(
                f"Extract and structure the following text into JSON format:\n\n{pdf_text}\n\n"
                f"Ensure the response matches this schema:\n{json.dumps(json_schema, indent=2)}"
            )
        ),
    ]

    response = llm.invoke(messages, functions=[json_schema])
    structured_data = response.additional_kwargs["function_call"]["arguments"]
    structured_data = json.loads(structured_data)
    
    log("Completed Structured Data")
    # return structured_data

    ### Professional Summary
    messages = [
        SystemMessage(
            content="You are an AI that takes structured resumes in JSON format and writes a compelling, professional summary of the applicant."
        ),
        HumanMessage(
            content=(
                "Using the following structured resume data in JSON format:\n\n"
                f"{structured_data}\n\n"
                "Write a well-crafted, three-paragraph professional profile of the applicant in the third person. "
                "Keep a good balance of detailed and concise. Do not use AI-isms"
                "Incorporate their professional summary, work experience, education, skills, certifications, and any notable achievements. "
                "Highlight their expertise, impact, and technical skills, ensuring the profile flows naturally and is engaging."
            )
        ),
    ]


    response = llm.invoke(messages, functions=[json_schema])

    profile = response.content.strip()

    # Years of Experience
    messages = [
        SystemMessage(
            content="You are an AI that takes in a professional summary and determines the applicants years of experience."
        ),
        HumanMessage(
            content=(
                "Using the following professional summary:\n\n"
                f"{profile}\n\n"
                "Write a very concise header desribing their experience in the following format:\n <X> years experience in <X_category>\nex: 5 years of experience in Software Development"
            )
        ),
    ]


    # Call the LLM with function calling enabled
    response = llm.invoke(messages, functions=[json_schema])

    years_exp = response.content.strip()

    def call_llm(overall, section, text_input=pdf_text):
        messages = [
            SystemMessage(
                content=overall[section]['system_prompt']
            ),
            HumanMessage(
                content=(overall[section]['human_prompt'].format(text_input=text_input, json_dump=json.dumps(overall[section]['json_schema'], indent=2)))
            ), 
        ]
        response = llm.invoke(messages, functions=[overall[section]['json_schema']])
        structured_data = response.additional_kwargs["function_call"]["arguments"]
        json_structured_data = json.loads(structured_data)
        
        return json_structured_data
    
    with open("data/overall.json", 'r') as file:
        overall = json.load(file)
    
    res_dict = dict()

    log("Loading...")
    for key in overall.keys():
        res_dict[key] = call_llm(overall, key, pdf_text)
        log(f"\t>> Completed key: {key}")

    generate_resume(structured_data, years_exp, profile, res_dict)
