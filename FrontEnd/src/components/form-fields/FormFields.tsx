import type { FormField } from '../../types';

interface InputFieldProps {
  field: FormField;
  preview?: boolean;
}

export function InputField({ field, preview = false }: InputFieldProps) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type="text"
        name={field.name}
        placeholder={field.placeholder}
        disabled={!preview}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
      />
    </div>
  );
}

export function TextareaField({ field, preview = false }: InputFieldProps) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        name={field.name}
        placeholder={field.placeholder}
        disabled={!preview}
        rows={4}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
      />
    </div>
  );
}

export function SelectField({ field, preview = false }: InputFieldProps) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        name={field.name}
        disabled={!preview}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
      >
        <option value="">{field.placeholder || 'Select an option...'}</option>
        {field.options?.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function RadioField({ field, preview = false }: InputFieldProps) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="space-y-2">
        {field.options?.map((opt) => (
          <div key={opt.value} className="flex items-center">
            <input
              type="radio"
              name={field.name}
              value={opt.value}
              disabled={!preview}
              className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 disabled:opacity-50"
            />
            <label className="ml-2 block text-sm text-gray-700">{opt.label}</label>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CheckboxField({ field, preview = false }: InputFieldProps) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="space-y-2">
        {field.options?.map((opt) => (
          <div key={opt.value} className="flex items-center">
            <input
              type="checkbox"
              name={field.name}
              value={opt.value}
              disabled={!preview}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 disabled:opacity-50"
            />
            <label className="ml-2 block text-sm text-gray-700">{opt.label}</label>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LabelField({ field }: InputFieldProps) {
  return (
    <p className="text-base font-medium text-gray-900">
      {field.label}
    </p>
  );
}

export function renderFieldComponent(field: FormField, preview = false) {
  const props = { field, preview };
  
  switch (field.type) {
    case 'input':
      return <InputField {...props} />;
    case 'textarea':
      return <TextareaField {...props} />;
    case 'select':
      return <SelectField {...props} />;
    case 'radio':
      return <RadioField {...props} />;
    case 'checkbox':
      return <CheckboxField {...props} />;
    case 'label':
      return <LabelField {...props} />;
    default:
      return null;
  }
}
