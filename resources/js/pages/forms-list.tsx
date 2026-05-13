import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const PlusIcon = () => (
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
            d="M12 4v16m8-8H4"
        />
    </svg>
);

const DotsIcon = () => (
    <svg
        className="h-4 w-4"
        fill="currentColor"
        viewBox="0 0 24 24"
    >
        <circle cx="12" cy="12" r="1.5" />
        <circle cx="12" cy="6" r="1.5" />
        <circle cx="12" cy="18" r="1.5" />
    </svg>
);

const EyeIcon = () => (
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
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        />
    </svg>
);

const PencilIcon = () => (
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
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
    </svg>
);

const CopyIcon = () => (
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
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
        />
    </svg>
);

const PinIcon = () => (
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
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
        />
    </svg>
);

const TrashIcon = () => (
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
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        />
    </svg>
);

const FileTextIcon = () => (
    <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
    </svg>
);

const LayoutIcon = () => (
    <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
        />
    </svg>
);

const ClipboardIcon = () => (
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
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
    </svg>
);

interface CardProps {
    name: string;
    description?: string;
    showFillButton?: boolean;
}

function Card({ name, description, showFillButton }: CardProps) {
    return (
        <div className="group flex min-w-[280px] flex-col rounded-xl border border-gray-200 bg-white p-4 transition-all duration-200 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-100/50">
            <div className="mb-3 flex items-start justify-between">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50">
                    {showFillButton ? <FileTextIcon /> : <LayoutIcon />}
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600">
                            <DotsIcon />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem className="gap-2">
                            <EyeIcon />
                            Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                            <PencilIcon />
                            Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                            <CopyIcon />
                            Duplicar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                            <PinIcon />
                            Pin
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2 text-red-600 focus:text-red-600">
                            <TrashIcon />
                            Eliminar
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="flex-1">
                <h3 className="mb-1 text-sm font-semibold text-gray-900">
                    {name}
                </h3>
                {description && (
                    <p className="text-xs text-gray-500">{description}</p>
                )}
            </div>
            {showFillButton && (
                <div className="mt-3 border-t border-gray-100 pt-3">
                    <Button
                        size="sm"
                        className="w-full gap-2 bg-indigo-600 text-white hover:bg-indigo-700 text-xs"
                    >
                        <ClipboardIcon />
                        Preencher
                    </Button>
                </div>
            )}
        </div>
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
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50/50 px-6 py-12 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <FileTextIcon />
            </div>
            <p className="mb-1 text-sm font-medium text-gray-900">{title}</p>
            <p className="mb-4 text-xs text-gray-500">{description}</p>
            {buttonText && onClick && (
                <Button size="sm" className="bg-indigo-600 text-white hover:bg-indigo-700" onClick={onClick}>
                    {buttonText}
                </Button>
            )}
        </div>
    );
}

export default function FormsList() {
    const formsEmpty = false;
    const templatesEmpty = false;

    const forms = [
        {
            id: '1',
            name: 'Formulário de Avaliação',
            description: 'Avaliação de desempenho de funcionários',
        },
        {
            id: '2',
            name: 'Pedido de Férias',
            description: 'Formulário para solicitar férias',
        },
    ];

    const templates = [
        {
            id: '1',
            name: 'Template Básico',
            description: 'Template com campos essenciais',
        },
        {
            id: '2',
            name: 'Template Completo',
            description: 'Template abrangente',
        },
    ];

    return (
        <>
            <Head title="Formulários e Templates" />
            <div className="flex h-screen flex-col bg-gray-100 text-gray-900">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
                    <h1 className="text-xl font-semibold text-gray-900">
                        Formulários e Templates
                    </h1>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-8">
                        <section>
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Formulários
                                </h2>
                                <Link href="/builder">
                                    <Button size="sm" className="gap-2 bg-indigo-600 text-white hover:bg-indigo-700">
                                        <PlusIcon />
                                        Criar formulário
                                    </Button>
                                </Link>
                            </div>
                            {formsEmpty ? (
                                <EmptyState
                                    title="Sem formulários ainda"
                                    description="Clique em 'Criar formulário' para começar"
                                />
                            ) : (
                                <div className="flex gap-4 overflow-x-auto pb-2">
                                    {forms.map((form) => (
                                        <Card
                                            key={form.id}
                                            name={form.name}
                                            description={form.description}
                                            showFillButton
                                        />
                                    ))}
                                </div>
                            )}
                        </section>

                        <section>
                            <div className="mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Templates
                                </h2>
                            </div>
                            {templatesEmpty ? (
                                <EmptyState
                                    title="Sem templates ainda"
                                    description="Crie templates no builder para reutilizar"
                                />
                            ) : (
                                <div className="flex gap-4 overflow-x-auto pb-2">
                                    {templates.map((template) => (
                                        <Card
                                            key={template.id}
                                            name={template.name}
                                            description={template.description}
                                        />
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
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