export type FieldType =
    | 'input'
    | 'select'
    | 'radio'
    | 'checkbox'
    | 'textarea'
    | 'label';

export interface ValidationRule {
    type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'min' | 'max';
    value?: string | number;
    message: string;
}

export interface Option {
    label: string;
    value: string;
}

export interface FormField {
    id: string;
    type: FieldType;
    label: string;
    placeholder?: string;
    required: boolean;
    options?: Option[];
    validation?: ValidationRule[];
    name: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    fontSize?: number;
    helperText?: string;
    defaultValue?: string;
    minLength?: number;
    maxLength?: number;
}

export interface ComponentConfig {
    type: FieldType;
    label: string;
    icon: string;
    defaultProps: Partial<FormField>;
}

export interface DragData {
    type: 'sidebar-item' | 'canvas-item';
    fieldType?: FieldType;
    fieldId?: string;
}

export interface FormSchema {
    id: string;
    name: string;
    fields: FormField[];
    createdAt: string;
    updatedAt: string;
}
