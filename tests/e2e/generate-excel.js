import fs from 'fs';
import * as xlsx from 'xlsx';

const resultsFile = './test-results.json';
const outputFile = './E2E-Test-Report.xlsx';

try {
  if (!fs.existsSync(resultsFile)) {
    console.error('Test results JSON not found. Run tests with --json --outputFile=test-results.json');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));

  const rows = [];
  
  // Parse Jest results
  data.testResults.forEach(suite => {
    suite.assertionResults.forEach(test => {
      rows.push({
        'Test Suite': test.ancestorTitles.join(' > '),
        'Test Case': test.title,
        'Status': test.status.toUpperCase(),
        'Duration (ms)': test.duration ?? 0,
        'Errors': test.failureMessages?.join('\n') || 'None'
      });
    });
  });

  // Create a new workbook and add the data
  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.json_to_sheet(rows);

  // Auto-adjust column widths
  const colWidths = [
    { wch: 30 }, // Test Suite
    { wch: 50 }, // Test Case
    { wch: 15 }, // Status
    { wch: 15 }, // Duration
    { wch: 50 }  // Errors
  ];
  ws['!cols'] = colWidths;

  xlsx.utils.book_append_sheet(wb, ws, 'Test Results');

  xlsx.writeFile(wb, outputFile);
  console.log(`Successfully generated Excel report: ${outputFile}`);

} catch (error) {
  console.error('Failed to generate Excel report:', error);
  process.exit(1);
}
