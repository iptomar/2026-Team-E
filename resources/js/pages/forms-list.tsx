import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Plus,
    MoreVertical,
    Eye,
    Pencil,
    Copy,
    Pin,
    Trash2,
    FileText,
    LayoutGrid,
    ClipboardList,
    Search,
    X,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { UserRole } from '@/types/auth';

interface Template {
    id: number;
    name: string;
    structure: any[];
    validation_sequence: any[];
    allowed_roles: string[];
    created_at: string;
    creator?: {
        name: string;
    };
}

interface FormSubmission {
    id: number;
    form_template_id: number;
    user_id: number;
    submitted_data: any;
    status: string;
    created_at: string;
    form_template?: Template;
    user?: {
        name: string;
    };
}

interface PreviewData {
    type: 'form' | 'template';
    name: string;
    data: any;
}

interface CardProps {
    name: string;
    createdAt: string;
    icon: React.ReactNode;
    showFillButton?: boolean;
    onDelete?: () => void;
    onDuplicate?: () => void;
    onPreview: () => void;
    onEdit?: () => void;
    onFill?: () => void;
}

function Card({
    name,
    createdAt,
    icon,
    showFillButton,
    onDelete,
    onDuplicate,
    onPreview,
    onEdit,
    onFill,
}: CardProps) {
    const formattedDate = new Date(createdAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });

    return (
        <div className="group w-[280px] shrink-0 snap-start rounded-2xl border border-gray-200 bg-white p-4 transition-all duration-200 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-md">
            <div className="mb-3 flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-600">
                    {icon}
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600">
                            <MoreVertical className="h-4 w-4" />
                        </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        align="end"
                        className="w-48"
                    >
                        <DropdownMenuItem className="gap-2" onClick={onPreview}>
                            <Eye className="h-4 w-4" />
                            Preview
                        </DropdownMenuItem>

                        {onEdit && (
                            <DropdownMenuItem className="gap-2" onClick={onEdit}>
                                <Pencil className="h-4 w-4" />
                                Editar
                            </DropdownMenuItem>
                        )}

                        {onDuplicate && (
                            <DropdownMenuItem className="gap-2" onClick={onDuplicate}>
                                <Copy className="h-4 w-4" />
                                Duplicar
                            </DropdownMenuItem>
                        )}

                        <DropdownMenuItem className="gap-2">
                            <Pin className="h-4 w-4" />
                            Pin
                        </DropdownMenuItem>

                        {onDelete && (
                            <>
                                <DropdownMenuSeparator />

                                <DropdownMenuItem
                                    className="gap-2 text-red-600 focus:text-red-600"
                                    onClick={onDelete}
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Eliminar
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="flex-1">
                <h3 className="mb-1 text-sm font-semibold text-gray-900">
                    {name}
                </h3>

                <p className="text-xs text-gray-500">
                    {formattedDate}
                </p>
            </div>

            {showFillButton && (
                <div className="mt-4 border-t border-gray-100 pt-4">
                    <Button
                        size="sm"
                        className="w-full gap-2 bg-indigo-600 text-xs text-white hover:bg-indigo-700"
                        onClick={onFill}
                    >
                        <ClipboardList className="h-4 w-4" />
                        Preencher
                    </Button>
                </div>
            )}
        </div>
    );
}

interface SubmissionCardProps {
    formName: string;
    submittedAt: string;
    submittedBy: string;
    onViewDetails: () => void;
    onDelete?: () => void;
}

function SubmissionCard({
    formName,
    submittedAt,
    submittedBy,
    onViewDetails,
    onDelete,
}: SubmissionCardProps) {
    const formattedDate = new Date(submittedAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });

    return (
        <div className="group w-[280px] shrink-0 snap-start rounded-2xl border border-gray-200 bg-white p-4 transition-all duration-200 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-md">
            <div className="mb-3 flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-600">
                    <FileText className="h-5 w-5" />
                </div>

                {onDelete && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600">
                                <MoreVertical className="h-4 w-4" />
                            </button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                                className="gap-2 text-red-600 focus:text-red-600"
                                onClick={onDelete}
                            >
                                <Trash2 className="h-4 w-4" />
                                Eliminar
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>

            <div className="flex-1 mb-4">
                <h3 className="mb-1 text-sm font-semibold text-gray-900">
                    {formName}
                </h3>

                <p className="text-xs text-gray-500">
                    {formattedDate}
                </p>

                <p className="mt-2 text-xs text-gray-600">
                    Submetido por: <span className="font-medium">{submittedBy}</span>
                </p>
            </div>

            <div className="border-t border-gray-100 pt-4">
                <Button
                    size="sm"
                    className="w-full gap-2 bg-indigo-600 text-xs text-white hover:bg-indigo-700"
                    onClick={onViewDetails}
                >
                    <Eye className="h-4 w-4" />
                    Ver detalhes
                </Button>
            </div>
        </div>
    );
}

function PreviewModal({
    open,
    onClose,
    data,
}: {
    open: boolean;
    onClose: () => void;
    data: PreviewData | null;
}) {
    if (!data) {
        return null;
    }

    const isForm = data.type === 'form';
    const title = isForm ? 'Preview do Formulário' : 'Preview do Template';

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {isForm ? (
                            <FileText className="h-5 w-5 text-indigo-600" />
                        ) : (
                            <LayoutGrid className="h-5 w-5 text-indigo-600" />
                        )}
                        {title}: {data.name}
                    </DialogTitle>
                </DialogHeader>

                <div className="mt-4 space-y-4">
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <h4 className="mb-3 text-sm font-medium text-gray-900">
                            Estrutura do Formulário
                        </h4>

                        {data.data && data.data.length > 0 ? (
                            <div className="space-y-2">
                                {data.data.map((field: any, index: number) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-2 rounded-md border border-gray-200 bg-white p-3"
                                    >
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-medium text-indigo-600">
                                            {index + 1}
                                        </span>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">
                                                {field.label || field.name || `Campo ${index + 1}`}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Tipo: {field.type || 'text'}
                                                {field.required && ' • Obrigatório'}
                                            </p>
                                        </div>
                                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                                            {field.type || 'text'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">
                                Sem campos definidos.
                            </p>
                        )}
                    </div>

                    {isForm && data.data?.submitted_data && (
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                            <h4 className="mb-3 text-sm font-medium text-gray-900">
                                Dados Submetidos
                            </h4>
                            <pre className="text-xs text-gray-500 overflow-x-auto">
                                {JSON.stringify(data.data.submitted_data, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>

                <div className="mt-6 flex justify-end">
                    <Button variant="outline" onClick={onClose}>
                        Fechar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function EmptyState({
    title,
    description,
    buttonText,
    onClick,
}: {
    title: string;
    description: string;
    buttonText?: string;
    onClick?: () => void;
}) {
    return (
        <div className="mx-auto flex max-w-sm flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50/70 px-6 py-12 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                <FileText className="h-6 w-6 text-gray-500" />
            </div>

            <p className="mb-1 text-sm font-semibold text-gray-900">
                {title}
            </p>

            <p className="mb-5 text-xs text-gray-500">
                {description}
            </p>

            {buttonText && onClick && (
                <Button
                    size="sm"
                    className="bg-indigo-600 text-white hover:bg-indigo-700"
                    onClick={onClick}
                >
                    {buttonText}
                </Button>
            )}
        </div>
    );
}

function LoadingState() {
    return (
        <div className="flex h-64 items-center justify-center">
            <div className="text-gray-500">
                Carregando...
            </div>
        </div>
    );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50/50 px-6 py-8 text-center">
            <p className="mb-3 text-sm font-medium text-red-600">
                {message}
            </p>
            <Button size="sm" variant="outline" onClick={onRetry}>
                Tentar novamente
            </Button>
        </div>
    );
}

export default function FormsList() {
    const { auth } = usePage().props;
    const isAdmin = (auth.user?.role as UserRole | undefined) === 'administrador';
    const [formularios, setFormularios] = useState<Template[]>([]);
    const [templates, setTemplates] = useState<FormSubmission[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [previewData, setPreviewData] = useState<PreviewData | null>(null);
    const [previewOpen, setPreviewOpen] = useState(false);

    const fetchFormularios = useCallback(async () => {
        try {
            const response = await fetch('/api/templates', {
                headers: {
                    Accept: 'application/json',
                },
                credentials: 'same-origin',
            });

            if (!response.ok) {
                throw new Error('Falha ao carregar formulários');
            }

            const data = await response.json();
            const sorted = data.sort(
                (a: Template, b: Template) =>
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            setFormularios(sorted);
        } catch (err) {
            console.error('Error fetching forms:', err);
        }
    }, []);

    const fetchTemplates = useCallback(async () => {
        try {
            const response = await fetch('/api/submissions', {
                headers: {
                    Accept: 'application/json',
                },
                credentials: 'same-origin',
            });

            if (!response.ok) {
                throw new Error('Falha ao carregar templates');
            }

            const data = await response.json();
            const sorted = data.sort(
                (a: FormSubmission, b: FormSubmission) =>
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            setTemplates(sorted);
        } catch (err) {
            console.error('Error fetching templates:', err);
        }
    }, []);

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            await Promise.all([fetchFormularios(), fetchTemplates()]);
        } catch {
            setError('Erro ao carregar dados');
        } finally {
            setLoading(false);
        }
    }, [fetchFormularios, fetchTemplates]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleDeleteFormulario = async (id: number) => {
        try {
            const response = await fetch(`/api/templates/${id}`, {
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                },
                credentials: 'same-origin',
            });

            if (response.ok) {
                setFormularios((prev) => prev.filter((f) => f.id !== id));
            }
        } catch (err) {
            console.error('Error deleting form:', err);
        }
    };

    const handleDeleteTemplate = async (id: number) => {
        try {
            const response = await fetch(`/api/submissions/${id}`, {
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                },
                credentials: 'same-origin',
            });

            if (response.ok) {
                setTemplates((prev) => prev.filter((t) => t.id !== id));
            }
        } catch (err) {
            console.error('Error deleting template:', err);
        }
    };

    const handleDuplicateTemplate = async (template: Template) => {
        try {
            const response = await fetch('/api/templates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    name: `Cópia de ${template.name}`,
                    structure: template.structure,
                    validation_sequence: template.validation_sequence,
                    allowed_roles: template.allowed_roles,
                }),
            });

            if (response.ok) {
                fetchFormularios();
            }
        } catch (err) {
            console.error('Error duplicating template:', err);
        }
    };

    const handlePreviewFormulario = (template: Template) => {
        setPreviewData({
            type: 'form',
            name: template.name,
            data: template.structure || [],
        });
        setPreviewOpen(true);
    };

    const handlePreviewTemplate = (submission: FormSubmission) => {
        setPreviewData({
            type: 'template',
            name: submission.form_template?.name || `Submissão #${submission.id}`,
            data: {
                structure: submission.form_template?.structure || [],
                submitted_data: submission.submitted_data,
            },
        });
        setPreviewOpen(true);
    };

    const handleEditTemplate = (id: number) => {
        router.visit(`/edit?id=${id}`);
    };

    const handleFillForm = (templateId: number) => {
        router.visit(`/preencher-formularios?templateId=${templateId}`);
    };

    const handleViewSubmissionDetails = (submissionId: number) => {
        router.visit(`/submission-details?id=${submissionId}`);
    };

    const normalizedSearch = searchTerm.trim().toLowerCase();

    const filteredFormularios = formularios.filter((template) => {
        if (!normalizedSearch) {
            return true;
        }

        const searchableContent = [
            template.name,
            template.creator?.name,
            new Date(template.created_at).toLocaleDateString('pt-BR'),
        ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

        return searchableContent.includes(normalizedSearch);
    });

    const filteredTemplates = templates.filter((submission) => {
        if (!normalizedSearch) {
            return true;
        }

        const searchableContent = [
            submission.form_template?.name,
            submission.user?.name,
            submission.status,
            `submissão ${submission.id}`,
            new Date(submission.created_at).toLocaleDateString('pt-BR'),
        ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

        return searchableContent.includes(normalizedSearch);
    });

    const formulariosEmpty = filteredFormularios.length === 0;
    const templatesEmpty = filteredTemplates.length === 0;
    const hasSearch = normalizedSearch.length > 0;

    return (
        <>
            <Head title="Formulários e Templates" />

            <PreviewModal
                open={previewOpen}
                onClose={() => setPreviewOpen(false)}
                data={previewData}
            />

            <div className="flex h-full flex-1 flex-col bg-gray-100 text-gray-900">
                {/* Header */}
                <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white/80 px-6 py-4 backdrop-blur-xl">
                    <div>
                        <h1 className="text-xl font-semibold">
                            Formulários e Templates
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Gere os seus formulários e templates reutilizáveis
                        </p>
                    </div>

                    {isAdmin && (
                        <Link href="/builder">
                            <Button className="gap-2 bg-indigo-600 text-white hover:bg-indigo-700">
                                <Plus className="h-4 w-4" />
                                Criar formulário
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <LoadingState />
                    ) : error ? (
                        <ErrorState message={error} onRetry={loadData} />
                    ) : (
                        <div className="space-y-10">
                            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">
                                            Pesquisa Global
                                        </p>
                                        <h2 className="mt-1 text-lg font-semibold text-slate-900">
                                            Encontra formulários e submissões
                                        </h2>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Pesquisa por nome do formulário, utilizador, data ou submissão.
                                        </p>
                                    </div>

                                    <div className="w-full lg:max-w-xl">
                                        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-inner shadow-slate-100">
                                            <Search className="h-4 w-4 shrink-0 text-slate-400" />
                                            <input
                                                type="text"
                                                value={searchTerm}
                                                onChange={(event) => setSearchTerm(event.target.value)}
                                                placeholder="Pesquisar formulários e histórico..."
                                                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                                            />
                                            {hasSearch && (
                                                <button
                                                    type="button"
                                                    onClick={() => setSearchTerm('')}
                                                    className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-200 hover:text-slate-600"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-3 text-sm">
                                    <div className="rounded-full bg-indigo-50 px-4 py-2 font-medium text-indigo-700">
                                        Formulários: {filteredFormularios.length}
                                    </div>
                                    <div className="rounded-full bg-emerald-50 px-4 py-2 font-medium text-emerald-700">
                                        Submissões: {filteredTemplates.length}
                                    </div>
                                    {hasSearch && (
                                        <div className="rounded-full bg-slate-100 px-4 py-2 font-medium text-slate-700">
                                            Pesquisa: {searchTerm}
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Formulários - from /api/templates */}
                            <section>
                                <div className="mb-5 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">
                                            Formulários
                                        </h2>

                                        <p className="text-sm text-gray-500">
                                            Formulários disponíveis para preencher
                                        </p>
                                    </div>
                                </div>

                                {formulariosEmpty ? (
                                    <EmptyState
                                        title={hasSearch ? 'Nenhum formulário encontrado' : 'Sem formulários ainda'}
                                        description={
                                            hasSearch
                                                ? 'Tenta outro termo para encontrar formulários disponíveis.'
                                                : isAdmin
                                                    ? "Clique em 'Criar formulário' para começar"
                                                    : 'Os formulários disponíveis aparecerão aqui'
                                        }
                                    />
                                ) : (
                                    <div className="flex snap-x gap-4 overflow-x-auto pb-2">
                                        {filteredFormularios.map((template) => (
                                            <Card
                                                key={template.id}
                                                name={template.name}
                                                createdAt={template.created_at}
                                                icon={<LayoutGrid className="h-5 w-5" />}
                                                showFillButton
                                                onDelete={
                                                    isAdmin
                                                        ? () => handleDeleteFormulario(template.id)
                                                        : undefined
                                                }
                                                onPreview={() =>
                                                    handlePreviewFormulario(template)
                                                }
                                                onFill={() =>
                                                    handleFillForm(template.id)
                                                }
                                                onEdit={
                                                    isAdmin
                                                        ? () => handleEditTemplate(template.id)
                                                        : undefined
                                                }
                                                onDuplicate={
                                                    isAdmin
                                                        ? () => handleDuplicateTemplate(template)
                                                        : undefined
                                                }
                                            />
                                        ))}
                                    </div>
                                )}
                            </section>

                            {/* Histórico - Submissões de formulários */}
                            <section>
                                <div className="mb-5">
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        Histórico
                                    </h2>

                                    <p className="text-sm text-gray-500">
                                        Histórico de submissões
                                    </p>
                                </div>

                                {templatesEmpty ? (
                                    <EmptyState
                                        title={hasSearch ? 'Nenhuma submissão encontrada' : 'Sem submissões ainda'}
                                        description={
                                            hasSearch
                                                ? 'Tenta outro termo para encontrar formulários submetidos.'
                                                : 'Os formulários preenchidos aparecerão aqui'
                                        }
                                    />
                                ) : (
                                    <div className="flex snap-x gap-4 overflow-x-auto pb-2">
                                        {filteredTemplates.map((submission) => (
                                            <SubmissionCard
                                                key={submission.id}
                                                formName={submission.form_template?.name || `Submissão #${submission.id}`}
                                                submittedAt={submission.created_at}
                                                submittedBy={submission.user?.name || 'Utilizador desconhecido'}
                                                onViewDetails={() => handleViewSubmissionDetails(submission.id)}
                                                onDelete={
                                                    isAdmin
                                                        ? () => handleDeleteTemplate(submission.id)
                                                        : undefined
                                                }
                                            />
                                        ))}
                                    </div>
                                )}
                            </section>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

FormsList.layout = {
    breadcrumbs: [
        {
            title: 'Formulários e Templates',
            href: '/forms-list',
        },
    ],
};
