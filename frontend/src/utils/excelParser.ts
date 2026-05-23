import * as XLSX from 'xlsx';

/**
 * Excel Parsing Utilities
 * Handles reading and parsing Excel files for certificate generation
 */

export interface ParsedExcelData {
  headers: string[];
  data: any[];
  detectedMapping: { [key: string]: string };
}

/**
 * Parse Excel file and detect column mappings
 */
export const parseExcelFile = (file: File): Promise<ParsedExcelData> => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const data = event.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];

          // Get headers and data
          const jsonData = XLSX.utils.sheet_to_json(sheet);
          const headers = Object.keys(jsonData[0] || {});

          // Auto-detect mappings
          const detectedMapping = autoDetectMappings(headers);

          resolve({
            headers,
            data: jsonData,
            detectedMapping,
          });
        } catch (err) {
          reject(new Error('Failed to parse Excel file'));
        }
      };

      reader.onerror = () => reject(new Error('Failed to read Excel file'));
      reader.readAsBinaryString(file);
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Auto-detect Excel columns to certificate field mappings
 */
export const autoDetectMappings = (headers: string[]): { [key: string]: string } => {
  const mapping: { [key: string]: string } = {};

  const commonMappings = {
    name: ['name', 'fullname', 'participant name', 'student name', 'attendee'],
    branch: ['branch', 'department', 'course', 'program', 'specialization'],
    college: ['college', 'university', 'institution', 'school', 'organization'],
    email: ['email', 'e-mail', 'email address', 'contact email'],
    event: ['event', 'event name', 'workshop', 'program'],
  };

  headers.forEach((header) => {
    const lowerHeader = header.toLowerCase().trim();

    Object.entries(commonMappings).forEach(([field, aliases]) => {
      if (aliases.some((alias) => lowerHeader.includes(alias))) {
        mapping[header] = field;
      }
    });
  });

  return mapping;
};

/**
 * Transform Excel data using field mappings
 */
export const transformExcelData = (
  data: any[],
  mapping: { [excelColumn: string]: string }
): any[] => {
  return data.map((row) => {
    const transformed: any = {};

    Object.entries(mapping).forEach(([excelColumn, field]) => {
      transformed[field] = row[excelColumn] || '';
    });

    return transformed;
  });
};

/**
 * Validate Excel data for required fields
 */
export const validateExcelData = (
  data: any[],
  requiredFields: string[] = ['name']
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (data.length === 0) {
    errors.push('Excel file contains no data');
    return { valid: false, errors };
  }

  requiredFields.forEach((field) => {
    const missingRows = data.filter((row) => !row[field] || row[field].toString().trim() === '');
    if (missingRows.length > 0) {
      errors.push(`Missing ${field} in ${missingRows.length} row(s)`);
    }
  });

  return { valid: errors.length === 0, errors };
};

/**
 * Generate Excel template for certificate data
 */
export const generateExcelTemplate = (): ArrayBuffer => {
  const data = [
    {
      Name: 'Sample Participant 1',
      Branch: 'Computer Science',
      College: 'Tech University',
      Email: 'participant1@example.com',
      Event: 'Certificate Event',
    },
    {
      Name: 'Sample Participant 2',
      Branch: 'Electronics',
      College: 'Tech University',
      Email: 'participant2@example.com',
      Event: 'Certificate Event',
    },
  ];

  const sheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'Participants');

  return XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
};
