import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
    DndContext,
    DragOverlay,
    useSensor,
    useSensors,
    PointerSensor,
    KeyboardSensor,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Head } from '@inertiajs/react';
import { useState, useRef, useCallback } from 'react';
import { Canvas } from '@/components/builder/Canvas';
import { ComponentsSidebar } from '@/components/builder/ComponentsSidebar';
import { PropertiesPanel } from '@/components/builder/PropertiesPanel';
import { useFormStore } from '@/stores/formBuilderStore';
import type { FieldType } from '@/types/builder';

interface ActiveDragData {
    fieldType: FieldType;
}

const DEFAULT_FIELD_OFFSETS: Record<
    FieldType,
    { width: number; height: number }
> = {
    input: { width: 400, height: 60 },
    textarea: { width: 400, height: 160 },
    select: { width: 400, height: 60 },
    radio: { width: 400, height: 100 },
    checkbox: { width: 400, height: 100 },
    label: { width: 300, height: 60 },
};

export function BuilderContent() {
    const { addField } = useFormStore();
    const [activeDragData, setActiveDragData] = useState<ActiveDragData | null>(
        null,
    );
    const canvasRef = useRef<HTMLDivElement | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const getCanvasPosition = useCallback(
        (clientX: number, clientY: number) => {
            const canvas = canvasRef.current;

            if (!canvas) {
return { x: 40, y: 40 };
}

            const rect = canvas.getBoundingClientRect();
            const scrollContainer = canvas.parentElement;
            const scrollLeft = scrollContainer?.scrollLeft || 0;
            const scrollTop = scrollContainer?.scrollTop || 0;

            let x = clientX - rect.left + scrollLeft;
            let y = clientY - rect.top + scrollTop;

            x = Math.max(0, x);
            y = Math.max(0, y);

            return { x: Math.round(x), y: Math.round(y) };
        },
        [],
    );

    const handleDragStart = useCallback((event: DragStartEvent) => {
        const data = event.active.data.current as ActiveDragData | undefined;

        if (!data?.fieldType) {
return;
}

        setActiveDragData({ fieldType: data.fieldType });
    }, []);

    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            const data = event.active.data.current as
                | ActiveDragData
                | undefined;
            const { over } = event;

            setActiveDragData(null);

            if (!over || !data?.fieldType) {
return;
}

            const fieldType = data.fieldType;
            const dimensions = DEFAULT_FIELD_OFFSETS[fieldType];
            const halfWidth = dimensions.width / 2;
            const halfHeight = dimensions.height / 2;

            let x: number, y: number;

            if (event.activatorEvent instanceof MouseEvent) {
                const pos = getCanvasPosition(
                    event.activatorEvent.clientX,
                    event.activatorEvent.clientY,
                );
                x = pos.x - halfWidth;
                y = pos.y - halfHeight;
            } else {
                x = 40;
                y = 40;
            }

            x = Math.max(0, x);
            y = Math.max(0, y);

            addField(fieldType, x, y);
        },
        [addField, getCanvasPosition],
    );

    const setCanvasRef = useCallback((el: HTMLDivElement | null) => {
        canvasRef.current = el;
    }, []);

    return (
        <div className="flex overflow-hidden bg-gray-100 text-gray-900">
            <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <ComponentsSidebar />
                <Canvas onCanvasReady={setCanvasRef} />
                <PropertiesPanel />

                <DragOverlay dropAnimation={null}>
                    {activeDragData && (
                        <div className="pointer-events-none rounded-xl border-2 border-dashed border-indigo-400 bg-indigo-50/50 px-6 py-4 shadow-xl backdrop-blur-sm">
                            <span className="text-sm font-medium text-indigo-600">
                                Drop {activeDragData.fieldType} here
                            </span>
                        </div>
                    )}
                </DragOverlay>
            </DndContext>
        </div>
    );
}

export default function FormBuilder() {
    return (
        <>
            <Head title="Form Builder" />
            <BuilderContent />
        </>
    );
}

FormBuilder.layout = {
    breadcrumbs: [
        {
            title: 'Form Builder',
            href: '/builder',
        },
    ],
};