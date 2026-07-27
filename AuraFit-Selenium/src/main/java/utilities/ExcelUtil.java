package utilities;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;

public class ExcelUtil {

    private static Workbook workbook;
    private static Sheet sheet;

    public static void createAuditReportTemplate() {
        String reportPath = ConfigManager.getProperty("excelReportPath");
        try {
            File reportFile = new File(reportPath);
            if (!reportFile.getParentFile().exists()) {
                reportFile.getParentFile().mkdirs();
            }

            workbook = new XSSFWorkbook();
            sheet = workbook.createSheet("Audit Results");

            Row headerRow = sheet.createRow(0);
            String[] columns = {"Test Case ID", "Module", "Feature", "Scenario", "Priority", "Severity", "Browser", "Expected Result", "Actual Result", "Status", "Execution Time", "Screenshot Path", "Remarks"};

            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            FileOutputStream fileOut = new FileOutputStream(reportPath);
            workbook.write(fileOut);
            fileOut.close();
            workbook.close();

        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static void logTestResult(String[] resultData) {
        String reportPath = ConfigManager.getProperty("excelReportPath");
        try {
            FileInputStream fileIn = new FileInputStream(reportPath);
            workbook = new XSSFWorkbook(fileIn);
            sheet = workbook.getSheet("Audit Results");

            int rowCount = sheet.getLastRowNum();
            Row row = sheet.createRow(rowCount + 1);

            for (int i = 0; i < resultData.length; i++) {
                row.createCell(i).setCellValue(resultData[i]);
            }

            fileIn.close();
            FileOutputStream fileOut = new FileOutputStream(reportPath);
            workbook.write(fileOut);
            fileOut.close();
            workbook.close();

        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
