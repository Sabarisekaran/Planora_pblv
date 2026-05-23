import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Trash2, Plus } from 'lucide-react';

interface Field {
  id: string;
  label: string;
  type: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
}

interface FieldEditorProps {
  fields: Field[];
  onAddField: (field: Omit<Field, 'id'>) => void;
  onRemoveField: (fieldId: string) => void;
}

const FieldEditor = ({ fields, onAddField, onRemoveField }: FieldEditorProps) => {
  const [newField, setNewField] = useState({
    label: '',
    type: 'text',
    required: false,
    placeholder: '',
    options: '',
  });

  const fieldTypes = ['text', 'email', 'number', 'dropdown', 'checkbox', 'textarea'];

  const handleAddField = () => {
    if (!newField.label.trim()) {
      alert('Please enter a field label');
      return;
    }

    const optionsArray =
      newField.type === 'dropdown'
        ? newField.options
            .split(',')
            .map((opt) => opt.trim())
            .filter((opt) => opt)
        : [];

    onAddField({
      label: newField.label,
      type: newField.type,
      required: newField.required,
      placeholder: newField.placeholder,
      options: optionsArray.length > 0 ? optionsArray : undefined,
    });

    // Reset form
    setNewField({
      label: '',
      type: 'text',
      required: false,
      placeholder: '',
      options: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Add Field Section */}
      <Card className="p-6 border border-blue-200 bg-blue-50">
        <h3 className="text-lg font-semibold text-foreground mb-4">Add New Field</h3>

        <div className="space-y-4">
          {/* Label */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Field Label</label>
            <Input
              placeholder="e.g., Full Name"
              value={newField.label}
              onChange={(e) => setNewField({ ...newField, label: e.target.value })}
            />
          </div>

          {/* Type */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Field Type</label>
            <select
              value={newField.type}
              onChange={(e) => setNewField({ ...newField, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              {fieldTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Placeholder */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Placeholder</label>
            <Input
              placeholder="e.g., Enter your full name"
              value={newField.placeholder}
              onChange={(e) => setNewField({ ...newField, placeholder: e.target.value })}
            />
          </div>

          {/* Options (for dropdown) */}
          {newField.type === 'dropdown' && (
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Options (comma-separated)
              </label>
              <Input
                placeholder="Option 1, Option 2, Option 3"
                value={newField.options}
                onChange={(e) => setNewField({ ...newField, options: e.target.value })}
              />
            </div>
          )}

          {/* Required Checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="required"
              checked={newField.required}
              onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label htmlFor="required" className="text-sm font-medium text-gray-700">
              Required field
            </label>
          </div>

          {/* Add Button */}
          <Button onClick={handleAddField} className="w-full gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4" />
            Add Field
          </Button>
        </div>
      </Card>

      {/* Fields List */}
      {fields.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">Fields ({fields.length})</h3>

          <div className="space-y-2">
            {fields.map((field, index) => (
              <Card key={field.id} className="p-4 border border-gray-200 bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-foreground">{field.label}</span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {field.type}
                      </span>
                      {field.required && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                          Required
                        </span>
                      )}
                    </div>
                    {field.placeholder && (
                      <p className="text-xs text-gray-600">Placeholder: {field.placeholder}</p>
                    )}
                    {field.options && (
                      <p className="text-xs text-gray-600">
                        Options: {field.options.join(', ')}
                      </p>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onRemoveField(field.id)}
                    className="gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldEditor;
