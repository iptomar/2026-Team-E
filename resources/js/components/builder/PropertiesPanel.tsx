import { useEffect, useRef } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { useFormStore } from '@/stores/formBuilderStore';
import type { Option } from '@/types/builder';

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
    const isResettingRef = useRef(false);

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

    useEffect(() => {
        if (selectedField) {
            isResettingRef.current = true;
            reset({
                label: selectedField.label || '',
                name: selectedField.name || '',
                placeholder: selectedField.placeholder || '',
                required: selectedField.required || false,
                fontSize: selectedField.fontSize || 14,
                options:
                    selectedField.options?.map((o) => ({
                        label: o.label || '',
                        value: o.value || '',
                    })) || [],
            });
            setTimeout(() => {
                isResettingRef.current = false;
            }, 0);
        }
    }, [
        selectedField?.id,
        selectedField?.label,
        selectedField?.name,
        selectedField?.placeholder,
        selectedField?.required,
        selectedField?.fontSize,
        selectedField?.options,
        reset,
    ]);

    useEffect(() => {
        if (
            isResettingRef.current ||
            !selectedFieldId ||
            !formValues ||
            !selectedField
        ) {
            return;
        }

        const hasChanges =
            formValues.label !== selectedField.label ||
            formValues.name !== selectedField.name ||
            formValues.placeholder !== selectedField.placeholder ||
            formValues.required !== selectedField.required ||
            formValues.fontSize !== selectedField.fontSize ||
            JSON.stringify(formValues.options) !==
                JSON.stringify(selectedField.options);

        if (hasChanges) {
            updateField(selectedFieldId, {
                label: formValues.label,
                name: formValues.name,
                placeholder: formValues.placeholder,
                required: formValues.required,
                fontSize: formValues.fontSize,
                options: formValues.options,
            });
        }
    }, [formValues, selectedFieldId, selectedField, updateField]);

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'options',
    });

    if (!selectedField) {
        return (
            <div className="flex w-80 items-center justify-center border-l border-gray-200 bg-gray-50 p-4">
                <div className="text-center text-gray-400">
                    <svg
                        className="mx-auto mb-3 h-12 w-12"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                        />
                    </svg>
                    <p className="text-sm">Select a component to edit</p>
                </div>
            </div>
        );
    }

    const hasOptions = ['select', 'radio', 'checkbox'].includes(
        selectedField.type,
    );

    return (
        <div className="w-80 overflow-y-auto border-l border-gray-200 bg-white">
            <div className="p-4">
                <h2 className="mb-4 text-lg font-semibold text-gray-800">
                    Properties
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Label
                        </label>
                        <input
                            {...register('label')}
                            type="text"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Field Name
                        </label>
                        <input
                            {...register('name')}
                            type="text"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                    </div>

                    {(selectedField.type === 'input' ||
                        selectedField.type === 'textarea' ||
                        selectedField.type === 'select') && (
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Placeholder
                            </label>
                            <input
                                {...register('placeholder')}
                                type="text"
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                        </div>
                    )}

                    <div className="flex items-center">
                        <input
                            {...register('required')}
                            type="checkbox"
                            id="required"
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label
                            htmlFor="required"
                            className="ml-2 block text-sm text-gray-700"
                        >
                            Required
                        </label>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Font Size (px)
                        </label>
                        <input
                            {...register('fontSize', { valueAsNumber: true })}
                            type="number"
                            min="8"
                            max="72"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                    </div>

                    {hasOptions && (
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Options
                            </label>
                            {fields.map((field, index) => (
                                <div
                                    key={field.id}
                                    className="flex items-start gap-2"
                                >
                                    <input
                                        {...register(
                                            `options.${index}.label` as const,
                                        )}
                                        placeholder="Label"
                                        className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    />
                                    <input
                                        {...register(
                                            `options.${index}.value` as const,
                                        )}
                                        placeholder="Value"
                                        className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => remove(index)}
                                        className="p-1 text-red-500 hover:text-red-700"
                                    >
                                        <svg
                                            className="h-5 w-5"
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
                            <button
                                type="button"
                                onClick={() => append({ label: '', value: '' })}
                                className="w-full rounded border border-dashed border-gray-300 px-3 py-1 text-sm text-gray-600 transition-colors hover:border-indigo-400 hover:text-indigo-600"
                            >
                                + Add Option
                            </button>
                        </div>
                    )}

                    <div className="border-t border-gray-200 pt-4">
                        <p className="text-xs text-gray-500">
                            Type:{' '}
                            <span className="font-medium capitalize">
                                {selectedField.type}
                            </span>
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                            Size:{' '}
                            <span className="font-mono text-xs">
                                {selectedField.width} x {selectedField.height}px
                            </span>
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                            ID:{' '}
                            <span className="font-mono text-xs">
                                {selectedField.id.slice(0, 8)}
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
