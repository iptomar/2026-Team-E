import { arrayMove } from '@dnd-kit/sortable';
import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FormField, FieldType } from '@/types/builder';

interface FormBuilderState {
    fields: FormField[];
    selectedFieldId: string | null;
    formName: string;
    gridSnapEnabled: boolean;
    gridSize: number;

    addField: (type: FieldType, x?: number, y?: number) => void;
    removeField: (id: string) => void;
    updateField: (id: string, updates: Partial<FormField>) => void;
    reorderFields: (activeId: string, overId: string) => void;
    selectField: (id: string | null) => void;
    toggleGridSnap: () => void;
    setGridSize: (size: number) => void;
    clearForm: () => void;
    setFormName: (name: string) => void;
    getSelectedField: () => FormField | null;
}

const GRID_SIZE = 10;

function getDefaultFieldDimensions(type: FieldType): {
    width: number;
    height: number;
} {
    switch (type) {
        case 'input':
            return { width: 400, height: 60 };
        case 'textarea':
            return { width: 400, height: 160 };
        case 'select':
            return { width: 400, height: 60 };
        case 'radio':
            return { width: 400, height: 100 };
        case 'checkbox':
            return { width: 400, height: 100 };
        case 'label':
            return { width: 300, height: 60 };
        default:
            return { width: 400, height: 60 };
    }
}

function createDefaultField(
    type: FieldType,
    x: number = 20,
    y: number = 20,
): FormField {
    const id = uuidv4();
    const dimensions = getDefaultFieldDimensions(type);

    const baseField: FormField = {
        id,
        type,
        label: getDefaultLabel(type),
        required: false,
        name: `field_${id.slice(0, 8)}`,
        x,
        y,
        width: dimensions.width,
        height: dimensions.height,
    };

    switch (type) {
        case 'input':
            return {
                ...baseField,
                placeholder: 'Enter text...',
                fontSize: 14,
            };
        case 'textarea':
            return {
                ...baseField,
                placeholder: 'Enter description...',
                fontSize: 14,
            };
        case 'select':
            return {
                ...baseField,
                placeholder: 'Select an option...',
                fontSize: 14,
                options: [
                    { label: 'Option 1', value: 'option1' },
                    { label: 'Option 2', value: 'option2' },
                ],
            };
        case 'radio':
            return {
                ...baseField,
                fontSize: 14,
                options: [
                    { label: 'Option 1', value: 'option1' },
                    { label: 'Option 2', value: 'option2' },
                ],
            };
        case 'checkbox':
            return {
                ...baseField,
                fontSize: 14,
                options: [
                    { label: 'Checkbox 1', value: 'checkbox1' },
                    { label: 'Checkbox 2', value: 'checkbox2' },
                ],
            };
        case 'label':
            return {
                ...baseField,
                label: 'Label Text',
                fontSize: 24,
            };
        default:
            return baseField;
    }
}

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
            gridSnapEnabled: true,
            gridSize: 10,

            addField: (type, x = 20, y = 20) => {
                const newField = createDefaultField(type, x, y);
                set((state) => ({
                    fields: [...state.fields, newField],
                    selectedFieldId: newField.id,
                }));
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

            toggleGridSnap: () => {
                set((state) => ({ gridSnapEnabled: !state.gridSnapEnabled }));
            },

            setGridSize: (size) => {
                set({ gridSize: size });
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
