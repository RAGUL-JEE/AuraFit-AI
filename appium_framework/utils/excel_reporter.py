import os
import pandas as pd
from datetime import datetime

class ExcelReporter:
    def __init__(self):
        self.results = []
        self.report_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'reports')
        os.makedirs(self.report_dir, exist_ok=True)
        self.execution_report_path = os.path.join(self.report_dir, 'Mobile_TestExecutionReport.xlsx')
        self.analytics_report_path = os.path.join(self.report_dir, 'Mobile_TestAnalytics.xlsx')

    def add_result(self, test_id, module, test_name, duration, status, error_message="", screenshot_path=""):
        self.results.append({
            "Test ID": test_id,
            "Module": module,
            "Test Name": test_name,
            "Execution Time (s)": round(duration, 2),
            "Status": status,
            "Pass/Fail": "Pass" if status == "passed" else ("Fail" if status == "failed" else "Skip"),
            "Error Message": str(error_message)[:500] if error_message else "",
            "Screenshot Path": screenshot_path
        })

    def generate_reports(self):
        if not self.results:
            return

        # 1. Generate Execution Report
        df_execution = pd.DataFrame(self.results)
        df_execution.to_excel(self.execution_report_path, index=False)

        # 2. Generate Analytics Report
        total_tests = len(df_execution)
        passed = len(df_execution[df_execution['Pass/Fail'] == 'Pass'])
        failed = len(df_execution[df_execution['Pass/Fail'] == 'Fail'])
        skipped = len(df_execution[df_execution['Pass/Fail'] == 'Skip'])
        total_duration = df_execution['Execution Time (s)'].sum()
        pass_percent = round((passed / total_tests) * 100, 2) if total_tests > 0 else 0

        module_coverage = df_execution['Module'].value_counts().to_dict()
        failure_dist = df_execution[df_execution['Pass/Fail'] == 'Fail']['Module'].value_counts().to_dict()

        analytics_data = {
            "Metric": ["Total Tests", "Passed", "Failed", "Skipped", "Execution Duration (s)", "Pass Percentage (%)", "Module Coverage", "Failure Distribution"],
            "Value": [total_tests, passed, failed, skipped, round(total_duration, 2), pass_percent, str(module_coverage), str(failure_dist)]
        }

        df_analytics = pd.DataFrame(analytics_data)
        df_analytics.to_excel(self.analytics_report_path, index=False)
        print(f"Excel reports generated at {self.report_dir}")

excel_reporter = ExcelReporter()
