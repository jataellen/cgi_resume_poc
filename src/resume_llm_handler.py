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
        human_content = human_prompt_template.format(**format_args)

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


def resume_stream(st, progress_bar, base_progress, file_progress_weight, file_path):
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

    # Generate profile
    profile = generate_llm_content(
        llm=llm,
        system_prompt=SUMMARY_SP,
        human_prompt_template=SUMMARY_HP,
        format_args={"structured_data": structured_data},
        functions=[json_schema],
    )

    # Generate years of experience
    years_exp = generate_llm_content(
        llm=llm,
        system_prompt=PROFILE_SP,
        human_prompt_template=PROFILE_HP,
        format_args={"profile": profile},
    )

    def call_llm(overall, section, text_input=pdf_text):
        messages = [
            SystemMessage(content=overall[section]["system_prompt"]),
            HumanMessage(
                content=(
                    overall[section]["human_prompt"].format(
                        text_input=text_input,
                        json_dump=json.dumps(overall[section]["json_schema"], indent=2),
                    )
                )
            ),
        ]
        response = llm.invoke(messages, functions=[overall[section]["json_schema"]])
        structured_data = response.additional_kwargs["function_call"]["arguments"]
        json_structured_data = json.loads(structured_data)

        return json_structured_data

    with open("data/overall.json", "r") as file:
        overall = json.load(file)

    res_dict = dict()

    log("Loading...")
    for key in overall.keys():
        res_dict[key] = call_llm(overall, key, pdf_text)
        log(f"\t>> Completed key: {key}")
    progress_bar.progress(base_progress + file_progress_weight * 0.4)
    generate_resume(structured_data, years_exp, profile, res_dict)
