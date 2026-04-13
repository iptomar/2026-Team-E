import { useDroppable } from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useFormStore } from '@/stores/formBuilderStore';
import { FieldItem } from './FieldItem';

export function Canvas() {
    const { fields, selectField } = useFormStore();

    const { setNodeRef, isOver } = useDroppable({
        id: 'canvas-drop-zone',
    });

    const handleCanvasClick = (e: React.MouseEvent) => {
        if (
            e.target === e.currentTarget ||
            (e.target as HTMLElement).closest('.canvas-inner')
        ) {
            selectField(null);
        }
    };

    return (
        <div
            className="flex-1 overflow-y-auto bg-gray-100 p-6"
            onClick={handleCanvasClick}
        >
            <div className="mx-auto max-w-2xl">
                <div
                    ref={setNodeRef}
                    className={`canvas-inner min-h-[500px] rounded-xl border-2 border-dashed bg-white p-6 transition-colors ${
                        isOver
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-300'
                    }`}
                >
                    {fields.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center text-gray-400">
                            <svg
                                className="mb-4 h-16 w-16"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                />
                            </svg>
                            <p className="text-lg font-medium">
                                Drag components here
                            </p>
                            <p className="text-sm">
                                Drop items from the left sidebar to build your
                                form
                            </p>
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
