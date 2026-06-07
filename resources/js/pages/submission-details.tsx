import { Head, router } from '@inertiajs/react';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface FormTemplate {
    id: number;
    name: string;
    structure: any[];
    validation_sequence: any[];
}

interface FormValidationStep {
    id: number;
    name: string;
    form_template_id: number;
    labels_ids: string[];
    type: string;
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface FormSubmission {
    id: number;
    form_template_id: number;
    user_id: number;
    submitted_data: Record<string, any>;
    status: string;
    created_at: string;
    form_template?: FormTemplate;
    validationSteps?: FormValidationStep[];
    user?: User;
}

export default function SubmissionDetails() {
    const [submission, setSubmission] = useState<FormSubmission | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Obter o ID da query string
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        
        if (!id) return;

        const fetchSubmission = async () => {
            try {
                const response = await fetch(`/api/submissions/${id}`, {
                    headers: {
                        Accept: 'application/json',
                    },
                    credentials: 'same-origin',
                });

                if (!response.ok) {
                    throw new Error('Falha ao carregar submissão');
                }

                const data = await response.json();
                setSubmission(data);
            } catch (err) {
                console.error('Error fetching submission:', err);
                setError('Erro ao carregar detalhes da submissão');
            } finally {
                setLoading(false);
            }
        };

        fetchSubmission();
    }, []);

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'submitted':
                return 'bg-blue-100 text-blue-800';
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending':
                return 'Pendente';
            case 'submitted':
                return 'Submetido';
            case 'approved':
                return 'Aprovado';
            case 'rejected':
                return 'Rejeitado';
            default:
                return status;
        }
    };

    if (loading) {
        return (
            <>
                <Head title="Detalhes da Submissão" />
                <div className="flex h-full items-center justify-center bg-gray-100">
                    <div className="text-gray-500">Carregando...</div>
                </div>
            </>
        );
    }

    if (error || !submission) {
        return (
            <>
                <Head title="Detalhes da Submissão" />
                <div className="flex h-full flex-col items-center justify-center gap-4 bg-gray-100 p-6">
                    <AlertCircle className="h-12 w-12 text-red-600" />
                    <p className="text-gray-600">{error || 'Submissão não encontrada'}</p>
                    <Button variant="outline" onClick={() => router.visit('/forms-list')}>
                        Voltar
                    </Button>
                </div>
            </>
        );
    }

    const formattedDate = new Date(submission.created_at).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    const template = submission.form_template;
    const validationSteps = template?.validation_sequence || [];

    return (
        <>
            <Head title={`Detalhes: ${template?.name}`} />

            <div className="flex h-full bg-gray-100">
                {/* Sidebar - Passos de Workflow */}
                <aside className="w-64 border-r border-gray-200 bg-white shadow-sm overflow-y-auto">
                    <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur px-6 py-4">
                        <h3 className="text-sm font-semibold text-gray-900">
                            Passos de Workflow
                        </h3>
                    </div>

                    <div className="p-4 space-y-2">
                        {validationSteps.length > 0 ? (
                            validationSteps.map((step: any, index: number) => (
                                <div
                                    key={step.id || index}
                                    className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3"
                                >
                                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
                                        {index + 1}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-900">
                                            {step.name}
                                        </p>
                                        {step.type && (
                                            <p className="text-xs text-gray-500">
                                                {step.type}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500">
                                Sem passos de workflow definidos
                            </p>
                        )}
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 flex flex-col overflow-hidden">
                    {/* Header */}
                    <header className="border-b border-gray-200 bg-white shadow-sm">
                        <div className="flex items-center justify-between px-6 py-4">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => router.visit('/forms-list')}
                                    className="rounded-lg p-2 hover:bg-gray-100 transition"
                                >
                                    <ArrowLeft className="h-5 w-5 text-gray-600" />
                                </button>
                                <div>
                                    <h1 className="text-xl font-semibold text-gray-900">
                                        {template?.name}
                                    </h1>
                                    <p className="text-sm text-gray-500">
                                        Submissão #{submission.id}
                                    </p>
                                </div>
                            </div>
                            <div className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusBadgeColor(submission.status)}`}>
                                {getStatusLabel(submission.status)}
                            </div>
                        </div>
                    </header>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="max-w-4xl space-y-6">
                            {/* Meta Information */}
                            <div className="rounded-lg border border-gray-200 bg-white p-6">
                                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                                    Informações da Submissão
                                </h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 uppercase">
                                            Data de Submissão
                                        </p>
                                        <p className="mt-1 text-sm text-gray-900">
                                            {formattedDate}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 uppercase">
                                            Submetido por
                                        </p>
                                        <p className="mt-1 text-sm text-gray-900">
                                            {submission.user?.name || 'Desconhecido'}
                                        </p>
                                    </div>
                                    {submission.user?.email && (
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 uppercase">
                                                Email
                                            </p>
                                            <p className="mt-1 text-sm text-gray-900">
                                                {submission.user.email}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Dados Submetidos */}
                            <div className="rounded-lg border border-gray-200 bg-white p-6">
                                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                                    Dados Preenchidos
                                </h2>

                                {template?.structure && template.structure.length > 0 ? (
                                    <div className="space-y-4">
                                        {template.structure.map((field: any, index: number) => {
                                            const fieldKey = field.name || field.label;
                                            const value = submission.submitted_data?.[fieldKey];

                                            return (
                                                <div
                                                    key={index}
                                                    className="rounded-lg border border-gray-100 bg-gray-50 p-4"
                                                >
                                                    <label className="block text-sm font-medium text-gray-900">
                                                        {field.label || field.name}
                                                        {field.required && (
                                                            <span className="ml-1 text-red-600">*</span>
                                                        )}
                                                    </label>
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        Tipo: {field.type}
                                                    </p>
                                                    <div className="mt-3 rounded bg-white p-3 border border-gray-200">
                                                        {value !== undefined && value !== null ? (
                                                            <p className="text-sm text-gray-900">
                                                                {typeof value === 'object'
                                                                    ? JSON.stringify(value)
                                                                    : String(value)}
                                                            </p>
                                                        ) : (
                                                            <p className="text-sm text-gray-400 italic">
                                                                Não preenchido
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">
                                        Sem campos definidos neste formulário
                                    </p>
                                )}
                            </div>

                            {/* JSON Raw Data (Optional Debug) */}
                            <details className="rounded-lg border border-gray-200 bg-white p-6">
                                <summary className="cursor-pointer font-medium text-gray-900">
                                    Dados Brutos (JSON)
                                </summary>
                                <pre className="mt-4 overflow-x-auto rounded bg-gray-100 p-4 text-xs text-gray-700">
                                    {JSON.stringify(submission.submitted_data, null, 2)}
                                </pre>
                            </details>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
