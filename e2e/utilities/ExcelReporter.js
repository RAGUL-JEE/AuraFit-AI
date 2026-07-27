const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
const logger = require('./Logger');

class ExcelReporter {
    constructor() {
        this.workbook = new ExcelJS.Workbook();
        this.summarySheet = this.workbook.addWorksheet('Summary');
        this.testCasesSheet = this.workbook.addWorksheet('Test Cases');
        this.failedTestsSheet = this.workbook.addWorksheet('Failed Tests');
        this.logsSheet = this.workbook.addWorksheet('Execution Logs');

        this.setupHeaders();
        this.stats = { total: 0, passed: 0, failed: 0, skipped: 0, start: new Date() };
    }

    setupHeaders() {
        this.summarySheet.columns = [
            { header: 'Execution Date', key: 'date', width: 20 },
            { header: 'Environment', key: 'env', width: 15 },
            { header: 'Total Tests', key: 'total', width: 15 },
            { header: 'Passed', key: 'passed', width: 15 },
            { header: 'Failed', key: 'failed', width: 15 },
            { header: 'Skipped', key: 'skipped', width: 15 },
            { header: 'Pass Percentage', key: 'percent', width: 20 },
            { header: 'Execution Duration', key: 'duration', width: 25 }
        ];

        this.testCasesSheet.columns = [
            { header: 'Test ID', key: 'id', width: 15 },
            { header: 'Module', key: 'module', width: 20 },
            { header: 'Scenario Name', key: 'scenario', width: 40 },
            { header: 'Browser', key: 'browser', width: 15 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Start Time', key: 'start', width: 20 },
            { header: 'End Time', key: 'end', width: 20 },
            { header: 'Duration (ms)', key: 'duration', width: 15 }
        ];

        this.failedTestsSheet.columns = [
            { header: 'Test Name', key: 'name', width: 40 },
            { header: 'Failure Reason', key: 'reason', width: 60 },
            { header: 'Screenshot Path', key: 'screenshot', width: 40 },
            { header: 'Browser', key: 'browser', width: 15 },
            { header: 'URL', key: 'url', width: 40 }
        ];

        this.logsSheet.columns = [
            { header: 'Timestamp', key: 'time', width: 25 },
            { header: 'Test Name', key: 'test', width: 40 },
            { header: 'Step Description', key: 'step', width: 50 },
            { header: 'Result', key: 'result', width: 15 },
            { header: 'Remarks', key: 'remarks', width: 40 }
        ];

        // Styling headers
        [this.summarySheet, this.testCasesSheet, this.failedTestsSheet, this.logsSheet].forEach(sheet => {
            sheet.getRow(1).font = { bold: true };
            sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD3D3D3' } };
        });
    }

    addTestCase(data) {
        this.stats.total++;
        if (data.status === 'passed') this.stats.passed++;
        else if (data.status === 'failed') this.stats.failed++;
        else this.stats.skipped++;

        this.testCasesSheet.addRow(data);
    }

    addFailedTest(data) {
        this.failedTestsSheet.addRow(data);
    }

    addLog(data) {
        this.logsSheet.addRow(data);
    }

    async generateReport() {
        const endTime = new Date();
        const duration = ((endTime - this.stats.start) / 1000) + ' seconds';
        const percent = this.stats.total > 0 ? ((this.stats.passed / this.stats.total) * 100).toFixed(2) + '%' : '0%';

        this.summarySheet.addRow({
            date: this.stats.start.toISOString().split('T')[0],
            env: process.env.BASE_URL || 'Local',
            total: this.stats.total,
            passed: this.stats.passed,
            failed: this.stats.failed,
            skipped: this.stats.skipped,
            percent: percent,
            duration: duration
        });

        const reportDir = path.join(__dirname, '../reports');
        if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });

        const filePath = path.join(reportDir, 'E2E_Report.xlsx');
        await this.workbook.xlsx.writeFile(filePath);
        logger.info(`Excel report generated successfully at ${filePath}`);
    }
}

module.exports = new ExcelReporter();
