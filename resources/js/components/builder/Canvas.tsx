import { useDroppable } from '@dnd-kit/core';
import { useEffect, useRef, useState } from 'react';
import { useFormStore } from '@/stores/formBuilderStore';
import { FieldItem } from './FieldItem';

const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;

export function Canvas({
    onCanvasReady,
}: {
    onCanvasReady?: (el: HTMLDivElement | null) => void;
}) {
    const { fields, selectField, clearForm } = useFormStore();

    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const canvasRef = useRef<HTMLDivElement | null>(null);

    const { setNodeRef, isOver } = useDroppable({
        id: 'canvas-drop-zone',
    });

    const hasFields = fields.length > 0;

    useEffect(() => {
        if (canvasRef.current && onCanvasReady) {
            onCanvasReady(canvasRef.current);
        }
    }, [onCanvasReady]);

    useEffect(() => {
        if (!showClearConfirm) return;

        const t = setTimeout(() => setShowClearConfirm(false), 3000);
        return () => clearTimeout(t);
    }, [showClearConfirm]);

    const handleCanvasClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            selectField(null);
        }
    };

    const handleClearCanvas = () => {
        if (showClearConfirm) {
            clearForm();
            setShowClearConfirm(false);
        } else {
            setShowClearConfirm(true);
        }
    };

    return (
        <div className="flex h-full w-full items-center justify-center overflow-hidden bg-gray-200 p-6">
            {/* 📄 A4 CANVAS (DROP ZONE REAL) */}
            <div
                ref={(el) => {
                    setNodeRef(el);
                    canvasRef.current = el;
                }}
                onClick={handleCanvasClick}
                className={`relative bg-white shadow-2xl transition-all ${isOver ? 'ring-2 ring-indigo-400' : ''} `}
                style={{
                    width: '210mm',
                    height: '297mm',
                }}
            >
                {/* GRID (dentro da folha) */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-30"
                    style={{
                        backgroundImage: `
                            repeating-linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                            repeating-linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
                        `,
                        backgroundSize: '20px 20px',
                    }}
                />

                {/* CLEAR BUTTON */}
                {hasFields && (
                    <div className="absolute -top-10 left-1/2 z-10 -translate-x-1/2">
                        <button
                            onClick={handleClearCanvas}
                            className={`flex h-7 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 text-xs font-medium text-gray-500 shadow-md transition-all hover:scale-105 hover:border-red-200 hover:bg-red-50 hover:text-red-500 ${showClearConfirm ? 'border-red-500 bg-red-500 text-white hover:border-red-600 hover:bg-red-600 hover:text-white' : ''} `}
                        >
                            {showClearConfirm ? (
                                <>
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
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                    Confirm
                                </>
                            ) : (
                                <>
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
                                    Clear
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* FIELDS */}
                {fields.map((field) => (
                    <FieldItem
                        key={field.id}
                        field={field}
                        canvasWidth={A4_WIDTH_PX}
                        canvasHeight={A4_HEIGHT_PX}
                    />
                ))}

                {/* EMPTY STATE */}
                {!hasFields && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                        <div className="mb-3 text-4xl">📄</div>
                        <div className="font-semibold">Empty A4 Canvas</div>
                        <div className="text-sm">Drag components here</div>
                    </div>
                )}

                {/* FOOTER */}
                {hasFields && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-white/70 px-2 py-1 text-xs text-gray-500">
                        {fields.length} field{fields.length === 1 ? '' : 's'} •
                        A4
                    </div>
                )}
            </div>
        </div>
    );
}
