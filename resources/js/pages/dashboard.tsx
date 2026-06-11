import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { dashboard } from '@/routes';

interface Template {
    id: number;
    name: string;
    structure: any[];
    validation_sequence: any[];
    allowed_roles: string[];
    created_by: number;
    created_at: string;
    updated_at: string;
    creator?: {
        name: string;
    };
    folder_id?: number | null;
    folder?: {
        id: number;
        name: string;
    } | null;
}

interface TemplateFolder {
    id: number;
    name: string;
    templates_count?: number;
}

export default function Dashboard() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
    const [folders, setFolders] = useState<TemplateFolder[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFolderId, setSelectedFolderId] = useState<number | 'all' | 'none'>('all');
    const [newFolderName, setNewFolderName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingTemplateId, setDeletingTemplateId] = useState<number | null>(null);
    const [duplicatingTemplateId, setDuplicatingTemplateId] = useState<number | null>(null); // <-- Novo estado
    const [creatingFolder, setCreatingFolder] = useState(false);
    const [deletingFolderId, setDeletingFolderId] = useState<number | null>(null);
    const [movingTemplateId, setMovingTemplateId] = useState<number | null>(null);

    useEffect(() => {
        Promise.all([fetchTemplates(), fetchFolders()]).finally(() => {
            setLoading(false);
        });
    }, []);

    useEffect(() => {
        const filtered = templates.filter((template) => {
            const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFolder =
                selectedFolderId === 'all'
                    ? true
                    : selectedFolderId === 'none'
                      ? !template.folder_id
                      : template.folder_id === selectedFolderId;

            return matchesSearch && matchesFolder;
        });
        setFilteredTemplates(filtered);
    }, [templates, searchTerm, selectedFolderId]);

    const fetchTemplates = async () => {
        try {
            const response = await fetch('/api/templates', {
                headers: {
                    Accept: 'application/json',
                },
                credentials: 'same-origin',
            });

            if (!response.ok) {
                throw new Error('Falha ao carregar templates');
            }

            const data = await response.json();
            setTemplates(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro desconhecido');
        }
    };

    const fetchFolders = async () => {
        try {
            const response = await fetch('/api/template-folders', {
                headers: {
                    Accept: 'application/json',
                },
                credentials: 'same-origin',
            });

            if (!response.ok) {
                throw new Error('Falha ao carregar pastas');
            }

            const data = await response.json();
            setFolders(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar pastas');
        }
    };

    const handleDeleteTemplate = async (templateId: number, templateName: string) => {
        if (deletingTemplateId !== null) {
            return;
        }

        const confirmed = window.confirm(
            `Tens a certeza que queres eliminar o template "${templateName}"? Esta ação não pode ser revertida.`,
        );

        if (!confirmed) {
            return;
        }

        setDeletingTemplateId(templateId);
        setError(null);

        try {
            const response = await fetch(`/api/templates/${templateId}`, {
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                },
                credentials: 'same-origin',
            });

            if (!response.ok) {
                throw new Error('Não foi possível eliminar o template');
            }

            setTemplates((prevTemplates) =>
                prevTemplates.filter((template) => template.id !== templateId),
            );
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao eliminar template');
        } finally {
            setDeletingTemplateId(null);
        }
    };

    // --- Nova função para duplicar o template ---
    const handleDuplicateTemplate = async (templateId: number) => {
        if (duplicatingTemplateId !== null) return;

        setDuplicatingTemplateId(templateId);
        setError(null);

        try {
            const response = await fetch(`/api/templates/${templateId}/duplicate`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                credentials: 'same-origin',
            });

            if (!response.ok) {
                throw new Error('Não foi possível duplicar o template');
            }

            const result = await response.json();
            
            // Assume que o teu backend retorna o novo template duplicado em result.data ou result diretamente
            const newTemplate = result.data || result;

            setTemplates((prevTemplates) => [newTemplate, ...prevTemplates]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao duplicar template');
        } finally {
            setDuplicatingTemplateId(null);
        }
    };

    const handleCreateFolder = async () => {
        if (!newFolderName.trim() || creatingFolder) {
            return;
        }

        setCreatingFolder(true);
        setError(null);

        try {
            const response = await fetch('/api/template-folders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    name: newFolderName.trim(),
                }),
            });

            if (!response.ok) {
                throw new Error('Não foi possível criar a pasta');
            }

            const result = await response.json();
            setFolders((prevFolders) =>
                [...prevFolders, { ...result.data, templates_count: 0 }].sort((a, b) =>
                    a.name.localeCompare(b.name),
                ),
            );
            setNewFolderName('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao criar pasta');
        } finally {
            setCreatingFolder(false);
        }
    };

    const handleFolderNameKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleCreateFolder();
        }
    };

    const handleDeleteFolder = async (folderId: number, folderName: string) => {
        if (deletingFolderId !== null) {
            return;
        }

        const confirmed = window.confirm(
            `Tens a certeza que queres eliminar a pasta "${folderName}"? Os templates ficam guardados, mas passam para "Sem pasta".`,
        );

        if (!confirmed) {
            return;
        }

        setDeletingFolderId(folderId);
        setError(null);

        try {
            const response = await fetch(`/api/template-folders/${folderId}`, {
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                },
                credentials: 'same-origin',
            });

            if (!response.ok) {
                throw new Error('Não foi possível eliminar a pasta');
            }

            setFolders((prevFolders) => prevFolders.filter((folder) => folder.id !== folderId));
            setTemplates((prevTemplates) =>
                prevTemplates.map((template) =>
                    template.folder_id === folderId
                        ? { ...template, folder_id: null, folder: null }
                        : template,
                ),
            );

            if (selectedFolderId === folderId) {
                setSelectedFolderId('all');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao eliminar pasta');
        } finally {
            setDeletingFolderId(null);
        }
    };

    const handleAssignFolder = async (templateId: number, folderIdValue: string) => {
        const parsedFolderId = folderIdValue === 'none' ? null : Number(folderIdValue);
        setMovingTemplateId(templateId);
        setError(null);

        try {
            const response = await fetch(`/api/templates/${templateId}/folder`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    folder_id: parsedFolderId,
                }),
            });

            if (!response.ok) {
                throw new Error('Não foi possível mover o template para a pasta selecionada');
            }

            const result = await response.json();
            const updatedTemplate = result.data as Template;

            setTemplates((prevTemplates) =>
                prevTemplates.map((template) =>
                    template.id === templateId ? updatedTemplate : template,
                ),
            );
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao mover template');
        } finally {
            setMovingTemplateId(null);
        }
    };

    if (loading) {
        return (
            <>
                <Head title="Dashboard" />
                <div className="flex h-full flex-1 flex-col overflow-x-auto rounded-xl p-4">
                    <div className="flex justify-center items-center h-64">
                        <div className="text-gray-500">Carregando templates...</div>
                    </div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Head title="Dashboard" />
                <div className="flex h-full flex-1 flex-col overflow-x-auto rounded-xl p-4">
                    <div className="flex justify-center items-center h-64">
                        <div className="text-red-500">Erro: {error}</div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col overflow-x-auto rounded-xl p-4">
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Templates de Formulários</h1>
                        <p className="text-sm text-gray-500">Visualize, busque e gerencie seus templates.</p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="min-w-[240px]">
                            <input
                                type="text"
                                placeholder="Buscar templates..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => router.visit('/builder')}
                            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
                        >
                            Criar template
                        </button>
                    </div>
                </div>

                {error ? (
                    <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        {error}
                    </div>
                ) : null}

                <div className="mb-6 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_60px_-30px_rgba(15,23,42,0.35)]">
                    <div className="bg-[radial-gradient(circle_at_top_left,_rgba(79,70,229,0.18),_transparent_28%),linear-gradient(135deg,#ffffff_0%,#f8fafc_55%,#eef2ff_100%)] p-6">
                        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_420px]">
                            <div className="flex flex-col justify-between">
                                <div>
                                    <div className="mb-4 inline-flex items-center rounded-full border border-indigo-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700 backdrop-blur">
                                        Organização
                                    </div>
                                    <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                                        Pastas dos templates
                                    </h2>
                                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                                        Agrupa formulários por equipa, processo ou departamento para encontrares tudo
                                        mais depressa quando a lista crescer.
                                    </p>
                                </div>

                                <div className="mt-6 flex flex-wrap gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedFolderId('all')}
                                        className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                                            selectedFolderId === 'all'
                                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        }`}
                                    >
                                        Todas ({templates.length})
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedFolderId('none')}
                                        className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                                            selectedFolderId === 'none'
                                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        }`}
                                    >
                                        Sem pasta ({templates.filter((template) => !template.folder_id).length})
                                    </button>
                                    {folders.map((folder) => (
                                        <div
                                            key={folder.id}
                                            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors ${
                                                selectedFolderId === folder.id
                                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                                    : 'bg-indigo-50 text-indigo-800'
                                            }`}
                                        >
                                            <button
                                                type="button"
                                                onClick={() => setSelectedFolderId(folder.id)}
                                                className="font-medium"
                                            >
                                                {folder.name} ({templates.filter((template) => template.folder_id === folder.id).length})
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteFolder(folder.id, folder.name)}
                                                disabled={deletingFolderId === folder.id}
                                                className={`text-xs font-semibold ${
                                                    selectedFolderId === folder.id ? 'text-white/90' : 'text-rose-600'
                                                }`}
                                            >
                                                {deletingFolderId === folder.id ? '...' : 'Eliminar'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-[24px] border border-slate-200 bg-slate-950 p-5 text-white shadow-2xl shadow-slate-950/20">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                                        <div className="relative h-5 w-7 rounded-md border border-white/70 bg-white/5">
                                            <div className="absolute -top-1 left-1 h-2 w-3 rounded-t-md border border-white/70 border-b-0 bg-slate-950" />
                                        </div>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-white">Criar nova pasta</p>
                                        <p className="mt-1 text-sm leading-6 text-slate-300">
                                            Dá um nome claro como “RH”, “Financeiro” ou “Pedidos Internos”.
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 rounded-[22px] border border-white/10 bg-white/[0.04] p-2 shadow-inner shadow-black/10">
                                    <div className="flex flex-col gap-2 sm:flex-row">
                                        <input
                                            type="text"
                                            value={newFolderName}
                                            onChange={(e) => setNewFolderName(e.target.value)}
                                            onKeyDown={handleFolderNameKeyDown}
                                            placeholder="Ex: Recursos Humanos"
                                            className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleCreateFolder}
                                            disabled={creatingFolder || !newFolderName.trim()}
                                            className="inline-flex h-12 min-w-[140px] items-center justify-center rounded-2xl bg-indigo-500 px-5 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-slate-600"
                                        >
                                            {creatingFolder ? 'A criar...' : 'Criar pasta'}
                                        </button>
                                    </div>
                                </div>

                                <p className="mt-3 text-xs text-slate-400">
                                    Depois podes mover cada template para a pasta certa diretamente na tabela.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Nome</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Pasta</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Campos</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Criado por</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Criado em</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Roles</th>
                                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {filteredTemplates.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                                        {searchTerm ? 'Nenhum template encontrado.' : 'Nenhum template disponível.'}
                                    </td>
                                </tr>
                            ) : (
                                filteredTemplates.map((template) => (
                                    <tr key={template.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{template.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            <select
                                                value={template.folder_id ?? 'none'}
                                                onChange={(e) => handleAssignFolder(template.id, e.target.value)}
                                                disabled={movingTemplateId === template.id}
                                                className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-gray-100"
                                            >
                                                <option value="none">Sem pasta</option>
                                                {folders.map((folder) => (
                                                    <option key={folder.id} value={folder.id}>
                                                        {folder.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{template.structure.length}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{template.creator?.name || 'Desconhecido'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(template.created_at).toLocaleDateString('pt-BR')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            <div className="flex flex-wrap gap-1">
                                                {template.allowed_roles.map((role) => (
                                                    <span key={role} className="inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800">
                                                        {role}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                type="button"
                                                onClick={() => router.visit(`/edit?id=${template.id}`)}
                                                className="mr-2 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => router.visit(`/form?templateId=${template.id}`)}
                                                className="mr-2 rounded-md bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 transition-colors"
                                            >
                                                Preencher
                                            </button>
                                            
                                            {/* --- Botão Duplicar adicionado aqui --- */}
                                            <button
                                                type="button"
                                                onClick={() => handleDuplicateTemplate(template.id)}
                                                disabled={duplicatingTemplateId === template.id}
                                                className="mr-2 rounded-md bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600 transition-colors disabled:cursor-not-allowed disabled:bg-amber-300"
                                            >
                                                {duplicatingTemplateId === template.id ? 'A duplicar...' : 'Duplicar'}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleDeleteTemplate(template.id, template.name)}
                                                disabled={deletingTemplateId === template.id}
                                                className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-300"
                                            >
                                                {deletingTemplateId === template.id ? 'A eliminar...' : 'Eliminar'}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};