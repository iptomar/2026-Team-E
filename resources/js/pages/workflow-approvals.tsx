import { Head, router } from '@inertiajs/react';
import { ClipboardCheck, ShieldCheck, CheckCircle, Eye, FileText } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';

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
    current_step_index?: number;
    created_at: string;
    form_template?: Template;
    user?: {
        name: string;
    };
}

function getCurrentStepName(submission: FormSubmission): string {
    const sequence = submission.form_template?.validation_sequence;
    if (!sequence || !Array.isArray(sequence)) return 'Validação';
    const stepIndex = submission.current_step_index ?? 0;
    const step = sequence[stepIndex];
    return step?.name || `Passo ${stepIndex + 1}`;
}

function ValidationCard({
    formName,
    submittedAt,
    submittedBy,
    stepName,
    onValidate,
}: {
    formName: string;
    submittedAt: string;
    submittedBy: string;
    stepName: string;
    onValidate: () => void;
}) {
    const formattedDate = new Date(submittedAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });

    return (
        <div className="group w-[280px] shrink-0 snap-start rounded-2xl border border-amber-200 bg-white p-4 transition-all duration-200 hover:-translate-y-1 hover:border-amber-300 hover:shadow-md">
            <div className="mb-3 flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 text-amber-600">
                    <ShieldCheck className="h-5 w-5" />
                </div>
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

                <p className="mt-1 text-xs text-amber-700">
                    Passo atual: <span className="font-medium">{stepName}</span>
                </p>
            </div>

            <div className="border-t border-amber-100 pt-4">
                <Button
                    size="sm"
                    className="w-full gap-2 bg-amber-600 text-xs text-white hover:bg-amber-700"
                    onClick={onValidate}
                >
                    <Eye className="h-4 w-4" />
                    Validar
                </Button>
            </div>
        </div>
    );
}

function LoadingState() {
    return (
        <div className="flex h-64 items-center justify-center">
            <div className="text-gray-500">Carregando...</div>
        </div>
    );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50/50 px-6 py-8 text-center">
            <p className="mb-3 text-sm font-medium text-red-600">{message}</p>
            <Button size="sm" variant="outline" onClick={onRetry}>
                Tentar novamente
            </Button>
        </div>
    );
}

function EmptyState({ hasSearch }: { hasSearch?: boolean }) {
    return (
        <div className="flex flex-1 items-center justify-center p-6">
            <div className="flex max-w-sm flex-col items-center rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                    <ClipboardCheck className="h-6 w-6" />
                </div>
                <h2 className="text-base font-semibold text-gray-900">
                    {hasSearch ? 'Nenhuma validação encontrada' : 'Sem aprovações pendentes'}
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                    {hasSearch
                        ? 'Tenta outro termo para encontrar validações pendentes.'
                        : 'Os workflows a validar aparecerão aqui.'}
                </p>
            </div>
        </div>
    );
}

export default function WorkflowApprovals() {
    const [validations, setValidations] = useState<FormSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchValidations = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/validations', {
                headers: { Accept: 'application/json' },
                credentials: 'same-origin',
            });

            if (!response.ok) {
                throw new Error('Falha ao carregar validações');
            }

            const data = await response.json();
            setValidations(data);
        } catch (err) {
            console.error('Error fetching validations:', err);
            setError('Erro ao carregar validações pendentes');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchValidations();
    }, [fetchValidations]);

    const handleValidate = (submissionId: number) => {
        router.visit(`/submission-details?id=${submissionId}`);
    };

    const isEmpty = validations.length === 0;

    return (
        <>
            <Head title="Aprovações de Workflow" />

            <div className="flex h-full flex-1 flex-col bg-gray-100 text-gray-900">
                <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 px-6 py-4 backdrop-blur-xl">
                    <h1 className="text-xl font-semibold">
                        Aprovações de Workflow
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Workflows pendentes de validação
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <LoadingState />
                    ) : error ? (
                        <ErrorState message={error} onRetry={fetchValidations} />
                    ) : isEmpty ? (
                        <EmptyState />
                    ) : (
                        <div className="flex flex-wrap gap-4">
                            {validations.map((submission) => (
                                <ValidationCard
                                    key={submission.id}
                                    formName={submission.form_template?.name || `Submissão #${submission.id}`}
                                    submittedAt={submission.created_at}
                                    submittedBy={submission.user?.name || 'Utilizador desconhecido'}
                                    stepName={getCurrentStepName(submission)}
                                    onValidate={() => handleValidate(submission.id)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

WorkflowApprovals.layout = {
    breadcrumbs: [
        {
            title: 'Aprovações de Workflow',
            href: '/workflow-approvals',
        },
    ],
};
