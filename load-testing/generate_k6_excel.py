import json
import pandas as pd
import sys
import os

def generate_report(summary_json_path, output_excel_path):
    if not os.path.exists(summary_json_path):
        print(f"Error: {summary_json_path} not found.")
        sys.exit(1)

    with open(summary_json_path, 'r') as f:
        data = json.load(f)

    metrics = data.get('metrics', {})
    
    http_reqs = metrics.get('http_reqs', {})
    total_requests = http_reqs.get('count', 0)
    rps = http_reqs.get('rate', 0.0)

    duration = metrics.get('http_req_duration', {})
    avg_resp = duration.get('avg', 0.0)
    min_resp = duration.get('min', 0.0)
    max_resp = duration.get('max', 0.0)
    med_resp = duration.get('med', 0.0)
    p90_resp = duration.get('p(90)', 0.0)
    p95_resp = duration.get('p(95)', 0.0)

    # Prepare DataFrame
    results = [{
        "Metric": "Total Requests", "Value": int(total_requests), "Unit": "requests"
    }, {
        "Metric": "Requests Per Second (RPS)", "Value": round(rps, 2), "Unit": "req/sec"
    }, {
        "Metric": "Average Response Time", "Value": round(avg_resp, 2), "Unit": "ms"
    }, {
        "Metric": "Minimum Response Time", "Value": round(min_resp, 2), "Unit": "ms"
    }, {
        "Metric": "Maximum Response Time", "Value": round(max_resp, 2), "Unit": "ms"
    }, {
        "Metric": "95th Percentile Response Time", "Value": round(p95_resp, 2), "Unit": "ms"
    }]

    df = pd.DataFrame(results)

    # Use xlsxwriter to style
    writer = pd.ExcelWriter(output_excel_path, engine='xlsxwriter')
    workbook = writer.book
    worksheet = workbook.add_worksheet('Load Test Results')
    writer.sheets['Load Test Results'] = worksheet

    # Formats
    title_format = workbook.add_format({
        'bg_color': '#3498db', 'font_color': '#ffffff', 'bold': True,
        'font_size': 14, 'align': 'center', 'valign': 'vcenter'
    })
    
    header_format = workbook.add_format({
        'bg_color': '#2c3e50', 'font_color': '#ffffff', 'bold': True,
        'align': 'center', 'valign': 'vcenter', 'border': 1
    })

    data_format = workbook.add_format({
        'align': 'center', 'valign': 'vcenter', 'border': 1
    })
    
    label_format = workbook.add_format({
        'align': 'left', 'valign': 'vcenter', 'border': 1, 'bold': True
    })

    worksheet.set_column('A:A', 35)
    worksheet.set_column('B:B', 15)
    worksheet.set_column('C:C', 15)

    worksheet.merge_range('A1:C1', 'Baseline/Load Testing Results (100 VUs, 1 min)', title_format)
    worksheet.set_row(0, 30)

    headers = ['Metric', 'Value', 'Unit']
    for col, header in enumerate(headers):
        worksheet.write(1, col, header, header_format)
    
    row = 2
    for item in results:
        worksheet.write(row, 0, item['Metric'], label_format)
        worksheet.write(row, 1, item['Value'], data_format)
        worksheet.write(row, 2, item['Unit'], data_format)
        row += 1

    writer.close()
    print(f"Excel report generated at {output_excel_path}")

if __name__ == '__main__':
    generate_report('summary.json', 'LoadTestReport.xlsx')
