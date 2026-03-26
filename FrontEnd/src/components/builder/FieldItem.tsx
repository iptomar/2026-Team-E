import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { FormField } from '../../types';
import { renderFieldComponent } from '../form-fields/FormFields';
import { useFormStore } from '../../store/useFormStore';

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
      className={`
        group relative bg-white border-2 rounded-lg p-4 transition-all duration-150
        ${isDragging ? 'opacity-50 shadow-xl scale-[1.02] z-50' : ''}
        ${isSelected ? 'border-indigo-500 shadow-md' : 'border-gray-200 hover:border-gray-300'}
      `}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div
          {...attributes}
          {...listeners}
          className="flex-shrink-0 cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
          onClick={(e) => e.stopPropagation()}
        >
          <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
          </svg>
        </div>
        
        <div className="flex-1 min-w-0">
          {renderFieldComponent(field)}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            removeField(field.id);
          }}
          className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
