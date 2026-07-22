import os
import datetime
import pandas as pd
from openpyxl import Workbook
from openpyxl.styles import PatternFill, Font, Alignment, Border, Side
from openpyxl.chart import BarChart, PieChart, Reference, Series
from openpyxl.utils.dataframe import dataframe_to_rows

def generate_excel_report(results_list):
    """
    Generates a highly formatted Excel report with Summary Charts and Detailed Logs.
    results_list format: [{'Test ID': '...', 'Module': '...', 'Status': 'Passed/Failed/Skipped', 'Duration': '...'}, ...]
    """
    report_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'reports')
    os.makedirs(report_dir, exist_ok=True)
    file_path = os.path.join(report_dir, 'Execution_Report.xlsx')
    
    wb = Workbook()
    ws_summary = wb.active
    ws_summary.title = "Summary Dashboard"
    
    ws_details = wb.create_sheet(title="Detailed Results")
    
    df = pd.DataFrame(results_list)
    
    # If no results, just save empty
    if df.empty:
        wb.save(file_path)
        return
        
    # --- Detailed Results Sheet ---
    for r in dataframe_to_rows(df, index=False, header=True):
        ws_details.append(r)
        
    # Formatting Detailed Results
    header_font = Font(bold=True, color="FFFFFF")
    header_fill = PatternFill(start_color="2C3E50", end_color="2C3E50", fill_type="solid")
    thin_border = Border(left=Side(style='thin'), right=Side(style='thin'), top=Side(style='thin'), bottom=Side(style='thin'))
    
    for col_idx, column in enumerate(ws_details.columns, 1):
        # Auto width
        max_length = 0
        column_letter = column[0].column_letter
        for cell in column:
            try:
                if len(str(cell.value)) > max_length:
                    max_length = len(str(cell.value))
            except:
                pass
        adjusted_width = (max_length + 2)
        ws_details.column_dimensions[column_letter].width = adjusted_width
        
        # Format Header
        ws_details.cell(row=1, column=col_idx).font = header_font
        ws_details.cell(row=1, column=col_idx).fill = header_fill
        ws_details.cell(row=1, column=col_idx).alignment = Alignment(horizontal='center')
        
    # Format Cells based on Status
    status_col_idx = None
    for idx, cell in enumerate(ws_details[1], 1):
        if cell.value == "Status":
            status_col_idx = idx
            break
            
    if status_col_idx:
        pass_fill = PatternFill(start_color="2ECC71", end_color="2ECC71", fill_type="solid") # Green
        fail_fill = PatternFill(start_color="E74C3C", end_color="E74C3C", fill_type="solid") # Red
        skip_fill = PatternFill(start_color="F1C40F", end_color="F1C40F", fill_type="solid") # Yellow
        
        for row in ws_details.iter_rows(min_row=2, max_row=ws_details.max_row, min_col=status_col_idx, max_col=status_col_idx):
            cell = row[0]
            if cell.value == "Passed":
                cell.fill = pass_fill
                cell.font = Font(color="FFFFFF", bold=True)
            elif cell.value == "Failed":
                cell.fill = fail_fill
                cell.font = Font(color="FFFFFF", bold=True)
            elif cell.value == "Skipped":
                cell.fill = skip_fill
                cell.font = Font(color="000000", bold=True)
            cell.alignment = Alignment(horizontal='center')
            
    for row in ws_details.iter_rows(min_row=1, max_row=ws_details.max_row, min_col=1, max_col=ws_details.max_column):
        for cell in row:
            cell.border = thin_border
            
    # --- Summary Dashboard Sheet ---
    total = len(df)
    passed = len(df[df['Status'] == 'Passed'])
    failed = len(df[df['Status'] == 'Failed'])
    skipped = len(df[df['Status'] == 'Skipped'])
    
    pass_pct = round((passed / total) * 100, 2) if total > 0 else 0
    fail_pct = round((failed / total) * 100, 2) if total > 0 else 0
    
    summary_data = [
        ["Metric", "Value"],
        ["Execution Date", datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")],
        ["Environment", "QA-Selenium"],
        ["Total Tests", total],
        ["Passed", passed],
        ["Failed", failed],
        ["Skipped", skipped],
        ["Pass Percentage", f"{pass_pct}%"],
        ["Fail Percentage", f"{fail_pct}%"]
    ]
    
    for r in summary_data:
        ws_summary.append(r)
        
    for row in ws_summary.iter_rows(min_row=1, max_row=len(summary_data), min_col=1, max_col=2):
        for cell in row:
            cell.border = thin_border
            if cell.row == 1:
                cell.font = header_font
                cell.fill = header_fill
            else:
                if cell.column == 1:
                    cell.font = Font(bold=True)
                    
    ws_summary.column_dimensions['A'].width = 20
    ws_summary.column_dimensions['B'].width = 25
    
    # Chart Data for Pie
    ws_summary.append([]) # spacer
    ws_summary.append(["Status", "Count"])
    ws_summary.append(["Passed", passed])
    ws_summary.append(["Failed", failed])
    ws_summary.append(["Skipped", skipped])
    
    pie = PieChart()
    labels = Reference(ws_summary, min_col=1, min_row=12, max_row=14)
    data = Reference(ws_summary, min_col=2, min_row=11, max_row=14)
    pie.add_data(data, titles_from_data=True)
    pie.set_categories(labels)
    pie.title = "Test Execution Results"
    ws_summary.add_chart(pie, "D2")
    
    bar = BarChart()
    bar.add_data(data, titles_from_data=True)
    bar.set_categories(labels)
    bar.title = "Results Breakdown"
    ws_summary.add_chart(bar, "D18")
    
    wb.save(file_path)
    print(f"Excel report generated successfully at {file_path}")

if __name__ == "__main__":
    # Test generation
    sample = [
        {"Test ID": "TC_001", "Module": "Auth", "Feature": "Login", "Browser": "Chrome", "Status": "Passed", "Duration": "5s"},
        {"Test ID": "TC_002", "Module": "Auth", "Feature": "Login", "Browser": "Chrome", "Status": "Failed", "Duration": "8s"},
        {"Test ID": "TC_003", "Module": "Dashboard", "Feature": "Navigation", "Browser": "Chrome", "Status": "Skipped", "Duration": "1s"},
    ]
    generate_excel_report(sample)
