import pandas as pd
import os
import json
from datetime import datetime

def generate_excel_reports(reports_dir, test_results, analytics):
    if not test_results:
        print("No test results to process.")
        return

    df_results = pd.DataFrame(test_results)
    
    # --- Generate Security Assessment Report ---
    assessment_path = os.path.join(reports_dir, 'SecurityAssessmentReport.xlsx')
    writer_assess = pd.ExcelWriter(assessment_path, engine='xlsxwriter')
    workbook_assess = writer_assess.book
    ws_assess = workbook_assess.add_worksheet('Security Findings')
    
    # Formats for Assessment Report
    header_format = workbook_assess.add_format({'bg_color': '#2c3e50', 'font_color': '#ffffff', 'bold': True, 'align': 'center', 'valign': 'vcenter', 'border': 1})
    data_format = workbook_assess.add_format({'align': 'left', 'valign': 'vcenter', 'border': 1, 'text_wrap': True})
    status_pass = workbook_assess.add_format({'bg_color': '#e8f8f5', 'font_color': '#27ae60', 'bold': True, 'align': 'center', 'border': 1})
    status_fail = workbook_assess.add_format({'bg_color': '#fdedec', 'font_color': '#c0392b', 'bold': True, 'align': 'center', 'border': 1})
    
    headers = ['Vulnerability ID', 'Severity', 'Module', 'Description', 'Risk Level', 'Affected Files', 'Recommended Fix', 'Status']
    ws_assess.set_column('A:A', 15)
    ws_assess.set_column('B:C', 15)
    ws_assess.set_column('D:D', 40)
    ws_assess.set_column('E:E', 15)
    ws_assess.set_column('F:G', 30)
    ws_assess.set_column('H:H', 15)
    
    for col_num, header in enumerate(headers):
        ws_assess.write(0, col_num, header, header_format)
        
    for row_num, item in enumerate(test_results, start=1):
        ws_assess.write(row_num, 0, item.get('Vulnerability ID', ''), data_format)
        ws_assess.write(row_num, 1, item.get('Severity', ''), data_format)
        ws_assess.write(row_num, 2, item.get('Module', ''), data_format)
        ws_assess.write(row_num, 3, item.get('Description', ''), data_format)
        ws_assess.write(row_num, 4, item.get('Risk Level', ''), data_format)
        ws_assess.write(row_num, 5, item.get('Affected Files', ''), data_format)
        ws_assess.write(row_num, 6, item.get('Recommended Fix', ''), data_format)
        status = item.get('Status', '')
        ws_assess.write(row_num, 7, status, status_pass if status == 'PASS' else status_fail)
        
    writer_assess.close()
    
    # --- Generate Security Analytics Report ---
    analytics_path = os.path.join(reports_dir, 'SecurityAnalytics.xlsx')
    writer_analytics = pd.ExcelWriter(analytics_path, engine='xlsxwriter')
    workbook_analytics = writer_analytics.book
    ws_analytics = workbook_analytics.add_worksheet('Analytics')
    
    title_format = workbook_analytics.add_format({'bg_color': '#34495e', 'font_color': '#ffffff', 'bold': True, 'font_size': 14, 'align': 'center', 'valign': 'vcenter'})
    label_format = workbook_analytics.add_format({'bg_color': '#ecf0f1', 'bold': True, 'border': 1})
    val_format = workbook_analytics.add_format({'align': 'center', 'border': 1})
    
    ws_analytics.set_column('A:B', 30)
    
    ws_analytics.merge_range('A1:B1', 'AuraFit-AI Security Analytics Dashboard', title_format)
    ws_analytics.set_row(0, 30)
    
    row = 2
    for key, value in analytics.items():
        if isinstance(value, dict):
            ws_analytics.merge_range(row, 0, row, 1, key.upper(), title_format)
            row += 1
            for k, v in value.items():
                ws_analytics.write(row, 0, k, label_format)
                ws_analytics.write(row, 1, v, val_format)
                row += 1
        else:
            ws_analytics.write(row, 0, key, label_format)
            ws_analytics.write(row, 1, value, val_format)
            row += 1
            
    writer_analytics.close()
    
    print(f"[INFO] Generated SecurityAssessmentReport.xlsx at {assessment_path}")
    print(f"[INFO] Generated SecurityAnalytics.xlsx at {analytics_path}")
