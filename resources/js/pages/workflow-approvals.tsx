import { Head } from '@inertiajs/react';
import { ClipboardCheck } from 'lucide-react';

export default function WorkflowApprovals() {
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

                <div className="flex flex-1 items-center justify-center p-6">
                    <div className="flex max-w-sm flex-col items-center rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                            <ClipboardCheck className="h-6 w-6" />
                        </div>
                        <h2 className="text-base font-semibold text-gray-900">
                            Sem aprovações pendentes
                        </h2>
                        <p className="mt-2 text-sm text-gray-500">
                            Os workflows a validar aparecerão aqui.
                        </p>
                    </div>
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
