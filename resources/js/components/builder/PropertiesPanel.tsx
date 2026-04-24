import { useEffect, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useFormStore } from '@/stores/formBuilderStore';

interface FieldFormData {
    label: string;
    name: string;
    placeholder: string;
    required: boolean;
    fontSize: number;
    options: { label: string; value: string }[];
}

export function PropertiesPanel() {
    const { selectedFieldId, updateField, getSelectedField } = useFormStore();
    const selectedField = getSelectedField();

    const isResetting = useRef(false);

    const { register, control, reset, watch } = useForm<FieldFormData>({
        defaultValues: {
            label: '',
            name: '',
            placeholder: '',
            required: false,
            fontSize: 14,
            options: [],
        },
    });

    const formValues = watch();

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'options',
    });

    // reset when selecting field
    useEffect(() => {
        if (!selectedField) return;

        isResetting.current = true;

        reset({
            label: selectedField.label || '',
            name: selectedField.name || '',
            placeholder: selectedField.placeholder || '',
            required: selectedField.required ?? false,
            fontSize: selectedField.fontSize ?? 14,
            options: selectedField.options ?? [],
        });

        const t = setTimeout(() => {
            isResetting.current = false;
        }, 0);

        return () => clearTimeout(t);
    }, [selectedField?.id]);

    // sync updates
    useEffect(() => {
        if (!selectedField || !selectedFieldId) return;
        if (isResetting.current) return;

        const changed =
            formValues.label !== selectedField.label ||
            formValues.name !== selectedField.name ||
            formValues.placeholder !== selectedField.placeholder ||
            formValues.required !== selectedField.required ||
            formValues.fontSize !== selectedField.fontSize ||
            JSON.stringify(formValues.options) !==
                JSON.stringify(selectedField.options);

        if (!changed) return;

        updateField(selectedFieldId, formValues);
    }, [formValues, selectedFieldId, selectedField]);

    if (!selectedField) {
        return (
            <div className="flex w-96 items-center justify-center border-l border-gray-200 bg-gray-50">
                <div className="text-center text-gray-400">
                    <p className="text-sm font-medium">Select a component</p>
                    <p className="text-xs">to edit properties</p>
                </div>
            </div>
        );
    }

    const hasOptions = ['select', 'radio', 'checkbox'].includes(
        selectedField.type,
    );

    return (
        <div className="w-96 overflow-y-auto border-l border-gray-200 bg-white">
            <div className="p-6">
                {/* HEADER */}
                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Properties
                    </h2>
                    <p className="text-xs text-gray-500">
                        Edit selected field settings
                    </p>
                </div>

                <div className="space-y-5">
                    {/* LABEL */}
                    <PropertyField label="Label" {...register('label')} />

                    {/* NAME */}
                    <PropertyField label="Field Name" {...register('name')} />

                    {/* PLACEHOLDER */}
                    {(selectedField.type === 'input' ||
                        selectedField.type === 'textarea' ||
                        selectedField.type === 'select') && (
                        <PropertyField
                            label="Placeholder"
                            {...register('placeholder')}
                        />
                    )}

                    {/* REQUIRED */}
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            {...register('required')}
                        />
                        <label className="text-sm text-gray-700">
                            Required field
                        </label>
                    </div>

                    {/* FONT SIZE */}
                    <PropertyField
                        label="Font Size"
                        type="number"
                        {...register('fontSize', { valueAsNumber: true })}
                    />

                    {/* OPTIONS (RADIO / SELECT / CHECKBOX) */}
                    {hasOptions && (
                        <div className="space-y-3 rounded-lg bg-indigo-50/50 p-3">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold text-indigo-600 uppercase">
                                    Options
                                </p>

                                <button
                                    type="button"
                                    onClick={() =>
                                        append({
                                            label: 'Option',
                                            value: 'option',
                                        })
                                    }
                                    className="rounded-md bg-indigo-600 px-2 py-1 text-xs text-white transition-colors hover:bg-indigo-700"
                                >
                                    + Add
                                </button>
                            </div>

                            {fields.map((field, index) => (
                                <div
                                    key={field.id}
                                    className="flex items-center gap-2"
                                >
                                    <input
                                        {...register(`options.${index}.label`)}
                                        className="w-full rounded-lg border border-gray-200 px-2 py-1 text-sm transition focus:border-indigo-400 focus:ring-1 focus:ring-indigo-300 focus:outline-none"
                                        placeholder="Label"
                                    />
                                    <input
                                        {...register(`options.${index}.value`)}
                                        className="w-full rounded-lg border border-gray-200 px-2 py-1 text-sm transition focus:border-indigo-400 focus:ring-1 focus:ring-indigo-300 focus:outline-none"
                                        placeholder="Value"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => remove(index)}
                                        className="flex h-5 w-5 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                                    >
                                        <svg
                                            className="h-3 w-3"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* INFO */}
                    <div className="rounded-lg bg-indigo-50/50 p-4">
                        <p className="text-xs font-semibold text-indigo-600 uppercase">
                            Field Info
                        </p>
                        <div className="mt-2 space-y-1 text-xs text-gray-600">
                            <p>Type: {selectedField.type}</p>
                            <p>
                                Size: {selectedField.width} ×{' '}
                                {selectedField.height}px
                            </p>
                            <p>ID: {selectedField.id.slice(0, 8)}...</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* INPUT COMPONENT (clean + consistent) */
function PropertyField({
    label,
    ...props
}: React.ComponentProps<'input'> & { label: string }) {
    return (
        <div>
            <label className="mb-1 block text-xs font-medium text-gray-500 uppercase">
                {label}
            </label>
            <input
                {...props}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm transition focus:border-indigo-400 focus:ring-1 focus:ring-indigo-300 focus:outline-none"
            />
        </div>
    );
}