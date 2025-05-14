from spire.doc import *
from spire.doc.common import *


# Function to convert a single DOCX file to PDF
def convert_docx_to_pdf(uploaded_file, temp_file_path, pdf_file_path):
    # Save the uploaded DOCX file temporarily
    with open(temp_file_path, "wb") as f:
        f.write(uploaded_file.getbuffer())

    print(f"File saved as: {temp_file_path}")

    # Create document object
    document = Document()

    # Load the file first - we'll handle font issues afterward
    document.LoadFromFile(temp_file_path)

    # Try to handle font substitution gracefully
    try:
        # For newer versions of Spire.Doc
        font_settings = document.GetFontSettings()
        if font_settings is not None:
            font_settings.DefaultFontName = "Arial"
    except:
        # Older versions might not have this API
        pass

    # Save to PDF with basic format settings
    # Just use the simple FileFormat approach which works in all versions
    document.SaveToFile(pdf_file_path, FileFormat.PDF)

    document.Close()
    return pdf_file_path


def convert_to_pdf(uploaded_file, file_id):
    temp_file_path = f"./temp_{file_id}.docx"
    pdf_file_path = f"./temp_{file_id}.pdf"

    if (
        uploaded_file.type
        == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ):
        pdf_file_path = convert_docx_to_pdf(
            uploaded_file, temp_file_path, pdf_file_path
        )
    else:
        with open(pdf_file_path, "wb") as f:
            f.write(uploaded_file.read())
    return pdf_file_path
