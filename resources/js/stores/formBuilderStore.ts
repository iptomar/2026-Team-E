import { arrayMove } from '@dnd-kit/sortable';
import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FormField, FieldType } from '@/types/builder';

interface FormBuilderState {
    fields: FormField[];
    selectedFieldId: string | null;
    formName: string;

    addField: (type: FieldType, index?: number) => void;
    removeField: (id: string) => void;
    updateField: (id: string, updates: Partial<FormField>) => void;
    reorderFields: (activeId: string, overId: string) => void;
    selectField: (id: string | null) => void;
    clearForm: () => void;
    setFormName: (name: string) => void;
    getSelectedField: () => FormField | null;
}

const createDefaultField = (type: FieldType): FormField => {
    const id = uuidv4();
    const baseField = {
        id,
        type,
        label: getDefaultLabel(type),
        required: false,
        name: `field_${id.slice(0, 8)}`,
    };

    switch (type) {
        case 'input':
            return { ...baseField, placeholder: 'Enter text...' };
        case 'textarea':
            return { ...baseField, placeholder: 'Enter description...' };
        case 'select':
            return {
                ...baseField,
                placeholder: 'Select an option...',
                options: [
                    { label: 'Option 1', value: 'option1' },
                    { label: 'Option 2', value: 'option2' },
                ],
            };
        case 'radio':
            return {
                ...baseField,
                options: [
                    { label: 'Option 1', value: 'option1' },
                    { label: 'Option 2', value: 'option2' },
                ],
            };
        case 'checkbox':
            return {
                ...baseField,
                options: [
                    { label: 'Checkbox 1', value: 'checkbox1' },
                    { label: 'Checkbox 2', value: 'checkbox2' },
                ],
            };
        case 'label':
            return { ...baseField, label: 'Label Text' };
        default:
            return baseField;
    }
};

const getDefaultLabel = (type: FieldType): string => {
    const labels: Record<FieldType, string> = {
        input: 'Text Input',
        select: 'Select Dropdown',
        radio: 'Radio Group',
        checkbox: 'Checkbox Group',
        textarea: 'Text Area',
        label: 'Label',
    };

    return labels[type];
};

export const useFormStore = create<FormBuilderState>()(
    persist(
        (set, get) => ({
            fields: [],
            selectedFieldId: null,
            formName: 'Untitled Form',

            addField: (type, index) => {
                const newField = createDefaultField(type);
                set((state) => {
                    const newFields = [...state.fields];

                    if (index !== undefined) {
                        newFields.splice(index, 0, newField);
                    } else {
                        newFields.push(newField);
                    }

                    return { fields: newFields, selectedFieldId: newField.id };
                });
            },

            removeField: (id) => {
                set((state) => ({
                    fields: state.fields.filter((f) => f.id !== id),
                    selectedFieldId:
                        state.selectedFieldId === id
                            ? null
                            : state.selectedFieldId,
                }));
            },

            updateField: (id, updates) => {
                set((state) => ({
                    fields: state.fields.map((f) =>
                        f.id === id ? { ...f, ...updates } : f,
                    ),
                }));
            },

            reorderFields: (activeId, overId) => {
                set((state) => {
                    const oldIndex = state.fields.findIndex(
                        (f) => f.id === activeId,
                    );
                    const newIndex = state.fields.findIndex(
                        (f) => f.id === overId,
                    );

                    if (oldIndex === -1 || newIndex === -1) {
return state;
}

                    return {
                        fields: arrayMove(state.fields, oldIndex, newIndex),
                    };
                });
            },

            selectField: (id) => {
                set({ selectedFieldId: id });
            },

            clearForm: () => {
                set({ fields: [], selectedFieldId: null });
            },

            setFormName: (name) => {
                set({ formName: name });
            },

            getSelectedField: () => {
                const state = get();

                return (
                    state.fields.find((f) => f.id === state.selectedFieldId) ||
                    null
                );
            },
        }),
        {
            name: 'form-builder-storage',
        },
    ),
);
