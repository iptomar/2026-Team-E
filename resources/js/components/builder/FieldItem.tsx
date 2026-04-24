import { useCallback, useRef, useEffect, useMemo } from 'react';
import { renderFieldComponent } from '@/components/form-fields/FormFields';
import { useFormStore } from '@/stores/formBuilderStore';
import type { FormField } from '@/types/builder';

interface FieldItemProps {
    field: FormField;
    canvasWidth?: number;
    canvasHeight?: number;
}

type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

const MIN_WIDTH = 80;
const MIN_HEIGHT = 30;
const GRID_SIZE = 10;

function snapToGrid(value: number): number {
    return Math.round(value / GRID_SIZE) * GRID_SIZE;
}

export function FieldItem({
    field,
    canvasWidth = 794,
    canvasHeight = 1123,
}: FieldItemProps) {
    const { selectedFieldId, selectField, removeField, updateField } =
        useFormStore();
    const isSelected = selectedFieldId === field.id;

    const elementRef = useRef<HTMLDivElement>(null);
    const isDraggingRef = useRef(false);
    const startPos = useRef({ clientX: 0, clientY: 0, fieldX: 0, fieldY: 0 });

    const handleClick = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            selectField(field.id);
        },
        [field.id, selectField],
    );

    const handleDelete = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            removeField(field.id);
        },
        [field.id, removeField],
    );

    const startResize = useCallback(
        (e: React.MouseEvent, handle: ResizeHandle) => {
            e.preventDefault();
            e.stopPropagation();

            const startX = e.clientX;
            const startY = e.clientY;
            const fieldX = field.x || 0;
            const fieldY = field.y || 0;
            const fieldWidth = field.width || 200;
            const fieldHeight = field.height || 44;

            const handleMouseMove = (moveEvent: MouseEvent) => {
                const dx = moveEvent.clientX - startX;
                const dy = moveEvent.clientY - startY;

                let newWidth = fieldWidth;
                let newHeight = fieldHeight;
                let newX = fieldX;
                let newY = fieldY;

                switch (handle) {
                    case 'e':
                        newWidth = Math.max(MIN_WIDTH, fieldWidth + dx);
                        break;
                    case 's':
                        newHeight = Math.max(MIN_HEIGHT, fieldHeight + dy);
                        break;
                    case 'w':
                        newWidth = Math.max(MIN_WIDTH, fieldWidth - dx);
                        newX = fieldX + (fieldWidth - newWidth);
                        break;
                    case 'n':
                        newHeight = Math.max(MIN_HEIGHT, fieldHeight - dy);
                        newY = fieldY + (fieldHeight - newHeight);
                        break;
                    case 'se':
                        newWidth = Math.max(MIN_WIDTH, fieldWidth + dx);
                        newHeight = Math.max(MIN_HEIGHT, fieldHeight + dy);
                        break;
                    case 'sw':
                        newWidth = Math.max(MIN_WIDTH, fieldWidth - dx);
                        newHeight = Math.max(MIN_HEIGHT, fieldHeight + dy);
                        newX = fieldX + (fieldWidth - newWidth);
                        break;
                    case 'ne':
                        newWidth = Math.max(MIN_WIDTH, fieldWidth + dx);
                        newHeight = Math.max(MIN_HEIGHT, fieldHeight - dy);
                        newY = fieldY + (fieldHeight - newHeight);
                        break;
                    case 'nw':
                        newWidth = Math.max(MIN_WIDTH, fieldWidth - dx);
                        newHeight = Math.max(MIN_HEIGHT, fieldHeight - dy);
                        newX = fieldX + (fieldWidth - newWidth);
                        newY = fieldY + (fieldHeight - newHeight);
                        break;
                }

                const boundedX = Math.max(
                    0,
                    Math.min(canvasWidth - newWidth, newX),
                );
                const boundedY = Math.max(
                    0,
                    Math.min(canvasHeight - newHeight, newY),
                );
                const boundedWidth = Math.min(canvasWidth - boundedX, newWidth);
                const boundedHeight = Math.min(
                    canvasHeight - boundedY,
                    newHeight,
                );

                updateField(field.id, {
                    width: Math.round(boundedWidth),
                    height: Math.round(boundedHeight),
                    x: Math.round(boundedX),
                    y: Math.round(boundedY),
                });
            };

            const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        },
        [
            field.id,
            field.x,
            field.y,
            field.width,
            field.height,
            updateField,
            canvasWidth,
            canvasHeight,
        ],
    );

    const handleMouseDown = useCallback(
        (e: React.MouseEvent) => {
            if (e.button !== 0) {
                return;
            }

            e.preventDefault();
            e.stopPropagation();

            if (!isSelected) {
                selectField(field.id);
            }

            isDraggingRef.current = true;
            startPos.current = {
                clientX: e.clientX,
                clientY: e.clientY,
                fieldX: field.x || 0,
                fieldY: field.y || 0,
            };

            const handleMouseMove = (moveEvent: MouseEvent) => {
                if (!isDraggingRef.current) {
                    return;
                }

                const dx = moveEvent.clientX - startPos.current.clientX;
                const dy = moveEvent.clientY - startPos.current.clientY;

                const rawX = startPos.current.fieldX + dx;
                const rawY = startPos.current.fieldY + dy;

                const snappedX = snapToGrid(rawX);
                const snappedY = snapToGrid(rawY);

                const fieldWidth = field.width || 200;
                const fieldHeight = field.height || 60;

                const boundedX = Math.max(
                    0,
                    Math.min(canvasWidth - fieldWidth, snappedX),
                );
                const boundedY = Math.max(
                    0,
                    Math.min(canvasHeight - fieldHeight, snappedY),
                );

                if (elementRef.current) {
                    elementRef.current.style.left = `${boundedX}px`;
                    elementRef.current.style.top = `${boundedY}px`;
                }
            };

            const handleMouseUp = () => {
                if (!isDraggingRef.current) {
                    return;
                }

                isDraggingRef.current = false;

                const dx = (startPos.current as any)._lastDx || 0;
                const dy = (startPos.current as any)._lastDy || 0;

                const fieldWidth = field.width || 200;
                const fieldHeight = field.height || 60;

                const finalX = Math.max(
                    0,
                    Math.min(canvasWidth - fieldWidth, field.x || 0),
                );
                const finalY = Math.max(
                    0,
                    Math.min(canvasHeight - fieldHeight, field.y || 0),
                );

                if (elementRef.current) {
                    const currentX =
                        parseInt(elementRef.current.style.left, 10) ||
                        field.x ||
                        0;
                    const currentY =
                        parseInt(elementRef.current.style.top, 10) ||
                        field.y ||
                        0;
                    updateField(field.id, { x: currentX, y: currentY });
                }

                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        },
        [
            field.id,
            field.x,
            field.y,
            field.width,
            field.height,
            canvasWidth,
            canvasHeight,
            isSelected,
            selectField,
            updateField,
        ],
    );

    const fieldStyle = useMemo(
        () => ({
            position: 'absolute' as const,
            left: field.x || 0,
            top: field.y || 0,
            width: field.width || 200,
            height: field.height || 44,
        }),
        [field.x, field.y, field.width, field.height],
    );

    const containerClass = isSelected
        ? 'group relative z-10 bg-white rounded-lg border-2 border-indigo-500 shadow-lg cursor-move ring-1 ring-indigo-200'
        : 'group relative bg-white rounded-lg border border-gray-200 shadow-sm cursor-move transition-all hover:border-indigo-300 hover:shadow-md';

    return (
        <div
            ref={elementRef}
            style={fieldStyle}
            className={containerClass}
            onClick={handleClick}
            onMouseDown={handleMouseDown}
        >
            <div className="h-full w-full px-3 py-2.5">
                {renderFieldComponent(field)}
            </div>

            {isSelected && (
                <>
                    <button
                        className="absolute -top-8 right-0 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 shadow-md transition-all hover:scale-110 hover:bg-red-50 hover:text-red-500"
                        onClick={handleDelete}
                        title="Delete field"
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
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                        </svg>
                    </button>

                    <div
                        className="absolute -top-1 -left-1 h-3 w-3 cursor-nw-resize rounded-full bg-indigo-500 shadow-sm ring-2 ring-white transition-transform hover:scale-125"
                        onMouseDown={(e) => startResize(e, 'nw')}
                    />
                    <div
                        className="absolute -top-1 -right-1 h-3 w-3 cursor-ne-resize rounded-full bg-indigo-500 shadow-sm ring-2 ring-white transition-transform hover:scale-125"
                        onMouseDown={(e) => startResize(e, 'ne')}
                    />
                    <div
                        className="absolute -bottom-1 -left-1 h-3 w-3 cursor-sw-resize rounded-full bg-indigo-500 shadow-sm ring-2 ring-white transition-transform hover:scale-125"
                        onMouseDown={(e) => startResize(e, 'sw')}
                    />
                    <div
                        className="absolute -right-1 -bottom-1 h-3 w-3 cursor-se-resize rounded-full bg-indigo-500 shadow-sm ring-2 ring-white transition-transform hover:scale-125"
                        onMouseDown={(e) => startResize(e, 'se')}
                    />

                    <div
                        className="absolute -top-1 left-1/2 h-3 w-3 -translate-x-1/2 cursor-n-resize rounded-full bg-indigo-500 shadow-sm ring-2 ring-white transition-transform hover:scale-125"
                        onMouseDown={(e) => startResize(e, 'n')}
                    />
                    <div
                        className="absolute top-1/2 -right-1 h-3 w-3 -translate-y-1/2 cursor-e-resize rounded-full bg-indigo-500 shadow-sm ring-2 ring-white transition-transform hover:scale-125"
                        onMouseDown={(e) => startResize(e, 'e')}
                    />
                    <div
                        className="absolute -bottom-1 left-1/2 h-3 w-3 -translate-x-1/2 cursor-s-resize rounded-full bg-indigo-500 shadow-sm ring-2 ring-white transition-transform hover:scale-125"
                        onMouseDown={(e) => startResize(e, 's')}
                    />
                    <div
                        className="absolute top-1/2 -left-1 h-3 w-3 -translate-y-1/2 cursor-w-resize rounded-full bg-indigo-500 shadow-sm ring-2 ring-white transition-transform hover:scale-125"
                        onMouseDown={(e) => startResize(e, 'w')}
                    />
                </>
            )}
        </div>
    );
}