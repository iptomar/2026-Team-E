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
        if (!selectedField) {
return;
}

        isResettingRef.current = true;

        reset({
            label: selectedField.label ?? '',
            name: selectedField.name ?? '',
            placeholder: selectedField.placeholder ?? '',
            required: selectedField.required ?? false,
            fontSize: selectedField.fontSize ?? 14,
            options:
                selectedField.options?.map((o) => ({
                    label: o.label ?? '',
                    value: o.value ?? '',
                })) ?? [],
        });

        const timeout = setTimeout(() => {
            isResettingRef.current = false;
        }, 0);

        return () => clearTimeout(timeout);
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
            !selectedField
        ) {
            return;
        }

        if (!formValues) {
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

        if (!hasChanges) {
return;
}

        updateField(selectedFieldId, {
            label: formValues.label,
            name: formValues.name,
            placeholder: formValues.placeholder,
            required: formValues.required,
            fontSize: formValues.fontSize,
            options: formValues.options,
        });
    }, [formValues, selectedFieldId, selectedField, updateField]);

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'options',
    });

    if (!selectedField) {
        return (
            <div className="flex w-80 items-center justify-center border-l border-gray-200 bg-gray-50 p-4">
                <div className="text-center text-gray-400">
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
                    <input {...register('label')} />
                    <input {...register('name')} />

                    {(selectedField.type === 'input' ||
                        selectedField.type === 'textarea' ||
                        selectedField.type === 'select') && (
                        <input {...register('placeholder')} />
                    )}

                    <input {...register('required')} type="checkbox" />

                    <input
                        {...register('fontSize', { valueAsNumber: true })}
                        type="number"
                    />

                    {hasOptions && (
                        <div>
                            {fields.map((field, index) => (
                                <div key={field.id}>
                                    <input
                                        {...register(
                                            `options.${index}.label` as const,
                                        )}
                                    />
                                    <input
                                        {...register(
                                            `options.${index}.value` as const,
                                        )}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => remove(index)}
                                    >
                                        X
                                    </button>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={() =>
                                    append({ label: '', value: '' })
                                }
                            >
                                + Add Option
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}