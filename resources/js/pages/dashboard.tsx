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
}

export default function Dashboard() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchTemplates();
    }, []);

    useEffect(() => {
        const filtered = templates.filter(template =>
            template.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredTemplates(filtered);
    }, [templates, searchTerm]);

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
            setFilteredTemplates(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro desconhecido');
        } finally {
            setLoading(false);
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

                <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Nome</th>
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
                                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                                        {searchTerm ? 'Nenhum template encontrado.' : 'Nenhum template disponível.'}
                                    </td>
                                </tr>
                            ) : (
                                filteredTemplates.map((template) => (
                                    <tr key={template.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{template.name}</td>
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
                                                className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 transition-colors"
                                            >
                                                Preencher
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
