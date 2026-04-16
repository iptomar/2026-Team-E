import { useDroppable } from '@dnd-kit/core';
import { useFormStore } from '@/stores/formBuilderStore';
import { FieldItem } from './FieldItem';

const A4_WIDTH = 595;
const A4_HEIGHT = 842;
const A4_SHEET_WIDTH_PX = 595 * 2;
const A4_SHEET_HEIGHT_PX = 842 * 2;

export function Canvas() {
    const { fields, selectField } = useFormStore();

    const { setNodeRef, isOver } = useDroppable({
        id: 'canvas-drop-zone',
    });

    const handleCanvasClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            selectField(null);
        }
    };

    return (
        <div
            className="flex-1 overflow-auto bg-gradient-to-br from-gray-100 to-gray-300 p-8"
            onClick={handleCanvasClick}
        >
            <div
                ref={setNodeRef}
                className={`relative mx-auto rounded-sm bg-white shadow-2xl ${
                    isOver ? 'ring-opacity-50 ring-4 ring-indigo-400' : ''
                }`}
                style={{
                    width: A4_SHEET_WIDTH_PX,
                    height: A4_SHEET_HEIGHT_PX,
                    minWidth: A4_SHEET_WIDTH_PX,
                    minHeight: A4_SHEET_HEIGHT_PX,
                    position: 'relative',
                }}
            >
                <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                        backgroundImage:
                            'linear-gradient(to right, #f0f0f0 1px, transparent 1px), linear-gradient(to bottom, #f0f0f0 1px, transparent 1px)',
                        backgroundSize: '20px 20px',
                    }}
                />
                {fields.length === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                        <div className="mb-6 rounded-full bg-gray-100 p-6">
                            <svg
                                className="h-16 w-16 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                />
                            </svg>
                        </div>
                        <p className="mb-2 text-xl font-semibold text-gray-500">
                            Drop components here
                        </p>
                        <p className="text-base text-gray-400">
                            Drag items from the left sidebar onto the canvas
                        </p>
                    </div>
                )}
                {fields.map((field) => (
                    <FieldItem key={field.id} field={field} />
                ))}
            </div>
        </div>
    );
}
