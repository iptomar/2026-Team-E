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

interface SavedTemplateResponse {
    data?: {
        id: number;
        name: string;
    };
    message?: string;
    errors?: Record<string, string[]>;
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
    const {
        addField,
        fields,
        formName,
        savedTemplateId,
        setFormName,
        setSavedTemplateId,
        resetBuilder,
    } = useFormStore();
    const [activeDragData, setActiveDragData] = useState<ActiveDragData | null>(
        null,
    );
    const [isSaving, setIsSaving] = useState(false);
    const [saveFeedback, setSaveFeedback] = useState<{
        type: 'success' | 'error';
        message: string;
    } | null>(null);
    const canvasRef = useRef<HTMLDivElement | null>(null);
    const saveStatus = isSaving
        ? {
              tone: 'info' as const,
              message: 'A guardar template na API...',
          }
        : saveFeedback
          ? {
                tone: saveFeedback.type,
                message: saveFeedback.message,
            }
          : {
                tone: 'idle' as const,
                message: 'Template ainda nao foi guardado nesta sessao.',
            };

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
        const trimmedName = formName.trim();

        if (!trimmedName) {
            setSaveFeedback({
                type: 'error',
                message: 'Dá um nome ao template antes de guardar.',
            });
            return;
        }

        if (fields.length === 0) {
            setSaveFeedback({
                type: 'error',
                message: 'Adiciona pelo menos um campo antes de guardar.',
            });
            return;
        }

        const isUpdating = savedTemplateId !== null;

        setIsSaving(true);
        setSaveFeedback(null);

        try {
            const response = await fetch(
                isUpdating
                    ? `/api/templates/${savedTemplateId}`
                    : '/api/templates',
                {
                    method: isUpdating ? 'PUT' : 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: trimmedName,
                        structure: fields,
                    }),
                },
            );

            const payload = (await response
                .json()
                .catch(() => null)) as SavedTemplateResponse | null;

            if (!response.ok) {
                const validationErrors = payload?.errors
                    ? Object.values(payload.errors).flat().join(' ')
                    : null;

                throw new Error(
                    validationErrors ||
                        payload?.message ||
                        'Nao foi possivel guardar o template agora.',
                );
            }

            if (payload?.data?.id) {
                setSavedTemplateId(payload.data.id);
            }

            if (payload?.data?.name) {
                setFormName(payload.data.name);
            }

            setSaveFeedback({
                type: 'success',
                message: isUpdating
                    ? 'Template atualizado com sucesso.'
                    : 'Template guardado com sucesso.',
            });
        } catch (error) {
            setSaveFeedback({
                type: 'error',
                message:
                    error instanceof Error
                        ? error.message
                        : 'Nao foi possivel guardar o template agora.',
            });
        } finally {
            setIsSaving(false);
        }
    }, [fields, formName, savedTemplateId, setFormName, setSavedTemplateId]);

    const handleNewTemplate = useCallback(() => {
        resetBuilder();
        setSaveFeedback(null);
    }, [resetBuilder]);

    return (
        <div className="flex h-screen flex-col bg-gray-100 text-gray-900">
            <div className="border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-lg font-semibold text-gray-900">
                            Form Builder
                        </h1>
                        <p className="text-sm text-gray-500">
                            Guarda templates na base de dados e continua a
                            editá-los.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <input
                            value={formName}
                            onChange={(event) => {
                                setFormName(event.target.value);
                                setSaveFeedback(null);
                            }}
                            placeholder="Nome do template"
                            className="w-72 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm transition focus:border-indigo-400 focus:ring-1 focus:ring-indigo-300 focus:outline-none"
                        />

                        <button
                            type="button"
                            onClick={handleNewTemplate}
                            disabled={isSaving}
                            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Novo Template
                        </button>

                        <button
                            type="button"
                            onClick={handleSaveTemplate}
                            disabled={isSaving}
                            aria-label="Guardar template"
                            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
                        >
                            <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 5a2 2 0 012-2h8l4 4v12a2 2 0 01-2 2H7a2 2 0 01-2-2V5z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 3v6h6"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 17h6"
                                />
                            </svg>
                            {isSaving
                                ? 'A guardar...'
                                : savedTemplateId
                                  ? 'Guardar Alteracoes'
                                  : 'Guardar Template'}
                        </button>
                    </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-600">
                        {fields.length} campo{fields.length === 1 ? '' : 's'}
                    </span>

                    {savedTemplateId && (
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                            Template guardado #{savedTemplateId}
                        </span>
                    )}

                    <div
                        aria-live="polite"
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 ${
                            saveStatus.tone === 'info'
                                ? 'bg-blue-50 text-blue-700'
                                : saveStatus.tone === 'success'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : saveStatus.tone === 'error'
                                    ? 'bg-red-50 text-red-700'
                                    : 'bg-amber-50 text-amber-700'
                        }`}
                    >
                        {saveStatus.tone === 'info' ? (
                            <svg
                                className="h-4 w-4 animate-spin"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                />
                            </svg>
                        ) : saveStatus.tone === 'success' ? (
                            <svg
                                className="h-4 w-4"
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
                        ) : saveStatus.tone === 'error' ? (
                            <svg
                                className="h-4 w-4"
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
                        ) : (
                            <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3"
                                />
                                <circle cx="12" cy="12" r="9" strokeWidth={2} />
                            </svg>
                        )}
                        <span>{saveStatus.message}</span>
                    </div>
                </div>
            </div>

            <div className="flex min-h-0 flex-1">
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

FormBuilder.layout = {
    breadcrumbs: [
        {
            title: 'Form Builder',
            href: '/builder',
        },
    ],
};
