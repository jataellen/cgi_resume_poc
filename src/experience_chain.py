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


def experience_chain(pdf_text, llm):
    text_input = pdf_text

    with open("data/experience_schema.json", "r") as file:
        exp_schemas = json.load(file)

    current_date = datetime.datetime.now().date()
    # human_content = (
    #     human_prompt_template.format(**format_args)
    #     + f"\n\nCurrent Date: {current_date}"
    # )

    messages = [
        SystemMessage(content=GENERAL_EXPERIENCE_SP),
        HumanMessage(
            content=(
                GENERAL_EXPERIENCE_HP.format(
                    text_input=text_input,
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

    messages = [
        SystemMessage(content=SEP_EXPERIENCE_SP),
        HumanMessage(
            content=(
                SEP_EXPERIENCE_HP.format(
                    text_input=json.dumps(general_exp_output_json, indent=2),
                    json_dump=json.dumps(
                        exp_schemas["sep_experience"]["json_schema"], indent=2
                    ),
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
