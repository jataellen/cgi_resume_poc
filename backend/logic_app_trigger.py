import requests

def trigger_logic_app(evaluation_json: dict, user_email: str):
    score = evaluation_json.get("overall_score", 0)

    flagged_sections = [
        section for section, data in evaluation_json.items()
        if isinstance(data, dict) and data.get("flag", False)
    ]

    recommendations = evaluation_json.get("recommendations", [])[:3]
    priority_fixes = evaluation_json.get("priority_fixes", [])[:3]

    payload = {
        "score": score,
        "flagged_sections": flagged_sections,
        "email": user_email,
        "recommendations": recommendations,
        "priority_fixes": priority_fixes
    }

    logic_app_url = "https://your-logic-app-url"  # Replace with your Logic App endpoint
    headers = {"Content-Type": "application/json"}

    try:
        response = requests.post(logic_app_url, json=payload, headers=headers)
        print(f"Logic App Triggered: Status {response.status_code}")
        return response.status_code, response.text
    except Exception as e:
        print(f"Error triggering Logic App: {e}")
        return 500, str(e)
