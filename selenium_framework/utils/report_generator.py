import pandas as pd
import os

def generate_excel_reports(reports_dir, test_results, failure_analysis):
    if test_results:
        df_results = pd.DataFrame(test_results)
        results_path = os.path.join(reports_dir, 'TestExecutionReport.xlsx')
        df_results.to_excel(results_path, index=False)
        print(f"\n[INFO] Test Execution Report generated: {results_path}")
        
        # Test Analytics
        total_tests = len(df_results)
        passed_tests = len(df_results[df_results['Status'] == 'PASSED'])
        failed_tests = len(df_results[df_results['Status'].isin(['FAILED', 'SETUP_FAILED'])])
        pass_rate = (passed_tests / total_tests) * 100 if total_tests > 0 else 0
        
        analytics_data = [{
            "Total Tests": total_tests,
            "Passed": passed_tests,
            "Failed": failed_tests,
            "Pass Rate (%)": round(pass_rate, 2),
            "Total Duration (s)": round(df_results['Duration (s)'].sum(), 2)
        }]
        df_analytics = pd.DataFrame(analytics_data)
        analytics_path = os.path.join(reports_dir, 'TestAnalytics.xlsx')
        df_analytics.to_excel(analytics_path, index=False)
        print(f"[INFO] Test Analytics generated: {analytics_path}")
        
    if failure_analysis:
        df_failures = pd.DataFrame(failure_analysis)
        failures_path = os.path.join(reports_dir, 'FailureAnalysis.xlsx')
        df_failures.to_excel(failures_path, index=False)
        print(f"[INFO] Failure Analysis generated: {failures_path}")
