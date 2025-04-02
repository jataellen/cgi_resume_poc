def handle_skills_summary(doc, replacements, res_dict_skills):
    for key, value in replacements:
        for table in doc.tables:
            for row in table.rows:
                if any(key in para.text for cell in row.cells for para in cell.paragraphs):
                    cleaned_key = key.replace("{", "").replace("}", "")
                    times_to_repeat = len(res_dict_skills[cleaned_key]) - 1
                    for _ in range(times_to_repeat):
                        new_row = table.add_row()
                        for i, new_cell in enumerate(new_row.cells):
                            old_para = row.cells[i].paragraphs[0]
                            new_cell.text = old_para.text
                            new_cell.paragraphs[0].style = old_para.style
                        row._tr.addnext(new_row._tr)

def replace_text_in_table(doc, replacements, res_dict):
    """
    Replaces text in a DOCX file, and replicates sections based on the specified start and end tags.
    """
    for key, value in replacements:
        for table in doc.tables:
            for row in table.rows:
                for cell in row.cells:
                    replacement_made = False
                    for paragraph in cell.paragraphs:
                        if key in paragraph.text:
                            paragraph.text = paragraph.text.replace(key, value)
                            replacement_made = True
                            break
                    if replacement_made:
                        break  
                if replacement_made:
                    break 
            if replacement_made:
                break  
