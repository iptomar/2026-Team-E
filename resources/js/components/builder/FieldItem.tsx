import { useCallback } from 'react';
import { useFormStore } from '@/stores/formBuilderStore';
import { renderFieldComponent } from '@/components/form-fields/FormFields';
import type { FormField } from '@/types/builder';

interface FieldItemProps {
    field: FormField;
}

type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

export function FieldItem({ field }: FieldItemProps) {
    const { selectedFieldId, selectField, removeField, updateField } =
        useFormStore();
    const isSelected = selectedFieldId === field.id;

    const handleClick = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            selectField(field.id);
        },
        [field.id, selectField],
    );

    const handleMouseDown = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            if (!isSelected) {
                selectField(field.id);
            }

            const startX = e.clientX;
            const startY = e.clientY;
            const fieldX = field.x || 0;
            const fieldY = field.y || 0;
            const fieldWidth = field.width || 200;
            const fieldHeight = field.height || 44;

            const onMouseMove = (moveEvent: MouseEvent) => {
                const dx = moveEvent.clientX - startX;
                const dy = moveEvent.clientY - startY;
                const newX = Math.max(0, fieldX + dx);
                const newY = Math.max(0, fieldY + dy);
                updateField(field.id, { x: newX, y: newY });
            };

            const onMouseUp = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        },
        [isSelected, field.id, field.x, field.y, selectField, updateField],
    );

    const handleResizeStart = useCallback(
        (e: React.MouseEvent, handle: ResizeHandle) => {
            e.preventDefault();
            e.stopPropagation();

            const startX = e.clientX;
            const startY = e.clientY;
            const fieldX = field.x || 0;
            const fieldY = field.y || 0;
            const fieldWidth = field.width || 200;
            const fieldHeight = field.height || 44;

            const onMouseMove = (moveEvent: MouseEvent) => {
                const dx = moveEvent.clientX - startX;
                const dy = moveEvent.clientY - startY;

                let newWidth = fieldWidth;
                let newHeight = fieldHeight;
                let newX = fieldX;
                let newY = fieldY;

                switch (handle) {
                    case 'e':
                        newWidth = Math.max(80, fieldWidth + dx);
                        break;
                    case 's':
                        newHeight = Math.max(30, fieldHeight + dy);
                        break;
                    case 'w':
                        newWidth = Math.max(80, fieldWidth - dx);
                        newX = fieldX + (fieldWidth - newWidth);
                        break;
                    case 'n':
                        newHeight = Math.max(30, fieldHeight - dy);
                        newY = fieldY + (fieldHeight - newHeight);
                        break;
                    case 'se':
                        newWidth = Math.max(80, fieldWidth + dx);
                        newHeight = Math.max(30, fieldHeight + dy);
                        break;
                    case 'sw':
                        newWidth = Math.max(80, fieldWidth - dx);
                        newHeight = Math.max(30, fieldHeight + dy);
                        newX = fieldX + (fieldWidth - newWidth);
                        break;
                    case 'ne':
                        newWidth = Math.max(80, fieldWidth + dx);
                        newHeight = Math.max(30, fieldHeight - dy);
                        newY = fieldY + (fieldHeight - newHeight);
                        break;
                    case 'nw':
                        newWidth = Math.max(80, fieldWidth - dx);
                        newHeight = Math.max(30, fieldHeight - dy);
                        newX = fieldX + (fieldWidth - newWidth);
                        newY = fieldY + (fieldHeight - newHeight);
                        break;
                }

                updateField(field.id, {
                    width: newWidth,
                    height: newHeight,
                    x: newX,
                    y: newY,
                });
            };

            const onMouseUp = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        },
        [field.id, field.x, field.y, field.width, field.height, updateField],
    );

    const handleStyle: React.CSSProperties = {
        position: 'absolute',
        left: field.x || 0,
        top: field.y || 0,
        width: field.width || 200,
        height: field.height || 44,
    };

    const handleClass = `absolute bg-white border-2 rounded-lg shadow-sm transition-shadow hover:shadow-md cursor-move ${
        isSelected ? 'border-indigo-500 shadow-md' : 'border-gray-200'
    }`;

    const handleDelete = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            removeField(field.id);
        },
        [field.id, removeField],
    );

    return (
        <div
            style={handleStyle}
            className={handleClass}
            onClick={handleClick}
            onMouseDown={handleMouseDown}
        >
            <div className="h-full w-full p-2">
                {renderFieldComponent(field)}
            </div>

            {isSelected && (
                <>
                    <div className="absolute -top-1 -left-1 h-2 w-2 rounded-full bg-indigo-500" />
                    <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-indigo-500" />
                    <div className="absolute -bottom-1 -left-1 h-2 w-2 rounded-full bg-indigo-500" />
                    <div className="absolute -right-1 -bottom-1 h-2 w-2 rounded-full bg-indigo-500" />

                    <button
                        className="absolute -top-3 -right-3 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md transition-all hover:scale-110 hover:bg-red-600"
                        onClick={handleDelete}
                        title="Delete"
                    >
                        <svg
                            className="h-3 w-3"
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

                    <div
                        className="absolute top-1/2 -left-2 h-4 w-4 -translate-y-1/2 cursor-w-resize rounded-full border-2 border-indigo-500 bg-white hover:bg-indigo-100"
                        onMouseDown={(e) => handleResizeStart(e, 'w')}
                    />
                    <div
                        className="absolute top-1/2 -right-2 h-4 w-4 -translate-y-1/2 cursor-e-resize rounded-full border-2 border-indigo-500 bg-white hover:bg-indigo-100"
                        onMouseDown={(e) => handleResizeStart(e, 'e')}
                    />
                    <div
                        className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 cursor-n-resize rounded-full border-2 border-indigo-500 bg-white hover:bg-indigo-100"
                        onMouseDown={(e) => handleResizeStart(e, 'n')}
                    />
                    <div
                        className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 cursor-s-resize rounded-full border-2 border-indigo-500 bg-white hover:bg-indigo-100"
                        onMouseDown={(e) => handleResizeStart(e, 's')}
                    />

                    <div
                        className="absolute -top-2 -left-2 h-4 w-4 cursor-nw-resize rounded-full border-2 border-indigo-500 bg-white hover:bg-indigo-100"
                        onMouseDown={(e) => handleResizeStart(e, 'nw')}
                    />
                    <div
                        className="absolute -top-2 -right-2 h-4 w-4 cursor-ne-resize rounded-full border-2 border-indigo-500 bg-white hover:bg-indigo-100"
                        onMouseDown={(e) => handleResizeStart(e, 'ne')}
                    />
                    <div
                        className="absolute -bottom-2 -left-2 h-4 w-4 cursor-sw-resize rounded-full border-2 border-indigo-500 bg-white hover:bg-indigo-100"
                        onMouseDown={(e) => handleResizeStart(e, 'sw')}
                    />
                    <div
                        className="absolute -right-2 -bottom-2 h-4 w-4 cursor-se-resize rounded-full border-2 border-indigo-500 bg-white hover:bg-indigo-100"
                        onMouseDown={(e) => handleResizeStart(e, 'se')}
                    />
                </>
            )}
        </div>
    );
}
