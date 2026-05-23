import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileUp, CheckCircle, AlertCircle } from 'lucide-react';

interface ExcelImporterProps {
  onImportComplete?: (fields: any[]) => void;
}

export const ExcelImporter: React.FC<ExcelImporterProps> = ({ onImportComplete }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [importedCount, setImportedCount] = useState(0);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      setError('');
      setSuccess('');

      // Check file type
      if (!['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'].includes(file.type) && !file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
        setError('Please upload a CSV or Excel file');
        return;
      }

      const text = await file.text();
      const rows = text.split('\n').map(row => row.split(','));

      // Expect headers: label, type, required, placeholder, options
      if (rows.length < 2 || rows[0].length < 2) {
        setError('Invalid file format. Expected columns: label, type, required, placeholder, options');
        return;
      }

      const headers = rows[0].map(h => h.trim().toLowerCase());
      const fields: any[] = [];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row[0]?.trim()) continue; // Skip empty rows

        const labelIdx = headers.indexOf('label');
        const typeIdx = headers.indexOf('type');
        const requiredIdx = headers.indexOf('required');
        const placeholderIdx = headers.indexOf('placeholder');
        const optionsIdx = headers.indexOf('options');

        const field = {
          id: `field_${Date.now()}_${i}`,
          label: row[labelIdx]?.trim() || '',
          type: row[typeIdx]?.trim().toLowerCase() || 'text',
          required: row[requiredIdx]?.trim().toLowerCase() === 'true' || row[requiredIdx]?.trim() === '1',
          placeholder: row[placeholderIdx]?.trim() || '',
          options: row[optionsIdx]?.trim() ? row[optionsIdx].split('|').map(opt => opt.trim()) : [],
        };

        if (field.label) {
          fields.push(field);
        }
      }

      if (fields.length === 0) {
        setError('No valid fields found in the file');
        return;
      }

      setImportedCount(fields.length);
      setSuccess(`Successfully imported ${fields.length} field(s)`);

      if (onImportComplete) {
        onImportComplete(fields);
      }
    } catch (err: any) {
      setError(err.message || 'Error importing file');
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <FileUp className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-lg text-gray-900">Import Form Fields from Excel</h3>
        </div>

        <p className="text-sm text-gray-600">
          Upload a CSV or Excel file to quickly populate form fields. Use these column headers:
          <span className="block mt-2 font-mono text-xs bg-white p-2 rounded border border-gray-200">
            label, type, required, placeholder, options
          </span>
        </p>

        <div className="space-y-3">
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-green-700">
                {success}
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
              disabled={importing}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className="gap-2 flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <Upload className="w-4 h-4" />
              {importing ? 'Importing...' : 'Select File'}
            </Button>

            {importedCount > 0 && (
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="gap-2"
              >
                Import Another
              </Button>
            )}
          </div>

          <div className="text-xs text-gray-500 bg-white p-2 rounded border border-gray-200">
            <p className="font-semibold mb-1">Example CSV format:</p>
            <pre className="text-xs overflow-auto">
{`label,type,required,placeholder,options
Full Name,text,true,Enter your name,
Email,email,true,you@example.com,
Department,dropdown,false,,Sales|HR|IT
Agree to Terms,checkbox,true,,`}
            </pre>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ExcelImporter;
