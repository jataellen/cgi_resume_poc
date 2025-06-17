def replicate_section(doc, start_tag, end_tag, replacements, times_to_repeat):
    """
    Duplicates the section between start_tag and end_tag (inclusive), replacing the tags with specified values.
    """
   
    para_group = []
    inside_section = False
    end_para = None
    
    for paragraph in doc.paragraphs:
        if start_tag in paragraph.text:
            inside_section = True
            paragraph.text = paragraph.text.replace(f"{start_tag}", "")
        if inside_section:
            para_group.append(paragraph)
        if end_tag in paragraph.text and inside_section:
            end_para = paragraph
            inside_section = False
            paragraph.text = paragraph.text.replace(f"{end_tag}", "")
            break 
    
    end_para = end_para._p
    for i in range(times_to_repeat):
        new_para_lst = []
        for paragraph in para_group:
            paragraph.text = paragraph.text.replace(f"{start_tag}", "")
            paragraph.text = paragraph.text.replace(f"{end_tag}", "")
            
            new_paragraph = doc.add_paragraph()
            new_paragraph.alignment = paragraph.alignment
            new_paragraph.style = paragraph.style
            

            new_paragraph.text = paragraph.text    
            new_para_lst.append(new_paragraph)
            
        for para in new_para_lst:
            end_para.addnext(para._p)
            end_para = para._p