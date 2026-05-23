import React, { useState } from 'react';
import { validators } from '../utils/validators';
import '../styles/DynamicForm.css';

interface Field {
  name: string;
  label: string;
  type: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
}

interface DynamicFormProps {
  fields: Field[];
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
  initialData?: any;
  submitButtonText?: string;
}

const DynamicForm: React.FC<DynamicFormProps> = ({
  fields,
  onSubmit,
  isLoading = false,
  initialData = {},
  submitButtonText = 'Submit',
}) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = fields.filter((f) => f.required).map((f) => f.name);

    fields.forEach((field) => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} is required`;
      }

      if (formData[field.name]) {
        if (field.type === 'email' && !validators.validateEmail(formData[field.name])) {
          newErrors[field.name] = 'Invalid email format';
        }
        if (field.type === 'tel' && !validators.validatePhone(formData[field.name])) {
          newErrors[field.name] = 'Invalid phone format';
        }
      }
    });

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitted(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setSubmitted(false);
    }
  };

  return (
    <div className="dynamic-form-container">
      <form onSubmit={handleSubmit} className="dynamic-form">
        {fields.map((field) => (
          <div key={field.name} className="form-group">
            <label htmlFor={field.name} className="form-label">
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>

            {field.type === 'textarea' ? (
              <textarea
                id={field.name}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleChange}
                placeholder={field.placeholder}
                className={`form-input form-textarea ${errors[field.name] ? 'error' : ''}`}
                disabled={isLoading}
              />
            ) : field.type === 'select' ? (
              <select
                id={field.name}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleChange}
                className={`form-input form-select ${errors[field.name] ? 'error' : ''}`}
                disabled={isLoading}
              >
                <option value="">Select {field.label}</option>
                {field.options?.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={field.name}
                type={field.type}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleChange}
                placeholder={field.placeholder}
                className={`form-input ${errors[field.name] ? 'error' : ''}`}
                disabled={isLoading}
                required={field.required}
              />
            )}

            {errors[field.name] && (
              <span className="error-message">{errors[field.name]}</span>
            )}
          </div>
        ))}

        <button
          type="submit"
          className="submit-btn"
          disabled={isLoading || submitted}
        >
          {isLoading || submitted ? 'Processing...' : submitButtonText}
        </button>
      </form>
    </div>
  );
};

export default DynamicForm;
