import { useDroppable } from '@dnd-kit/core';
import { useFormStore } from '@/stores/formBuilderStore';
import { FieldItem } from './FieldItem';

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
                    isOver ? 'ring-4 ring-indigo-400 ring-opacity-50' : ''
                }`}
                style={{
                    width: A4_SHEET_WIDTH_PX,
                    height: A4_SHEET_HEIGHT_PX,
                    minWidth: A4_SHEET_WIDTH_PX,
                    minHeight: A4_SHEET_HEIGHT_PX,
                }}
            >
                {/* GRID (não bloquear eventos) */}
                <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                        backgroundImage:
                            'linear-gradient(to right, #f0f0f0 1px, transparent 1px), linear-gradient(to bottom, #f0f0f0 1px, transparent 1px)',
                        backgroundSize: '20px 20px',
                    }}
                />

                {/* EMPTY STATE */}
                {fields.length === 0 && (
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                        <p className="text-xl font-semibold">
                            Drop components here
                        </p>
                        <p className="text-sm">
                            Drag items from the sidebar
                        </p>
                    </div>
                )}

                {/* FIELDS */}
                {fields.map((field) => (
                    <FieldItem key={field.id} field={field} />
                ))}
            </div>
        </div>
    );
}