from spire.doc import *
from spire.doc.common import *
import os
import sys
import tempfile


# Function to convert a single DOCX file to PDF
def convert_docx_to_pdf(uploaded_file, temp_file_path, pdf_file_path):
    # Save the uploaded DOCX file temporarily
    with open(temp_file_path, "wb") as f:
        f.write(uploaded_file.getbuffer())

    print(f"File saved as: {temp_file_path}")

    try:
        # Set up font environment before loading document
        # Force Spire to recognize system fonts
        if sys.platform == "win32":
            # On Windows, ensure Windows fonts are available
            win_font_path = os.path.join(os.environ["WINDIR"], "Fonts")
            os.environ["FONT_PATH"] = win_font_path
        else:
            # On Linux/Mac, try common font locations
            common_font_paths = [
                "/usr/share/fonts",
                "/usr/local/share/fonts",
                "/Library/Fonts",
                os.path.expanduser("~/.fonts"),
            ]
            for path in common_font_paths:
                if os.path.exists(path):
                    os.environ["FONT_PATH"] = path
                    break

        # Create document with pre-loaded font fallback
        document = Document()

        # Use section manipulation to handle fonts (more reliable than document-level settings)
        document.LoadFromFile(temp_file_path)

        # Create a completely new document for safety
        new_doc = Document()

        # Copy sections with font substitution
        for section_idx in range(document.Sections.Count):
            original_section = document.Sections[section_idx]
            new_section = new_doc.AddSection()

            # Copy the content with minimal formatting
            for para_idx in range(original_section.Paragraphs.Count):
                original_para = original_section.Paragraphs[para_idx]
                new_para = new_section.AddParagraph()

                # Use a simple text extraction and reinsertion with safe font
                text_content = original_para.Text
                new_para.AppendText(text_content)

                # Ensure safe font that exists on most systems
                for i in range(new_para.ChildObjects.Count):
                    if isinstance(new_para.ChildObjects[i], TextRange):
                        text_range = new_para.ChildObjects[i]
                        text_range.CharacterFormat.FontName = "Arial"

        # Save using compatibility mode
        new_doc.SaveToFile(pdf_file_path, FileFormat.PDF)
        new_doc.Close()
        document.Close()

        # If direct PDF conversion fails, try intermediate HTML approach
        if not os.path.exists(pdf_file_path) or os.path.getsize(pdf_file_path) == 0:
            # Plan B: Convert to HTML then PDF
            html_path = f"{os.path.splitext(pdf_file_path)[0]}.html"
            document = Document()
            document.LoadFromFile(temp_file_path)
            document.SaveToFile(html_path, FileFormat.Html)
            document.Close()

            # Load HTML and convert to PDF
            doc_html = Document()
            doc_html.LoadFromFile(html_path)
            doc_html.SaveToFile(pdf_file_path, FileFormat.PDF)
            doc_html.Close()

            # Clean up intermediate file
            if os.path.exists(html_path):
                os.remove(html_path)

        return pdf_file_path

    except Exception as e:
        print(f"Error in conversion: {str(e)}")
        # Last resort - return the original file path if conversion fails
        return temp_file_path


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
