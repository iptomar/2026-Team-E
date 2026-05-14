import React, { useEffect, useState } from 'react';
import { Head, router } from '@inertiajs/react';

interface Template {
    id: number;
    name: string;
    structure: Array<{
        id: string;
        type: string;
        label?: string;
        placeholder?: string;
        options?: string[];
    }>;
    validation_sequence: string[];
    allowed_roles: string[];
    created_by: number;
    created_at: string;
    updated_at: string;
    creator?: {
        name: string;
    };
}

export default function Edit() {
    const [templateId, setTemplateId] = useState<string | null>(null);
    const [template, setTemplate] = useState<Template | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const params = new URLSearchParams(window.location.search);
        const id = params.get('id') || params.get('templateId');
        setTemplateId(id);

        if (!id) {
            setError('Template ID não informado');
            setLoading(false);
            return;
        }

        fetchTemplate(id);
    }, []);

    const fetchTemplate = async (id: string) => {
        try {
            const response = await fetch(`/api/templates/${id}`, {
                headers: {
                    Accept: 'application/json',
                },
                credentials: 'same-origin',
            });

            if (!response.ok) {
                throw new Error('Não foi possível carregar o template');
            }

            const data = await response.json();
            setTemplate(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro desconhecido');
        } finally {
            setLoading(false);
        }
    };

    const openBuilder = () => {
        if (templateId) {
            router.visit(`/builder?templateId=${templateId}`);
        }
    };

    const openWorkflow = () => {
        if (templateId) {
            router.visit(`/workflow?templateId=${templateId}`);
        }
    };

    return (
        <>
            <Head title={template ? `Editar: ${template.name}` : 'Editar Template'} />
            <div className="min-h-screen bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-white shadow rounded-xl border border-slate-200 overflow-hidden">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between px-6 py-5 bg-slate-100 border-b border-slate-200">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Template</p>
                                <h1 className="mt-2 text-3xl font-semibold text-slate-900">
                                    {template?.name ?? 'Carregando...' }
                                </h1>
                                <p className="mt-1 text-sm text-slate-500">
                                    ID do template: <span className="font-medium text-slate-700">{templateId ?? '-'}</span>
                                </p>
                            </div>
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={openBuilder}
                                    disabled={!templateId}
                                    className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    ✏️ Abrir no Builder
                                </button>
                                <button
                                    type="button"
                                    onClick={openWorkflow}
                                    disabled={!templateId}
                                    className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    🔄 Abrir Workflow
                                </button>
                            </div>
                        </div>

                        <div className="px-6 py-6">
                            {loading ? (
                                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
                                    Carregando template...
                                </div>
                            ) : error ? (
                                <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
                                    {error}
                                </div>
                            ) : template ? (
                                <div className="space-y-6">
                                    <div className="grid gap-6 lg:grid-cols-3">
                                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                            <p className="text-sm font-semibold text-slate-500">Criado por</p>
                                            <p className="mt-2 text-base font-medium text-slate-900">{template.creator?.name ?? 'Desconhecido'}</p>
                                            <p className="mt-1 text-sm text-slate-500">{new Date(template.created_at).toLocaleDateString('pt-BR')}</p>
                                        </div>
                                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                            <p className="text-sm font-semibold text-slate-500">Campos</p>
                                            <p className="mt-2 text-base font-medium text-slate-900">{template.structure.length}</p>
                                            <p className="mt-1 text-sm text-slate-500">{template.validation_sequence.length} passos na sequência</p>
                                        </div>
                                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                            <p className="text-sm font-semibold text-slate-500">Permissões</p>
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {template.allowed_roles.map((role) => (
                                                    <span key={role} className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                                                        {role}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                                        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
                                            <h2 className="text-lg font-semibold text-slate-900">Campos do template</h2>
                                        </div>
                                        <div className="divide-y divide-slate-200">
                                            {template.structure.length === 0 ? (
                                                <div className="p-6 text-sm text-slate-500">Nenhum campo configurado para este template.</div>
                                            ) : (
                                                template.structure.map((field, index) => (
                                                    <div key={field.id ?? index} className="px-5 py-4 sm:px-6">
                                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                            <div>
                                                                <p className="text-sm font-semibold text-slate-900">{field.label || `Campo ${index + 1}`}</p>
                                                                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{field.type}</p>
                                                            </div>
                                                            <div className="text-sm text-slate-500">{field.placeholder || 'Sem placeholder'}</div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}