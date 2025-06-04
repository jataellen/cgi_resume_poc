import json
import os
from datetime import datetime

# Try to import reportlab, handle gracefully if not available
try:
    from reportlab.lib.pagesizes import letter, A4
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.lib import colors
    from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False
    print("Warning: reportlab not installed. PDF generation will be disabled.")

def generate_evaluation_pdf(evaluation_data, output_path, resume_name="Resume"):
    """
    Generate an enhanced PDF report from resume evaluation data
    """
    
    if not REPORTLAB_AVAILABLE:
        print("PDF generation skipped: reportlab not installed")
        text_output_path = output_path.replace('.pdf', '.txt')
        generate_enhanced_evaluation_text(evaluation_data, text_output_path, resume_name)
        return text_output_path
    
    # Create the PDF document
    doc = SimpleDocTemplate(output_path, pagesize=A4, 
                          rightMargin=72, leftMargin=72, 
                          topMargin=72, bottomMargin=18)
    
    # Get sample stylesheet and create custom styles
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        spaceAfter=30,
        alignment=TA_CENTER,
        textColor=colors.darkblue
    )
    
    section_style = ParagraphStyle(
        'SectionHeader',
        parent=styles['Heading2'],
        fontSize=16,
        spaceAfter=12,
        spaceBefore=20,
        textColor=colors.darkblue,
        borderWidth=1,
        borderColor=colors.darkblue,
        borderPadding=5
    )
    
    subsection_style = ParagraphStyle(
        'SubsectionHeader',
        parent=styles['Heading3'],
        fontSize=14,
        spaceAfter=8,
        spaceBefore=12,
        textColor=colors.blue
    )
    
    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontSize=11,
        spaceAfter=6,
        alignment=TA_JUSTIFY
    )
    
    warning_style = ParagraphStyle(
        'WarningStyle',
        parent=styles['Normal'],
        fontSize=11,
        spaceAfter=6,
        textColor=colors.red,
        backColor=colors.lightyellow,
        borderColor=colors.red,
        borderWidth=1,
        borderPadding=5
    )
    
    # Build the document content
    story = []
    
    # Title
    story.append(Paragraph("Resume Evaluation Report", title_style))
    story.append(Spacer(1, 12))
    
    # Header information
    overall_score = evaluation_data.get('overall_score', 0)
    header_data = [
        ["Resume:", resume_name],
        ["Evaluation Date:", datetime.now().strftime("%B %d, %Y")],
        ["Overall Score:", f"{overall_score:.1f}/10"]
    ]
    
    header_table = Table(header_data, colWidths=[2*inch, 4*inch])
    header_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    story.append(header_table)
    story.append(Spacer(1, 20))
    
    # Overall Score Section
    story.append(Paragraph("Overall Assessment", section_style))
    
    if isinstance(overall_score, (int, float)):
        score_text = f"<b>Overall Score: {overall_score:.1f}/10</b><br/><br/>"
        
        # Score interpretation
        if overall_score >= 8:
            interpretation = "Excellent - This resume demonstrates strong qualifications and presentation."
        elif overall_score >= 6:
            interpretation = "Good - This resume shows solid qualifications with room for improvement."
        elif overall_score >= 4:
            interpretation = "Fair - This resume needs significant improvements to be competitive."
        else:
            interpretation = "Poor - This resume requires major revisions across multiple areas."
            
        score_text += f"<i>{interpretation}</i>"
        story.append(Paragraph(score_text, normal_style))
    
    story.append(Spacer(1, 15))
    
    # Critical Issues Section (if present)
    if 'critical_issues_identified' in evaluation_data and evaluation_data['critical_issues_identified']:
        story.append(Paragraph("🚨 Critical Issues Requiring Immediate Attention", 
                              ParagraphStyle('CriticalHeader', parent=styles['Heading2'], 
                                           fontSize=16, textColor=colors.red)))
        for issue in evaluation_data['critical_issues_identified']:
            story.append(Paragraph(f"• {issue}", warning_style))
        story.append(Spacer(1, 15))
    
    # Experience Analysis Section
    if 'experience_analysis' in evaluation_data:
        exp_analysis = evaluation_data['experience_analysis']
        story.append(Paragraph("Experience Section Analysis", 
                              ParagraphStyle('ExpHeader', parent=styles['Heading2'])))
        
        if exp_analysis.get('employment_gaps'):
            story.append(Paragraph("⚠️ Employment Gaps Identified:", 
                                 ParagraphStyle('SubWarning', parent=styles['Heading3'], 
                                              textColor=colors.orange)))
            for gap in exp_analysis['employment_gaps']:
                story.append(Paragraph(f"• {gap}", normal_style))
        
        if exp_analysis.get('weak_descriptions'):
            story.append(Paragraph("📝 Roles Needing More Detail:", 
                                 ParagraphStyle('SubWarning', parent=styles['Heading3'], 
                                              textColor=colors.orange)))
            for role in exp_analysis['weak_descriptions']:
                story.append(Paragraph(f"• {role}", normal_style))
        
        story.append(Spacer(1, 15))
    
    # Role Alignment Assessment
    if 'role_alignment_assessment' in evaluation_data:
        role_assess = evaluation_data['role_alignment_assessment']
        story.append(Paragraph("Role Alignment Assessment", 
                              ParagraphStyle('RoleHeader', parent=styles['Heading2'])))
        
        story.append(Paragraph(f"Apparent Target Role: <b>{role_assess.get('apparent_target_role', 'Not clearly defined')}</b>", 
                              normal_style))
        story.append(Paragraph(f"Alignment Quality: <b>{role_assess.get('alignment_quality', 'Unknown')}</b>", 
                              normal_style))
        
        if role_assess.get('role_specific_recommendations'):
            story.append(Paragraph("Role-Specific Recommendations:", 
                                 ParagraphStyle('SubHeader', parent=styles['Heading3'])))
            for rec in role_assess['role_specific_recommendations']:
                story.append(Paragraph(f"• {rec}", normal_style))
        
        story.append(Spacer(1, 15))
    
    # Projects Analysis
    if 'Projects' in evaluation_data and 'projects_needing_detail' in evaluation_data['Projects']:
        projects_data = evaluation_data['Projects']
        if projects_data.get('projects_needing_detail'):
            story.append(Paragraph("📋 Projects Requiring More Detail", 
                                  ParagraphStyle('ProjectHeader', parent=styles['Heading2'], 
                                               textColor=colors.blue)))
            for project in projects_data['projects_needing_detail']:
                story.append(Paragraph(f"• {project}", normal_style))
            story.append(Spacer(1, 15))
    
    # Section Ratings Table
    if 'ratings_summary' in evaluation_data:
        story.append(Paragraph("Section Ratings", 
                              ParagraphStyle('RatingsHeader', parent=styles['Heading2'])))
        
        ratings_data = [["Section", "Rating", "Status"]]
        
        for section, rating in evaluation_data['ratings_summary'].items():
            status = "✅ Good" if rating >= 7 else "⚠️ Needs Work" if rating >= 5 else "🚨 Critical"
            ratings_data.append([
                section.replace('_', ' ').title(), 
                f"{rating:.1f}/10", 
                status
            ])
        
        ratings_table = Table(ratings_data, colWidths=[3*inch, 1.5*inch, 1.5*inch])
        ratings_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        story.append(ratings_table)
        story.append(Spacer(1, 20))
    
    # Grammar and Formatting Issues
    if 'grammar_and_formatting_issues' in evaluation_data and evaluation_data['grammar_and_formatting_issues']:
        story.append(Paragraph("✏️ Grammar and Formatting Issues", 
                              ParagraphStyle('GrammarHeader', parent=styles['Heading2'], 
                                           textColor=colors.purple)))
        for issue in evaluation_data['grammar_and_formatting_issues']:
            story.append(Paragraph(f"• {issue}", normal_style))
        story.append(Spacer(1, 15))
    
    # Priority Fixes
    if 'priority_fixes' in evaluation_data:
        story.append(Paragraph("🎯 Priority Fixes (In Order)", 
                              ParagraphStyle('PriorityHeader', parent=styles['Heading2'], 
                                           textColor=colors.darkgreen)))
        for i, fix in enumerate(evaluation_data['priority_fixes'], 1):
            story.append(Paragraph(f"{i}. {fix}", normal_style))
        story.append(Spacer(1, 15))
    
    # Detailed Section Feedback
    sections = [
        ('Profile/Professional Summary', 'Profile/Professional Summary'),
        ('Skills', 'Skills'),
        ('Experience', 'Experience'),
        ('Education', 'Education'),
        ('Projects', 'Projects'),
        ('Volunteer Experience', 'Volunteer Experience'),
        ('Contact Information', 'Contact Information')
    ]
    
    story.append(Paragraph("Detailed Section Analysis", 
                          ParagraphStyle('DetailedHeader', parent=styles['Heading2'])))
    
    for section_key, section_title in sections:
        if section_key in evaluation_data:
            section_data = evaluation_data[section_key]
            
            story.append(Paragraph(f"{section_title}", 
                                 ParagraphStyle('SectionTitle', parent=styles['Heading3'], 
                                              spaceAfter=8, spaceBefore=12)))
            
            # Rating and flag
            rating = section_data.get('rating', 'N/A')
            flag = section_data.get('flag', False)
            flag_text = " 🚨 (CRITICAL)" if flag else ""
            
            story.append(Paragraph(f"<b>Rating: {rating}/10{flag_text}</b>", normal_style))
            story.append(Spacer(1, 8))
            
            # Things done well
            if 'things_done_well' in section_data:
                story.append(Paragraph("✅ Strengths:", 
                                     ParagraphStyle('StrengthHeader', parent=styles['Heading4'], 
                                                  textColor=colors.darkgreen)))
                for item in section_data['things_done_well']:
                    story.append(Paragraph(f"• {item}", normal_style))
                story.append(Spacer(1, 8))
            
            # Things done poorly
            if 'things_done_poorly' in section_data:
                story.append(Paragraph("⚠️ Areas for Improvement:", 
                                     ParagraphStyle('ImprovementHeader', parent=styles['Heading4'], 
                                                  textColor=colors.darkorange)))
                for item in section_data['things_done_poorly']:
                    story.append(Paragraph(f"• {item}", normal_style))
                story.append(Spacer(1, 15))
    
    # Overall recommendations
    if 'recommendations' in evaluation_data:
        story.append(Paragraph("📋 Overall Recommendations", 
                              ParagraphStyle('RecHeader', parent=styles['Heading2'])))
        for recommendation in evaluation_data['recommendations']:
            story.append(Paragraph(f"• {recommendation}", normal_style))
    
    # Build the PDF
    doc.build(story)
    return output_path

def generate_enhanced_evaluation_text(evaluation_data, output_path, resume_name="Resume"):
    """
    Generate enhanced text report with new evaluation features
    """
    content = []
    content.append("=" * 70)
    content.append("ENHANCED RESUME EVALUATION REPORT")
    content.append("=" * 70)
    content.append("")
    content.append(f"Resume: {resume_name}")
    content.append(f"Evaluation Date: {datetime.now().strftime('%B %d, %Y')}")
    
    overall_score = evaluation_data.get('overall_score', 0)
    content.append(f"Overall Score: {overall_score:.1f}/10")
    content.append("")
    
    # Critical issues first
    if 'critical_issues_identified' in evaluation_data and evaluation_data['critical_issues_identified']:
        content.append("🚨 CRITICAL ISSUES REQUIRING IMMEDIATE ATTENTION")
        content.append("-" * 50)
        for issue in evaluation_data['critical_issues_identified']:
            content.append(f"  • {issue}")
        content.append("")
    
    # Experience analysis
    if 'experience_analysis' in evaluation_data:
        exp_analysis = evaluation_data['experience_analysis']
        content.append("EXPERIENCE SECTION ANALYSIS")
        content.append("-" * 30)
        
        if exp_analysis.get('employment_gaps'):
            content.append("⚠️ Employment Gaps Identified:")
            for gap in exp_analysis['employment_gaps']:
                content.append(f"  • {gap}")
            content.append("")
        
        if exp_analysis.get('weak_descriptions'):
            content.append("📝 Roles Needing More Detail:")
            for role in exp_analysis['weak_descriptions']:
                content.append(f"  • {role}")
            content.append("")
        
        content.append(f"Recent Roles Detail Level: {exp_analysis.get('recent_roles_detail', 'Not assessed')}")
        content.append("")
    
    # Role alignment
    if 'role_alignment_assessment' in evaluation_data:
        role_assess = evaluation_data['role_alignment_assessment']
        content.append("ROLE ALIGNMENT ASSESSMENT")
        content.append("-" * 30)
        content.append(f"Apparent Target Role: {role_assess.get('apparent_target_role', 'Not clearly defined')}")
        content.append(f"Alignment Quality: {role_assess.get('alignment_quality', 'Unknown')}")
        
        if role_assess.get('role_specific_recommendations'):
            content.append("Role-Specific Recommendations:")
            for rec in role_assess['role_specific_recommendations']:
                content.append(f"  • {rec}")
        content.append("")
    
    # Projects analysis
    if 'Projects' in evaluation_data and 'projects_needing_detail' in evaluation_data['Projects']:
        projects_data = evaluation_data['Projects']
        if projects_data.get('projects_needing_detail'):
            content.append("📋 PROJECTS REQUIRING MORE DETAIL")
            content.append("-" * 35)
            for project in projects_data['projects_needing_detail']:
                content.append(f"  • {project}")
            content.append("")
    
    # Grammar and formatting issues
    if 'grammar_and_formatting_issues' in evaluation_data and evaluation_data['grammar_and_formatting_issues']:
        content.append("✏️ GRAMMAR AND FORMATTING ISSUES")
        content.append("-" * 35)
        for issue in evaluation_data['grammar_and_formatting_issues']:
            content.append(f"  • {issue}")
        content.append("")
    
    # Priority fixes
    if 'priority_fixes' in evaluation_data:
        content.append("🎯 PRIORITY FIXES (IN ORDER)")
        content.append("-" * 30)
        for i, fix in enumerate(evaluation_data['priority_fixes'], 1):
            content.append(f"  {i}. {fix}")
        content.append("")
    
    # Section ratings
    if 'ratings_summary' in evaluation_data:
        content.append("SECTION RATINGS")
        content.append("-" * 20)
        for section, rating in evaluation_data['ratings_summary'].items():
            status = "✅ Good" if rating >= 7 else "⚠️ Needs Work" if rating >= 5 else "🚨 Critical"
            content.append(f"  {section.replace('_', ' ').title()}: {rating:.1f}/10 {status}")
        content.append("")
    
    # Detailed section feedback
    sections = [
        ('Profile/Professional Summary', 'Profile/Professional Summary'),
        ('Skills', 'Skills'),
        ('Experience', 'Experience'),
        ('Education', 'Education'),
        ('Projects', 'Projects'),
        ('Volunteer Experience', 'Volunteer Experience'),
        ('Contact Information', 'Contact Information')
    ]
    
    content.append("DETAILED SECTION ANALYSIS")
    content.append("=" * 30)
    content.append("")
    
    for section_key, section_title in sections:
        if section_key in evaluation_data:
            section_data = evaluation_data[section_key]
            
            content.append(f"{section_title.upper()}")
            content.append("-" * len(section_title))
            
            rating = section_data.get('rating', 'N/A')
            flag = section_data.get('flag', False)
            flag_text = " 🚨 (CRITICAL)" if flag else ""
            
            content.append(f"Rating: {rating}/10{flag_text}")
            content.append("")
            
            if 'things_done_well' in section_data:
                content.append("✅ Strengths:")
                for item in section_data['things_done_well']:
                    content.append(f"  • {item}")
                content.append("")
            
            if 'things_done_poorly' in section_data:
                content.append("⚠️ Areas for Improvement:")
                for item in section_data['things_done_poorly']:
                    content.append(f"  • {item}")
                content.append("")
            
            content.append("")
    
    # Overall recommendations
    if 'recommendations' in evaluation_data:
        content.append("📋 OVERALL RECOMMENDATIONS")
        content.append("-" * 30)
        for recommendation in evaluation_data['recommendations']:
            content.append(f"  • {recommendation}")
        content.append("")
    
    # Summary
    content.append("SUMMARY")
    content.append("-" * 10)
    content.append(f"This enhanced evaluation identified specific issues that commonly affect resume effectiveness.")
    content.append(f"Overall score: {overall_score:.1f}/10")
    
    
    
    # Write to file
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(content))
    
    return output_path

def convert_evaluation_to_pdf(json_file_path, resume_name="Resume"):
    """
    Convert an existing evaluation JSON file to PDF
    
    Args:
        json_file_path (str): Path to the JSON evaluation file
        resume_name (str): Name of the resume
        
    Returns:
        str: Path to the generated PDF file
    """
    try:
        # Load the JSON data
        with open(json_file_path, 'r') as f:
            evaluation_data = json.load(f)
        
        # Generate PDF path
        if REPORTLAB_AVAILABLE:
            pdf_path = json_file_path.replace('.json', '.pdf')
        else:
            pdf_path = json_file_path.replace('.json', '.txt')
        
        # Generate the PDF/text file
        generate_evaluation_pdf(evaluation_data, pdf_path, resume_name)
        
        return pdf_path
        
    except Exception as e:
        print(f"Error converting evaluation to PDF/text: {str(e)}")
        return None

