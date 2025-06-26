# from spire.doc import *
# from spire.doc.common import *
# from docx import Document as DocxDocument
import io
import os
import traceback
from src.logs_manager import log


# Function to convert a single DOCX file to PDF using Spire.Doc
def convert_docx_to_pdf(uploaded_file, temp_file_path, pdf_file_path):
    return
    try:
        # Save the uploaded DOCX file temporarily
        with open(temp_file_path, "wb") as f:
            f.write(uploaded_file.getbuffer())

        log(f"File saved as: {temp_file_path}")

        document = Document()
        document.LoadFromFile(temp_file_path)

        document.SaveToFile(pdf_file_path, FileFormat.PDF)
        document.Close()

        return pdf_file_path
    except Exception as e:
        log(f"Error in convert_docx_to_pdf: {str(e)}")
        log(traceback.format_exc())
        # Clean up any partial files
        for path in [temp_file_path, pdf_file_path]:
            if os.path.exists(path):
                try:
                    os.remove(path)
                    log(f"Cleaned up partial file: {path}")
                except Exception:
                    pass
        raise  # Re-raise the exception to be caught by the caller


def change_all_fonts(uploaded_file):
    return
    try:
        # Create a BytesIO object from the uploaded file's buffer
        file_buffer = io.BytesIO(uploaded_file.getbuffer())

        # Load the document with python-docx
        doc = DocxDocument(file_buffer)

        # Change font for all runs in all paragraphs
        for paragraph in doc.paragraphs:
            for run in paragraph.runs:
                run.font.name = "Times New Roman"

        # Change font in table cells
        for table in doc.tables:
            for row in table.rows:
                for cell in row.cells:
                    for paragraph in cell.paragraphs:
                        for run in paragraph.runs:
                            run.font.name = "Times New Roman"

        # Change font in headers and footers
        for section in doc.sections:
            for header in section.header.paragraphs:
                for run in header.runs:
                    run.font.name = "Times New Roman"

            for footer in section.footer.paragraphs:
                for run in footer.runs:
                    run.font.name = "Times New Roman"

        # Save the modified document to a new BytesIO object
        output_buffer = io.BytesIO()
        doc.save(output_buffer)
        output_buffer.seek(0)  # Reset the buffer position to the beginning

        # Create a new FileStorage-like object with the modified document
        class ModifiedFile:
            def __init__(self, file_buffer, orig_file):
                self.buffer = file_buffer
                self.type = orig_file.type

            def getbuffer(self):
                return self.buffer.getvalue()

            def read(self):
                return self.buffer.read()

        return ModifiedFile(output_buffer, uploaded_file)
    except Exception as e:
        log(f"Error in change_all_fonts: {str(e)}")
        log(traceback.format_exc())
        # If font changing fails, return the original file
        log("Returning original file without font changes")
        return uploaded_file


def convert_to_pdf(uploaded_file, file_id):
    """
    Convert an uploaded file to PDF format. Handles both DOCX and PDF files.

    Args:
        uploaded_file: The uploaded file object
        file_id: A unique identifier for temp file naming

    Returns:
        str: Path to the PDF file

    Raises:
        Exception: If conversion fails
    """
    return
    # Define file paths
    base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    temp_file_path = os.path.join(base_path, f"temp_{file_id}.docx")
    pdf_file_path = os.path.join(base_path, f"temp_{file_id}.pdf")

    log(f"Preparing to process file with id {file_id}")

    try:
        if (
            uploaded_file.type
            == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ):
            log(f"Detected DOCX file: {uploaded_file.name}")

            try:
                # Change all fonts to Times New Roman
                modified_file = change_all_fonts(uploaded_file)
                log("Font changes applied")
            except Exception as e:
                log(
                    f"Warning: Font changing failed: {str(e)}. Continuing with original file."
                )
                modified_file = uploaded_file

            try:
                # Convert to PDF
                pdf_file_path = convert_docx_to_pdf(
                    modified_file, temp_file_path, pdf_file_path
                )
                log(f"Successfully converted to PDF: {pdf_file_path}")
            except Exception as e:
                log(f"Error in DOCX to PDF conversion: {str(e)}")
                raise Exception(f"Failed to convert DOCX to PDF: {str(e)}")
        else:
            # Assume it's already a PDF
            log(f"Detected PDF file: {uploaded_file.name}")
            with open(pdf_file_path, "wb") as f:
                f.write(uploaded_file.read())
            log(f"Saved PDF file: {pdf_file_path}")

        # Verify the file was created
        if not os.path.exists(pdf_file_path):
            raise Exception(f"PDF file was not created at {pdf_file_path}")

        return pdf_file_path

    except Exception as e:
        log(f"Error in convert_to_pdf: {str(e)}")
        log(traceback.format_exc())

        # Clean up any temporary files
        for path in [temp_file_path, pdf_file_path]:
            if os.path.exists(path):
                try:
                    os.remove(path)
                    log(f"Cleaned up temporary file: {path}")
                except Exception:
                    pass

        raise Exception(f"Failed to process file: {str(e)}")
