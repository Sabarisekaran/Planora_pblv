/**
 * Form template configurations for different program types
 */

export const FORM_TEMPLATES = {
  Technical: {
    type: 'Technical',
    label: 'Technical Program',
    fields: [
      {
        name: 'name',
        label: 'Full Name',
        type: 'text',
        required: true,
        placeholder: 'Enter your full name',
      },
      {
        name: 'email',
        label: 'Email Address',
        type: 'email',
        required: true,
        placeholder: 'Enter your email',
      },
      {
        name: 'phone',
        label: 'Phone Number',
        type: 'tel',
        required: true,
        placeholder: 'Enter your phone number',
      },
      {
        name: 'department',
        label: 'Department',
        type: 'text',
        required: true,
        placeholder: 'e.g., Computer Science',
      },
      {
        name: 'year',
        label: 'Year of Study',
        type: 'select',
        required: true,
        options: ['1st Year', '2nd Year', '3rd Year', '4th Year'],
      },
      {
        name: 'skills',
        label: 'Relevant Skills',
        type: 'textarea',
        required: false,
        placeholder: 'List your relevant skills',
      },
    ],
  },
  'Non-Technical': {
    type: 'Non-Technical',
    label: 'Non-Technical Program',
    fields: [
      {
        name: 'name',
        label: 'Full Name',
        type: 'text',
        required: true,
        placeholder: 'Enter your full name',
      },
      {
        name: 'email',
        label: 'Email Address',
        type: 'email',
        required: true,
        placeholder: 'Enter your email',
      },
      {
        name: 'phone',
        label: 'Phone Number',
        type: 'tel',
        required: true,
        placeholder: 'Enter your phone number',
      },
      {
        name: 'interest',
        label: 'Area of Interest',
        type: 'text',
        required: true,
        placeholder: 'e.g., Management, Marketing, etc.',
      },
    ],
  },
  Social: {
    type: 'Social',
    label: 'Social Event',
    fields: [
      {
        name: 'name',
        label: 'Full Name',
        type: 'text',
        required: true,
        placeholder: 'Enter your full name',
      },
      {
        name: 'phone',
        label: 'Phone Number',
        type: 'tel',
        required: true,
        placeholder: 'Enter your phone number',
      },
      {
        name: 'location',
        label: 'Location',
        type: 'text',
        required: false,
        placeholder: 'Enter your location',
      },
      {
        name: 'participationType',
        label: 'Type of Participation',
        type: 'select',
        required: true,
        options: ['Individual', 'Team', 'Group'],
      },
    ],
  },
};

/**
 * Get template for a program type
 */
export const getTemplate = (programType) => {
  return FORM_TEMPLATES[programType] || FORM_TEMPLATES['Non-Technical'];
};

/**
 * Get required fields for a program type
 */
export const getRequiredFields = (programType) => {
  const template = getTemplate(programType);
  return template.fields
    .filter((field) => field.required)
    .map((field) => field.name);
};

/**
 * Get all fields for a program type
 */
export const getAllFields = (programType) => {
  const template = getTemplate(programType);
  return template.fields.map((field) => field.name);
};

export default FORM_TEMPLATES;
