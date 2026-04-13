import type {
    DragEndEvent,
    DragStartEvent} from '@dnd-kit/core';
import {
    DndContext,
    DragOverlay,
    useSensor,
    useSensors,
    PointerSensor,
} from '@dnd-kit/core';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { Canvas } from '@/components/builder/Canvas';
import { ComponentsSidebar } from '@/components/builder/ComponentsSidebar';
import { PropertiesPanel } from '@/components/builder/PropertiesPanel';
import { useFormStore } from '@/stores/formBuilderStore';
import type { FieldType } from '@/types/builder';

function BuilderContent() {
    const { addField } = useFormStore();
    const [activeFieldType, setActiveFieldType] = useState<FieldType | null>(
        null,
    );

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
    );

    const handleDragStart = (event: DragStartEvent) => {
        const data = event.active.data.current as
            | { fieldType?: FieldType }
            | undefined;

        if (data?.fieldType) {
            setActiveFieldType(data.fieldType);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveFieldType(null);

        const data = event.active.data.current as
            | { type?: string; fieldType?: FieldType }
            | undefined;

        if (event.over && data?.type === 'sidebar-item' && data.fieldType) {
            addField(data.fieldType);
        }
    };

    return (
        <div className="flex h-screen bg-white">
            <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <ComponentsSidebar />
                <Canvas />
                <PropertiesPanel />
                <DragOverlay>
                    {activeFieldType && (
                        <div className="rounded-lg border border-indigo-500 bg-white p-3 shadow-lg">
                            <span className="text-sm font-medium">
                                Adding {activeFieldType}
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
