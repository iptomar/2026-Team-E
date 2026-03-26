import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { useFormStore } from '../../store/useFormStore';
import { FieldItem } from './FieldItem';

export function Canvas() {
  const { fields, selectField } = useFormStore();

  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas-drop-zone',
  });

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.canvas-inner')) {
      selectField(null);
    }
  };

  return (
    <div
      className="flex-1 bg-gray-100 p-6 overflow-y-auto"
      onClick={handleCanvasClick}
    >
      <div className="max-w-2xl mx-auto">
        <div
          ref={setNodeRef}
          className={`canvas-inner bg-white border-2 border-dashed rounded-xl min-h-[500px] p-6 transition-colors ${
            isOver ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
          }`}
        >
          {fields.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <p className="text-lg font-medium">Drag components here</p>
              <p className="text-sm">Drop items from the left sidebar to build your form</p>
            </div>
          ) : (
            <SortableContext
              items={fields.map((f) => f.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {fields.map((field) => (
                  <FieldItem key={field.id} field={field} />
                ))}
              </div>
            </SortableContext>
          )}
        </div>
      </div>
    </div>
  );
}
