import type { FormField } from '@/types/builder';

interface InputFieldProps {
    field: FormField;
    preview?: boolean;
}

export function InputField({ field, preview = false }: InputFieldProps) {
    const fontSize = field.fontSize || 14;
    return (
        <div className="flex h-full flex-col justify-start space-y-1">
            <label
                className="block font-medium text-gray-700"
                style={{ fontSize: `${fontSize}px` }}
            >
                {field.label}
                {field.required && <span className="ml-1 text-red-500">*</span>}
            </label>
            <input
                type="text"
                name={field.name}
                placeholder={field.placeholder}
                disabled={!preview}
                className="w-full rounded-md border border-gray-300 px-3 py-1 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500"
            />
        </div>
    );
}

export function TextareaField({ field, preview = false }: InputFieldProps) {
    const containerHeight = field.height || 100;
    const textareaHeight = Math.max(30, containerHeight - 35);
    const fontSize = field.fontSize || 14;

    return (
        <div className="flex h-full flex-col justify-start space-y-1">
            <label
                className="block font-medium text-gray-700"
                style={{ fontSize: `${fontSize}px` }}
            >
                {field.label}
                {field.required && <span className="ml-1 text-red-500">*</span>}
            </label>
            <textarea
                name={field.name}
                placeholder={field.placeholder}
                disabled={!preview}
                rows={2}
                style={{ height: textareaHeight }}
                className="w-full resize-none rounded-md border border-gray-300 px-3 py-1 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500"
            />
        </div>
    );
}

export function SelectField({ field, preview = false }: InputFieldProps) {
    const fontSize = field.fontSize || 14;
    return (
        <div className="flex h-full flex-col justify-start space-y-1">
            <label
                className="block font-medium text-gray-700"
                style={{ fontSize: `${fontSize}px` }}
            >
                {field.label}
                {field.required && <span className="ml-1 text-red-500">*</span>}
            </label>
            <select
                name={field.name}
                disabled={!preview}
                className="w-full rounded-md border border-gray-300 px-3 py-1 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500"
            >
                <option value="">
                    {field.placeholder || 'Select an option...'}
                </option>
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
    const fontSize = field.fontSize || 14;
    return (
        <div className="flex h-full flex-col justify-start space-y-1">
            <label
                className="block font-medium text-gray-700"
                style={{ fontSize: `${fontSize}px` }}
            >
                {field.label}
                {field.required && <span className="ml-1 text-red-500">*</span>}
            </label>
            <div className="space-y-1">
                {field.options?.map((opt) => (
                    <div key={opt.value} className="flex items-center">
                        <input
                            type="radio"
                            name={field.name}
                            value={opt.value}
                            disabled={!preview}
                            className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
                        />
                        <label className="ml-2 block text-sm text-gray-700">
                            {opt.label}
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function CheckboxField({ field, preview = false }: InputFieldProps) {
    const fontSize = field.fontSize || 14;
    return (
        <div className="flex h-full flex-col justify-start space-y-1">
            <label
                className="block font-medium text-gray-700"
                style={{ fontSize: `${fontSize}px` }}
            >
                {field.label}
                {field.required && <span className="ml-1 text-red-500">*</span>}
            </label>
            <div className="space-y-1">
                {field.options?.map((opt) => (
                    <div key={opt.value} className="flex items-center">
                        <input
                            type="checkbox"
                            name={field.name}
                            value={opt.value}
                            disabled={!preview}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
                        />
                        <label className="ml-2 block text-sm text-gray-700">
                            {opt.label}
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function LabelField({ field }: InputFieldProps) {
    const fontSize = field.fontSize || 24;
    return (
        <div className="flex h-full w-full items-start justify-start p-1">
            <p
                className="font-semibold text-gray-900"
                style={{ fontSize: `${fontSize}px` }}
            >
                {field.label}
            </p>
        </div>
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
