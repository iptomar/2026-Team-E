import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { renderFieldComponent } from '@/components/form-fields/FormFields';
import { useFormStore } from '@/stores/formBuilderStore';
import type { FormField } from '@/types/builder';

interface FieldItemProps {
    field: FormField;
}

export function FieldItem({ field }: FieldItemProps) {
    const { selectedFieldId, selectField, removeField } = useFormStore();
    const isSelected = selectedFieldId === field.id;

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: field.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        selectField(field.id);
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group relative rounded-lg border-2 bg-white p-4 transition-all duration-150 ${isDragging ? 'z-50 scale-[1.02] opacity-50 shadow-xl' : ''} ${isSelected ? 'border-indigo-500 shadow-md' : 'border-gray-200 hover:border-gray-300'} `}
            onClick={handleClick}
        >
            <div className="flex items-start gap-3">
                <div
                    {...attributes}
                    {...listeners}
                    className="flex-shrink-0 cursor-grab rounded p-1 hover:bg-gray-100 active:cursor-grabbing"
                    onClick={(e) => e.stopPropagation()}
                >
                    <svg
                        className="h-5 w-5 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
                    </svg>
                </div>

                <div className="min-w-0 flex-1">
                    {renderFieldComponent(field)}
                </div>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        removeField(field.id);
                    }}
                    className="flex-shrink-0 p-1 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-500"
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
        </div>
    );
}
