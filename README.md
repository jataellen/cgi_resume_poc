# Project Name

A brief description of your project and its purpose.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

## Installation

Explain how to install or set up your project. For example:

```bash
# Clone this repository
git clone https://github.com/jataellen/cgi_resume_poc

# Navigate to the project directory
cd cgi_resume_poc

# Set up Virtual env
python -m venv rg-venv

.\rg-venv\Scripts\activate

pip install -r requirements.txt

# Set .env in resumegenie-frontend
cd resumegenie-frontend
npm install
npm start

# Set .env in backend
cd backend
uvicorn main:app --host localhost --port 8000 --reload

