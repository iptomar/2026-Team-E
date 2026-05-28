import React, { useEffect, useState } from 'react';
import { Head, router } from '@inertiajs/react';

interface Template {
    id: number;
    name: string;
    structure: Array<any>;
    validation_sequence: string[];
    allowed_roles: string[];
    created_by: number;
    created_at: string;
    updated_at: string;
    creator?: {
        name: string;
    };
}

interface FormStructureVersion {
    id: number;
    form_template_id: number;
    version: number;
    is_active: boolean;
    created_at: string;
}

export default function Edit() {
    const [templateId, setTemplateId] = useState<string | null>(null);
    const [template, setTemplate] = useState<Template | null>(null);
    const [versions, setVersions] = useState<FormStructureVersion[]>([]);
    
    const [editName, setEditName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // NOVO: Estado para controlar qual ID de versão está a ser atualizado no momento
    const [updatingVersionId, setUpdatingVersionId] = useState<number | null>(null);

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

        Promise.all([fetchTemplate(id), fetchTemplateVersions(id)]).finally(() => {
            setLoading(false);
        });
    }, []);

    const fetchTemplate = async (id: string) => {
        try {
            const response = await fetch(`/api/templates/${id}`, {
                headers: { Accept: 'application/json' },
                credentials: 'same-origin',
            });
            if (!response.ok) throw new Error('Não foi possível carregar o template');
            
            const data = await response.json();
            setTemplate(data);
            setEditName(data.name);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar template');
        }
    };

    const fetchTemplateVersions = async (id: string) => {
        try {
            const response = await fetch(`/api/templates/${id}/structures`, {
                headers: { Accept: 'application/json' },
                credentials: 'same-origin',
            });
            if (!response.ok) throw new Error('Não foi possível carregar as versões');
            
            const data = await response.json();
            setVersions(data.versions || []);
        } catch (err) {
            console.error('Erro ao buscar versões:', err);
        }
    };

    const handleSaveName = async () => {
        if (!templateId || !editName.trim() || editName === template?.name) return;

        setIsSaving(true);
        setSaveSuccess(false);

        try {
            const response = await fetch(`/api/templates/${templateId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({ name: editName }),
                credentials: 'same-origin',
            });

            if (!response.ok) throw new Error('Erro ao atualizar o título do template');

            const result = await response.json();
            setTemplate(result.data);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Erro ao salvar');
        } finally {
            setIsSaving(false);
        }
    };

    // NOVA FUNÇÃO: Alterna o estado ativo/inativo de uma estrutura
    const handleToggleActive = async (versionId: number, currentStatus: boolean) => {
        setUpdatingVersionId(versionId);

        try {
            const response = await fetch(`/api/structures/${versionId}/toggle-active`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({ is_active: !currentStatus }), // Envia o oposto do atual
                credentials: 'same-origin',
            });

            if (!response.ok) throw new Error('Não foi possível alterar o status da versão');

            const result = await response.json();
            const updatedStructure = result.data;

            // Atualiza a UI localmente de forma inteligente seguindo as regras do backend:
            setVersions((prevVersions) =>
                prevVersions.map((v) => {
                    if (v.id === versionId) {
                        // Atualiza a linha que foi alterada
                        return { ...v, is_active: updatedStructure.is_active };
                    } else if (updatedStructure.is_active) {
                        // Se a linha foi ATIVADA (true), desativa automaticamente todas as outras na UI
                        return { ...v, is_active: false };
                    }
                    return v;
                })
            );

        } catch (err) {
            alert(err instanceof Error ? err.message : 'Erro ao atualizar status');
        } finally {
            setUpdatingVersionId(null);
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

    const isTitleChanged = template && editName !== template.name && editName.trim() !== '';

    return (
        <>
            <Head title={template ? `Editar: ${template.name}` : 'Editar Template'} />
            <div className="min-h-screen bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-white shadow rounded-xl border border-slate-200 overflow-hidden">
                        
                        {/* Header do Painel */}
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between px-6 py-5 bg-slate-100 border-b border-slate-200">
                            <div className="flex-1 max-w-lg">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Template</p>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    disabled={loading || !template}
                                    placeholder="Nome do template"
                                    className="mt-2 block w-full text-3xl font-semibold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 rounded-md px-1 py-0.5 transition-all outline-none"
                                />
                                <div className="mt-1 flex items-center gap-3">
                                    <p className="text-sm text-slate-500">
                                        ID do template: <span className="font-medium text-slate-700">{templateId ?? '-'}</span>
                                    </p>
                                    {saveSuccess && (
                                        <span className="text-xs font-medium text-green-600 animate-fade-in">
                                            ✓ Guardado com sucesso!
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <button
                                    type="button"
                                    onClick={handleSaveName}
                                    disabled={!isTitleChanged || isSaving}
                                    className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold shadow-sm transition-all text-white
                                        ${isTitleChanged 
                                            ? 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer' 
                                            : 'bg-slate-300 cursor-not-allowed opacity-60'}`}
                                >
                                    {isSaving ? '⏳ A guardar...' : '💾 Guardar Título'}
                                </button>
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

                        {/* Conteúdo Principal */}
                        <div className="px-6 py-6">
                            {loading ? (
                                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
                                    Carregando template e histórico...
                                </div>
                            ) : error ? (
                                <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
                                    {error}
                                </div>
                            ) : template ? (
                                <div className="space-y-6">
                                    
                                    {/* Cards de Informações Gerais */}
                                    <div className="grid gap-6 lg:grid-cols-3">
                                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                            <p className="text-sm font-semibold text-slate-500">Criado por</p>
                                            <p className="mt-2 text-base font-medium text-slate-900">{template.creator?.name ?? 'Desconhecido'}</p>
                                            <p className="mt-1 text-sm text-slate-500">{new Date(template.created_at).toLocaleDateString('pt-BR')}</p>
                                        </div>
                                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                            <p className="text-sm font-semibold text-slate-500">Versões de Estrutura</p>
                                            <p className="mt-2 text-base font-medium text-slate-900">{versions.length} registradas</p>
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

                                    {/* Tabela de Histórico de Estruturas com Botão de Ação */}
                                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                                        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
                                            <h2 className="text-lg font-semibold text-slate-900">Histórico de Versões do Form</h2>
                                        </div>
                                        <div className="overflow-x-auto">
                                            {versions.length === 0 ? (
                                                <div className="p-6 text-sm text-slate-500 text-center">Nenhuma versão encontrada para este template.</div>
                                            ) : (
                                                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                                                    <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-600">
                                                        <tr>
                                                            <th className="px-6 py-3">Versão</th>
                                                            <th className="px-6 py-3">Data de Criação</th>
                                                            <th className="px-6 py-3 text-right">Ações / Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-200 bg-white text-slate-700">
                                                        {versions.map((version) => {
                                                            const isThisUpdating = updatingVersionId === version.id;
                                                            
                                                            return (
                                                                <tr key={version.id} className="hover:bg-slate-50 transition-colors">
                                                                    <td className="px-6 py-4 font-medium text-slate-900">
                                                                        v{version.version}
                                                                    </td>
                                                                    <td className="px-6 py-4 text-slate-500">
                                                                        {new Date(version.created_at).toLocaleString('pt-BR', {
                                                                            dateStyle: 'short',
                                                                            timeStyle: 'short'
                                                                        })}
                                                                    </td>
                                                                    <td className="px-6 py-4 text-right">
                                                                        <button
                                                                            type="button"
                                                                            disabled={isThisUpdating}
                                                                            onClick={() => handleToggleActive(version.id, version.is_active)}
                                                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg shadow-sm transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed
                                                                                ${version.is_active 
                                                                                    ? 'bg-green-100 text-green-800 hover:bg-green-200 border border-green-300' 
                                                                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'}`}
                                                                        >
                                                                            {isThisUpdating ? (
                                                                                <span>⏳ A processar...</span>
                                                                            ) : version.is_active ? (
                                                                                <>
                                                                                    <span className="h-1.5 w-1.5 rounded-full bg-green-600 animate-pulse"></span>
                                                                                    Ativa (Clique para Desativar)
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                                                                                    Inativa (Clique para Ativar)
                                                                                </>
                                                                            )}
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
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