import { Head, Link, router } from '@inertiajs/react';
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
    formTemplate?: Template;
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
    id: number;
    name: string;
    createdAt: string;
    icon: React.ReactNode;
    showFillButton?: boolean;
    onDelete: () => void;
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

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                            className="gap-2 text-red-600 focus:text-red-600"
                            onClick={onDelete}
                        >
                            <Trash2 className="h-4 w-4" />
                            Eliminar
                        </DropdownMenuItem>
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
                            <pre className="text-xs text-gray-600 text-gray-500 overflow-x-auto">
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
    const [forms, setForms] = useState<FormSubmission[]>([]);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [previewData, setPreviewData] = useState<PreviewData | null>(null);
    const [previewOpen, setPreviewOpen] = useState(false);

    const fetchForms = useCallback(async () => {
        try {
            const response = await fetch('/api/submissions', {
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
                (a: FormSubmission, b: FormSubmission) =>
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            setForms(sorted);
        } catch (err) {
            console.error('Error fetching forms:', err);
        }
    }, []);

    const fetchTemplates = useCallback(async () => {
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
            const sorted = data.sort(
                (a: Template, b: Template) =>
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
            await Promise.all([fetchForms(), fetchTemplates()]);
        } catch {
            setError('Erro ao carregar dados');
        } finally {
            setLoading(false);
        }
    }, [fetchForms, fetchTemplates]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleDeleteForm = async (id: number) => {
        try {
            const response = await fetch(`/api/submissions/${id}`, {
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                },
                credentials: 'same-origin',
            });

            if (response.ok) {
                setForms((prev) => prev.filter((f) => f.id !== id));
            }
        } catch (err) {
            console.error('Error deleting form:', err);
        }
    };

    const handleDeleteTemplate = async (id: number) => {
        try {
            const response = await fetch(`/api/templates/${id}`, {
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
                fetchTemplates();
            }
        } catch (err) {
            console.error('Error duplicating template:', err);
        }
    };

    const handlePreviewForm = (form: FormSubmission) => {
        setPreviewData({
            type: 'form',
            name: form.formTemplate?.name || 'Formulário',
            data: {
                structure: form.formTemplate?.structure || [],
                submitted_data: form.submitted_data,
            },
        });
        setPreviewOpen(true);
    };

    const handlePreviewTemplate = (template: Template) => {
        setPreviewData({
            type: 'template',
            name: template.name,
            data: template.structure || [],
        });
        setPreviewOpen(true);
    };

    const handleEditTemplate = (id: number) => {
        router.visit(`/edit?id=${id}`);
    };

    const handleFillForm = (templateId: number) => {
        router.visit(`/form?templateId=${templateId}`);
    };

    const formsEmpty = forms.length === 0;
    const templatesEmpty = templates.length === 0;

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

                    <Link href="/builder">
                        <Button className="gap-2 bg-indigo-600 text-white hover:bg-indigo-700">
                            <Plus className="h-4 w-4" />
                            Criar formulário
                        </Button>
                    </Link>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <LoadingState />
                    ) : error ? (
                        <ErrorState message={error} onRetry={loadData} />
                    ) : (
                        <div className="space-y-10">
                            {/* Forms */}
                            <section>
                                <div className="mb-5 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900 text-gray-900">
                                            Formulários
                                        </h2>

                                        <p className="text-sm text-gray-500 text-gray-500">
                                            Formulários criados recentemente
                                        </p>
                                    </div>
                                </div>

                                {formsEmpty ? (
                                    <EmptyState
                                        title="Sem formulários ainda"
                                        description="Clique em 'Criar formulário' para começar"
                                    />
                                ) : (
                                    <div className="flex snap-x gap-4 overflow-x-auto pb-2">
                                        {forms.map((form) => (
                                            <Card
                                                key={form.id}
                                                id={form.id}
                                                name={form.formTemplate?.name || 'Formulário'}
                                                createdAt={form.created_at}
                                                icon={<FileText className="h-5 w-5" />}
                                                showFillButton
                                                onDelete={() =>
                                                    handleDeleteForm(form.id)
                                                }
                                                onPreview={() =>
                                                    handlePreviewForm(form)
                                                }
                                                onFill={() =>
                                                    handleFillForm(
                                                        form.form_template_id
                                                    )
                                                }
                                            />
                                        ))}
                                    </div>
                                )}
                            </section>

                            {/* Templates */}
                            <section>
                                <div className="mb-5">
                                    <h2 className="text-lg font-semibold text-gray-900 text-gray-900">
                                        Templates
                                    </h2>

                                    <p className="text-sm text-gray-500 text-gray-500">
                                        Templates reutilizáveis para novos formulários
                                    </p>
                                </div>

                                {templatesEmpty ? (
                                    <EmptyState
                                        title="Sem templates ainda"
                                        description="Crie templates no builder para reutilizar"
                                    />
                                ) : (
                                    <div className="flex snap-x gap-4 overflow-x-auto pb-2">
                                        {templates.map((template) => (
                                            <Card
                                                key={template.id}
                                                id={template.id}
                                                name={template.name}
                                                createdAt={template.created_at}
                                                icon={<LayoutGrid className="h-5 w-5" />}
                                                onDelete={() =>
                                                    handleDeleteTemplate(template.id)
                                                }
                                                onDuplicate={() =>
                                                    handleDuplicateTemplate(template)
                                                }
                                                onPreview={() =>
                                                    handlePreviewTemplate(template)
                                                }
                                                onEdit={() =>
                                                    handleEditTemplate(template.id)
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