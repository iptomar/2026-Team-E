import type { FormField } from '@/types/builder';

interface InputFieldProps {
    field: FormField;
    preview?: boolean;
}

export function InputField({ field, preview = false }: InputFieldProps) {
    const fontSize = field.fontSize ?? 14;

    return (
        <div className="flex h-full flex-col justify-start space-y-1.5 overflow-hidden">
            <label
                className="block font-semibold text-gray-700"
                style={{ fontSize: `${fontSize}px` }}
            >
                {field.label}
                {field.required && <span className="ml-1 text-red-500">*</span>}
            </label>
            <input
                type="text"
                name={field.name}
                placeholder={field.placeholder ?? ''}
                defaultValue={field.defaultValue}
                disabled={!preview}
                className="w-full rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm text-gray-800 placeholder-gray-400 shadow-sm transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500"
            />
            {field.helperText && (
                <p className="truncate text-xs text-gray-500">
                    {field.helperText}
                </p>
            )}
        </div>
    );
}

export function TextareaField({ field, preview = false }: InputFieldProps) {
    const fontSize = field.fontSize ?? 14;

    return (
        <div className="flex h-full flex-col justify-start space-y-1.5 overflow-hidden">
            <label
                className="block font-semibold text-gray-700"
                style={{ fontSize: `${fontSize}px` }}
            >
                {field.label}
                {field.required && <span className="ml-1 text-red-500">*</span>}
            </label>
            <textarea
                name={field.name}
                placeholder={field.placeholder ?? ''}
                defaultValue={field.defaultValue}
                disabled={!preview}
                rows={2}
                className="w-full flex-1 resize-none rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm text-gray-800 placeholder-gray-400 shadow-sm transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500"
            />
            {field.helperText && (
                <p className="truncate text-xs text-gray-500">
                    {field.helperText}
                </p>
            )}
        </div>
    );
}

export function SelectField({ field, preview = false }: InputFieldProps) {
    const fontSize = field.fontSize ?? 14;

    return (
        <div className="flex h-full flex-col justify-start space-y-1.5 overflow-hidden">
            <label
                className="block font-semibold text-gray-700"
                style={{ fontSize: `${fontSize}px` }}
            >
                {field.label}
                {field.required && <span className="ml-1 text-red-500">*</span>}
            </label>
            <select
                name={field.name}
                disabled={!preview}
                className="w-full flex-1 rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500"
            >
                <option value="">
                    {field.placeholder ?? 'Select an option...'}
                </option>
                {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {field.helperText && (
                <p className="truncate text-xs text-gray-500">
                    {field.helperText}
                </p>
            )}
        </div>
    );
}

export function RadioField({ field, preview = false }: InputFieldProps) {
    const fontSize = field.fontSize ?? 14;

    return (
        <div className="flex h-full flex-col justify-start space-y-1.5 overflow-hidden">
            <label
                className="block font-semibold text-gray-700"
                style={{ fontSize: `${fontSize}px` }}
            >
                {field.label}
                {field.required && <span className="ml-1 text-red-500">*</span>}
            </label>
            <div className="flex-1 space-y-1.5 overflow-y-auto">
                {(field.options?.length > 0
                    ? field.options
                    : [{ label: 'Option 1', value: 'option1' }]
                ).map((opt) => (
                    <div key={opt.value} className="flex items-center gap-2">
                        <input
                            type="radio"
                            name={field.name}
                            value={opt.value}
                            disabled={!preview}
                            className="h-4 w-4 shrink-0 border-indigo-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
                        />
                        <label className="truncate text-sm text-gray-700">
                            {opt.label}
                        </label>
                    </div>
                ))}
            </div>
            {field.helperText && (
                <p className="truncate text-xs text-gray-500">
                    {field.helperText}
                </p>
            )}
        </div>
    );
}

export function CheckboxField({ field, preview = false }: InputFieldProps) {
    const fontSize = field.fontSize ?? 14;

    return (
        <div className="flex h-full flex-col justify-start space-y-1.5 overflow-hidden">
            <label
                className="block font-semibold text-gray-700"
                style={{ fontSize: `${fontSize}px` }}
            >
                {field.label}
                {field.required && <span className="ml-1 text-red-500">*</span>}
            </label>
            <div className="flex-1 space-y-1.5 overflow-y-auto">
                {(field.options?.length > 0
                    ? field.options
                    : [{ label: 'Option 1', value: 'option1' }]
                ).map((opt) => (
                    <div key={opt.value} className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            name={field.name}
                            value={opt.value}
                            disabled={!preview}
                            className="h-4 w-4 shrink-0 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
                        />
                        <label className="truncate text-sm text-gray-700">
                            {opt.label}
                        </label>
                    </div>
                ))}
            </div>
            {field.helperText && (
                <p className="truncate text-xs text-gray-500">
                    {field.helperText}
                </p>
            )}
        </div>
    );
}

export function LabelField({ field }: InputFieldProps) {
    const fontSize = field.fontSize ?? 24;

    return (
        <div className="flex h-full w-full items-start justify-start">
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
