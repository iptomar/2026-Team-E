import { useCallback } from 'react';
import { renderFieldComponent } from '@/components/form-fields/FormFields';
import { useFormStore } from '@/stores/formBuilderStore';
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
            const fieldX = field.x ?? 0;
            const fieldY = field.y ?? 0;

            const onMouseMove = (moveEvent: MouseEvent) => {
                const dx = moveEvent.clientX - startX;
                const dy = moveEvent.clientY - startY;

                updateField(field.id, {
                    x: Math.max(0, fieldX + dx),
                    y: Math.max(0, fieldY + dy),
                });
            };

            const onMouseUp = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        },
        [
            isSelected,
            field.id,
            field.x,
            field.y,
            selectField,
            updateField,
        ],
    );

    const handleResizeStart = useCallback(
        (e: React.MouseEvent, handle: ResizeHandle) => {
            e.preventDefault();
            e.stopPropagation();

            const startX = e.clientX;
            const startY = e.clientY;

            const fieldX = field.x ?? 0;
            const fieldY = field.y ?? 0;
            const fieldWidth = field.width ?? 200;
            const fieldHeight = field.height ?? 44;

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

    const style: React.CSSProperties = {
        position: 'absolute',
        left: field.x ?? 0,
        top: field.y ?? 0,
        width: field.width ?? 200,
        height: field.height ?? 44,
    };

    return (
        <div
            style={style}
            className={`absolute bg-white border-2 rounded-lg shadow-sm cursor-move ${
                isSelected ? 'border-indigo-500' : 'border-gray-200'
            }`}
            onClick={handleClick}
            onMouseDown={handleMouseDown}
        >
            <div className="h-full w-full p-2">
                {renderFieldComponent(field)}
            </div>

            {isSelected && (
                <>
                    {/* DELETE */}
                    <button
                        className="absolute -top-3 -right-3 h-6 w-6 bg-red-500 text-white rounded-full"
                        onClick={handleDelete}
                    >
                        ✕
                    </button>

                    {/* RESIZE HANDLES */}
                    <div
                        className="absolute -right-2 -bottom-2 h-4 w-4 bg-white border cursor-se-resize"
                        onMouseDown={(e) => handleResizeStart(e, 'se')}
                    />
                    <div
                        className="absolute -left-2 -bottom-2 h-4 w-4 bg-white border cursor-sw-resize"
                        onMouseDown={(e) => handleResizeStart(e, 'sw')}
                    />
                    <div
                        className="absolute -right-2 -top-2 h-4 w-4 bg-white border cursor-ne-resize"
                        onMouseDown={(e) => handleResizeStart(e, 'ne')}
                    />
                    <div
                        className="absolute -left-2 -top-2 h-4 w-4 bg-white border cursor-nw-resize"
                        onMouseDown={(e) => handleResizeStart(e, 'nw')}
                    />
                </>
            )}
        </div>
    );

    function handleDelete(e: React.MouseEvent) {
        e.stopPropagation();
        removeField(field.id);
    }
}