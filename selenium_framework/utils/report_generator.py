import pandas as pd
import os
from datetime import datetime

def generate_excel_reports(reports_dir, test_results, failure_analysis):
    if not test_results:
        return

    df_results = pd.DataFrame(test_results)
    
    # Test Analytics
    total_tests = len(df_results)
    passed_tests = len(df_results[df_results['Status'] == 'PASSED'])
    failed_tests = len(df_results[df_results['Status'].isin(['FAILED', 'SETUP_FAILED'])])
    pass_rate = (passed_tests / total_tests) * 100 if total_tests > 0 else 0
    total_duration = df_results['Duration (s)'].sum() if 'Duration (s)' in df_results else 0
    overall_status = "PASS" if failed_tests == 0 else "FAIL"

    results_path = os.path.join(reports_dir, 'TestExecutionReport.xlsx')
    
    # Create stylized report using xlsxwriter
    writer = pd.ExcelWriter(results_path, engine='xlsxwriter')
    workbook = writer.book
    worksheet = workbook.add_worksheet('Selenium Test Report')
    writer.sheets['Selenium Test Report'] = worksheet

    # Define Formats
    title_format = workbook.add_format({
        'bg_color': '#2ecc71', 'font_color': '#ffffff', 'bold': True,
        'font_size': 14, 'align': 'center', 'valign': 'vcenter'
    })
    
    subtitle_format = workbook.add_format({
        'bg_color': '#0d1b2a', 'font_color': '#95a5a6', 'italic': True,
        'align': 'center', 'valign': 'vcenter'
    })
    
    section_header_format = workbook.add_format({
        'bg_color': '#1b263b', 'font_color': '#ffffff', 'bold': True,
        'align': 'center', 'valign': 'vcenter', 'font_size': 12
    })
    
    summary_label_format = workbook.add_format({
        'bg_color': '#0d1b2a', 'font_color': '#95a5a6', 'align': 'right',
        'valign': 'vcenter', 'bold': True, 'right': 0
    })
    
    summary_value_format = workbook.add_format({
        'bg_color': '#0d1b2a', 'font_color': '#ffffff', 'align': 'center',
        'valign': 'vcenter', 'bold': True
    })

    summary_value_pass_format = workbook.add_format({
        'bg_color': '#0d1b2a', 'font_color': '#2ecc71', 'align': 'center',
        'valign': 'vcenter', 'bold': True
    })

    summary_value_fail_format = workbook.add_format({
        'bg_color': '#0d1b2a', 'font_color': '#e74c3c', 'align': 'center',
        'valign': 'vcenter', 'bold': True
    })

    summary_desc_format = workbook.add_format({
        'bg_color': '#0d1b2a', 'font_color': '#7f8c8d', 'align': 'left',
        'valign': 'vcenter', 'italic': True
    })

    table_header_format = workbook.add_format({
        'bg_color': '#2c3e50', 'font_color': '#ffffff', 'bold': True,
        'align': 'center', 'valign': 'vcenter', 'border': 1, 'border_color': '#bdc3c7'
    })

    data_format = workbook.add_format({
        'align': 'center', 'valign': 'vcenter', 'border': 1, 'border_color': '#bdc3c7', 'text_wrap': True
    })

    data_left_format = workbook.add_format({
        'align': 'left', 'valign': 'vcenter', 'border': 1, 'border_color': '#bdc3c7', 'text_wrap': True
    })

    check_id_format = workbook.add_format({
        'align': 'center', 'valign': 'vcenter', 'border': 1, 'border_color': '#bdc3c7',
        'font_color': '#2980b9', 'bold': True
    })

    pass_status_format = workbook.add_format({
        'bg_color': '#e8f8f5', 'font_color': '#27ae60', 'bold': True,
        'align': 'center', 'valign': 'vcenter', 'border': 1, 'border_color': '#bdc3c7'
    })

    fail_status_format = workbook.add_format({
        'bg_color': '#fdedec', 'font_color': '#c0392b', 'bold': True,
        'align': 'center', 'valign': 'vcenter', 'border': 1, 'border_color': '#bdc3c7'
    })

    # Set Column Widths
    worksheet.set_column('A:A', 15)  # Test ID
    worksheet.set_column('B:B', 20)  # Module
    worksheet.set_column('C:C', 35)  # Test Name
    worksheet.set_column('D:D', 45)  # Description/Failure Reason
    worksheet.set_column('E:E', 15)  # Status

    max_col = 4 # columns A to E
    
    # 1. Main Title
    worksheet.merge_range(0, 0, 0, max_col, 'MedMonitor AI — Selenium Test Report', title_format)
    worksheet.set_row(0, 35)
    
    # 2. Subtitle
    scan_time = datetime.now().strftime('%m/%d/%Y, %I:%M:%S %p')
    subtitle_text = f"Scan Time: {scan_time} | Automated Testing Mode | Overall Status: {overall_status}"
    worksheet.merge_range(1, 0, 1, max_col, subtitle_text, subtitle_format)
    worksheet.set_row(1, 20)
    
    # 3. Summary Title
    worksheet.merge_range(3, 0, 3, max_col, 'Test Summary Metrics', section_header_format)
    worksheet.set_row(3, 25)
    
    # 4. Summary Data
    summary_data = [
        ("Total Tests", total_tests, "Total number of selenium tests executed."),
        ("Passed Tests", passed_tests, "Tests that completed successfully without errors."),
        ("Failed Tests", failed_tests, "Tests that encountered assertions or timeouts."),
        ("Pass Rate", f"{pass_rate:.2f}%", "Percentage of successful test cases."),
        ("Total Duration", f"{total_duration:.2f}s", "Overall execution time across all test suites."),
        ("Overall Assessment", overall_status, "All automated tests passed successfully." if overall_status == "PASS" else "Some tests failed and require investigation.")
    ]
    
    row = 4
    for label, value, desc in summary_data:
        worksheet.merge_range(row, 0, row, 1, label, summary_label_format)
        
        # Color specific values based on PASS/FAIL
        val_format = summary_value_format
        if label in ["Passed Tests", "Pass Rate"] and passed_tests > 0:
            val_format = summary_value_pass_format
        elif label == "Failed Tests" and failed_tests > 0:
            val_format = summary_value_fail_format
        elif label == "Overall Assessment":
            val_format = summary_value_pass_format if value == "PASS" else summary_value_fail_format
            
        worksheet.write(row, 2, value, val_format)
        worksheet.merge_range(row, 3, row, max_col, desc, summary_desc_format)
        worksheet.set_row(row, 20)
        row += 1
        
    # 5. Detailed Test Cases Title
    table_start_row = row + 1
    worksheet.merge_range(table_start_row, 0, table_start_row, max_col, 'DETAILED SELENIUM TEST CASES', section_header_format)
    worksheet.set_row(table_start_row, 25)
    
    # 6. Table Headers
    headers = ['Test ID', 'Module', 'Test Name', 'Failure Reason / Description', 'Status']
    header_row = table_start_row + 1
    for col_num, header in enumerate(headers):
        worksheet.write(header_row, col_num, header, table_header_format)
    worksheet.set_row(header_row, 20)
    
    # 7. Write Data Rows
    data_row = header_row + 1
    for test in test_results:
        worksheet.write(data_row, 0, test.get('Test ID', ''), check_id_format)
        worksheet.write(data_row, 1, test.get('Module', ''), data_format)
        worksheet.write(data_row, 2, test.get('Test Name', ''), data_left_format)
        
        reason = test.get('Failure Reason', '')
        desc = reason if reason else 'Executed successfully'
        worksheet.write(data_row, 3, desc, data_left_format)
        
        status = test.get('Status', '')
        if status == 'PASSED':
            worksheet.write(data_row, 4, status, pass_status_format)
        else:
            worksheet.write(data_row, 4, status, fail_status_format)
            
        worksheet.set_row(data_row, 25)
        data_row += 1

    writer.close()
    print(f"\n[INFO] Stylized Test Execution Report generated: {results_path}")
