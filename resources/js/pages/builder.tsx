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
import { Head, router } from '@inertiajs/react';
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
    const { addField, fields, formName, setFormName } = useFormStore();
    const [activeDragData, setActiveDragData] = useState<ActiveDragData | null>(
        null,
    );
    const [saveStatus, setSaveStatus] = useState<
        'idle' | 'saving' | 'success' | 'error'
    >('idle');
    const [saveMessage, setSaveMessage] = useState<string>('');
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

    const handleSaveTemplate = useCallback(async () => {
        if (!formName?.trim()) {
            setSaveStatus('error');
            setSaveMessage('Informe um nome de template antes de gravar.');
            return;
        }

        if (fields.length === 0) {
            setSaveStatus('error');
            setSaveMessage('Adicione pelo menos um campo antes de gravar.');
            return;
        }

        setSaveStatus('saving');
        setSaveMessage('Gravando template...');

        const payload = {
            name: formName,
            structure: fields,
            validation_sequence: fields.map((field) => field.id),
            allowed_roles: ['admin'],
        };

        try {
            const response = await fetch('/api/templates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                credentials: 'same-origin',
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const error = await response.json().catch(() => null);
                setSaveStatus('error');
                setSaveMessage(
                    error?.message || 'Falha ao gravar o template.',
                );
                return;
            }

            const result = await response.json();
            const templateId = result?.data?.id;
            setSaveStatus('success');
            setSaveMessage('Template gravado com sucesso.');
            if (templateId) {
                router.visit(`/workflow?templateId=${templateId}`);
            }
        } catch (error) {
            setSaveStatus('error');
            setSaveMessage('Erro de rede ao gravar o template.');
        }
    }, [fields, formName]);

    return (
        <div className="flex h-screen flex-col bg-gray-100 text-gray-900">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
                <div className="flex flex-1 min-w-0 items-center gap-3">
                    <label
                        htmlFor="builder-template-name"
                        className="text-sm font-medium text-gray-700"
                    >
                        Nome do template
                    </label>
                    <input
                        id="builder-template-name"
                        type="text"
                        value={formName}
                        onChange={(event) => setFormName(event.target.value)}
                        className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
                        placeholder="Nome do formulário"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={handleSaveTemplate}
                        disabled={saveStatus === 'saving'}
                        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
                    >
                        {saveStatus === 'saving'
                            ? 'Gravando...'
                            : 'Gravar template'}
                    </button>
                    {saveMessage ? (
                        <div
                            className={`rounded-lg px-3 py-2 text-sm ${
                                saveStatus === 'success'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : saveStatus === 'error'
                                    ? 'bg-rose-100 text-rose-700'
                                    : 'bg-slate-100 text-slate-700'
                            }`}
                        >
                            {saveMessage}
                        </div>
                    ) : null}
                </div>
            </div>

            <div className="flex flex-1">
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

// To:
FormBuilder.layout = (page: React.ReactNode) => page;
