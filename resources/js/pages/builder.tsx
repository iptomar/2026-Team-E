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
import { useState, useRef, useCallback, useEffect } from 'react';
import { Canvas } from '@/components/builder/Canvas';
import { ComponentsSidebar } from '@/components/builder/ComponentsSidebar';
import { PropertiesPanel } from '@/components/builder/PropertiesPanel';
import { useFormStore } from '@/stores/formBuilderStore';
import { useTemplateNameValidation } from '@/hooks/useTemplateNameValidation';
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
    const { addField, fields, formName, setFormName, resetStore } = useFormStore();
    const { validation, checkNameAvailability } = useTemplateNameValidation();
    
    const [templateId, setTemplateId] = useState<string | null>(null);
    
    const [activeDragData, setActiveDragData] = useState<ActiveDragData | null>(
        null,
    );
    const [saveStatus, setSaveStatus] = useState<
        'idle' | 'saving' | 'success' | 'error'
    >('idle');
    const [saveMessage, setSaveMessage] = useState<string>('');
    const canvasRef = useRef<HTMLDivElement | null>(null);

    // Carregar dados se o template já existir
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const params = new URLSearchParams(window.location.search);
        const id = params.get('id') || params.get('templateId');
        
        if (id) {
            setTemplateId(id);
            setSaveStatus('saving');
            setSaveMessage('A carregar template existente...');
            
            fetch(`/api/templates/${id}`, {
                headers: { Accept: 'application/json' },
                credentials: 'same-origin',
            })
                .then((res) => {
                    if (!res.ok) throw new Error('Não foi possível carregar o template');
                    return res.json();
                })
                .then((data) => {
                    setFormName(data.name);
                    
                    if (data.structure && Array.isArray(data.structure)) {
                        useFormStore.setState({ fields: data.structure });
                    }
                    
                    setSaveStatus('idle');
                    setSaveMessage('');
                })
                .catch((err) => {
                    setSaveStatus('error');
                    setSaveMessage(err.message || 'Erro ao carregar dados originais.');
                });
        }
    }, [setFormName]);

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

    const handleTemplateNameBlur = useCallback(() => {
        if (!formName?.trim()) {
            return;
        }
        checkNameAvailability(formName, templateId);
    }, [checkNameAvailability, formName, templateId]);

    const handleNewTemplate = useCallback(() => {
        if (fields.length > 0) {
            const confirmed = window.confirm(
                'Tem a certeza que quer criar um novo template? As mudanças não gravadas serão perdidas.'
            );
            if (!confirmed) return;
        }

        localStorage.removeItem('form-builder-storage');
        resetStore();
        setTemplateId(null);
        setSaveStatus('idle');
        setSaveMessage('');
        
        router.visit('/builder');
    }, [fields.length, resetStore]);

    // MODIFICADO: Lógica de gravação com expulsão/redirecionamento para o forms-list após o OK do erro
    const handleSaveTemplate = useCallback(async () => {
        const nomeLimpo = formName?.trim();

        if (!nomeLimpo || nomeLimpo === "Untitled Form") {
            setSaveStatus('error');
            setSaveMessage('Informe um nome de template válido antes de gravar.');
            alert('Por favor, dê um nome válido ao seu template.');
            return;
        }

        const isNameAvailable = await checkNameAvailability(nomeLimpo, templateId);

        if (!isNameAvailable) {
            setSaveStatus('error');
            setSaveMessage('Este nome de template já existe. Escolha outro nome.');
            
            // 1. Abre a janela de aviso (Bloqueia o código aqui até carregar no OK)
            alert(`Erro: Já existe um template com o nome "${nomeLimpo}". Por favor, escolha um nome único.`);
            
            // 2. NOVO: No milissegundo a seguir ao clique no botão "OK", o utilizador é expulso para a listagem
            resetStore();
            localStorage.removeItem('form-builder-storage');
            router.visit('/forms-list');
            return;
        }

        if (fields.length === 0) {
            setSaveStatus('error');
            setSaveMessage('Adicione pelo menos um campo antes de gravar.');
            return;
        }

        setSaveStatus('saving');
        setSaveMessage(templateId ? 'A gravar nova versão...' : 'A criar novo template...');

        const payload = {
            name: nomeLimpo,
            structure: fields,
            validation_sequence: [],
            allowed_roles: ['admin'],
        };

        const url = templateId ? `/api/templates/${templateId}` : '/api/templates';
        const method = templateId ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                credentials: 'same-origin',
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                let errorMessage = 'Falha ao gravar o template.';
                
                if (errorData?.errors?.name && Array.isArray(errorData.errors.name)) {
                    errorMessage = errorData.errors.name[0];
                } else if (errorData?.message) {
                    errorMessage = errorData.message;
                }
                
                setSaveStatus('error');
                setSaveMessage(errorMessage);
                return;
            }

            const result = await response.json();
            const finalTemplateId = templateId || result?.data?.id;
            
            setSaveStatus('success');
            setSaveMessage(templateId ? 'Nova versão da estrutura gravada!' : 'Template criado com sucesso!');
            
            if (finalTemplateId) {
                localStorage.removeItem('form-builder-storage');
                router.visit(`/workflow?templateId=${finalTemplateId}`);
            }
        } catch (error) {
            setSaveStatus('error');
            setSaveMessage('Erro de rede ao gravar o template.');
        }
    }, [fields, formName, templateId, checkNameAvailability, resetStore]);

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
                        onBlur={handleTemplateNameBlur}
                        className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
                        placeholder="Nome do formulário"
                    />
                    {validation.message ? (
                        <p className="text-xs text-rose-700 font-semibold">⚠️ {validation.message}</p>
                    ) : validation.isChecking ? (
                        <p className="text-xs text-slate-500">Verificando nome...</p>
                    ) : null}
                    {templateId && (
                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded whitespace-nowrap font-medium">
                            Modo: Nova Versão (ID: {templateId})
                        </span>
                    )}
                    {fields.length > 0 && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded whitespace-nowrap">
                            {fields.length} campo{fields.length !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={handleNewTemplate}
                        className="rounded-lg bg-gray-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-600"
                        title="Criar novo template (com confirmação se houver mudanças)"
                    >
                        Novo Template
                    </button>
                    <button
                        type="button"
                        onClick={handleSaveTemplate}
                        disabled={saveStatus === 'saving'}
                        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
                    >
                        {saveStatus === 'saving'
                            ? 'Gravando...'
                            : templateId ? 'Gravar Nova Versão' : 'Gravar template'}
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

FormBuilder.layout = (page: React.ReactNode) => page;