from src.logs_manager import log


def replace_text_in_docx(doc, replacements):
    """
    Replaces text in a DOCX file, and replicates sections based on the specified start and end tags.
    """
    filtered_replacements = [(el[0], el[1]) for el in replacements]

    # {k: v for k, v in el if v is not None for el in}
    for key, value in filtered_replacements:
        log(f"Working on key: {key}")
        # st.write(f"Working on key: {key}\nValue: {value}")
        for paragraph in doc.paragraphs:

            if key in paragraph.text:
                # print(key,value)
                if isinstance(value, list):
                    paragraph.style = "ListBullet"

                    x_par = paragraph._p
                    if len(value) > 1:
                        paragraph.text = paragraph.text.replace(key, value[0])
                        value = value[1:]
                        for bp in value[::-1]:
                            para = doc.add_paragraph(bp, style="ListBullet")
                            x_par.addnext(para._p)
                else:
                    paragraph.text = paragraph.text.replace(key, value)
                break

        for table in doc.tables:
            for row in table.rows:
                for cell in row.cells:
                    for paragraph in cell.paragraphs:
                        if key in paragraph.text:
                            if isinstance(value, list):
                                paragraph.style = "ListBullet"
                                x_par = paragraph._p
                                paragraph.text = paragraph.text.replace(key, value[0])
                                value = value[1:]
                                for bp in value:
                                    para = doc.add_paragraph(bp, style="ListBullet")
                                    x_par.addnext(para._p)
                            else:
                                paragraph.text = paragraph.text.replace(key, value)
                            break
