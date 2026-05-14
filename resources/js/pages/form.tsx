import { Head } from '@inertiajs/react';
import { CheckCircle2, FileText, Send } from 'lucide-react';
import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import type { FormField } from '@/types/builder';

const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;

interface FormTemplate {
    id: number;
    name: string;
    structure: FormField[] | { fields?: FormField[] };
}

type FieldValue = string | string[];
type FormValues = Record<string, FieldValue>;

type SubmitState =
    | { type: 'idle'; message: string }
    | { type: 'success'; message: string }
    | { type: 'error'; message: string };

function getTemplateFields(template: FormTemplate | null): FormField[] {
    if (!template) {
        return [];
    }

    if (Array.isArray(template.structure)) {
        return template.structure;
    }

    return template.structure.fields ?? [];
}

function fieldKey(field: FormField) {
    return field.name || field.id;
}

function createInitialValues(fields: FormField[]): FormValues {
    return fields.reduce<FormValues>((values, field) => {
        if (field.type === 'label') {
            return values;
        }

        values[fieldKey(field)] = field.type === 'checkbox' ? [] : '';

        return values;
    }, {});
}

function renderField(
    field: FormField,
    values: FormValues,
    onValueChange: (name: string, value: FieldValue) => void,
) {
    const key = fieldKey(field);
    const fontSize = field.fontSize ?? (field.type === 'label' ? 24 : 14);
    const commonLabel = (
        <label
            htmlFor={field.id}
            className="block font-semibold text-gray-700"
            style={{ fontSize: `${fontSize}px` }}
        >
            {field.label}
            {field.required && <span className="ml-1 text-red-500">*</span>}
        </label>
    );

    if (field.type === 'label') {
        return (
            <p
                className="font-semibold text-gray-900"
                style={{ fontSize: `${fontSize}px` }}
            >
                {field.label}
            </p>
        );
    }

    if (field.type === 'textarea') {
        return (
            <div className="flex h-full flex-col justify-start space-y-1.5 overflow-hidden">
                {commonLabel}
                <textarea
                    id={field.id}
                    name={key}
                    required={field.required}
                    minLength={field.minLength}
                    maxLength={field.maxLength}
                    placeholder={field.placeholder ?? ''}
                    value={(values[key] as string) ?? ''}
                    onChange={(event) => onValueChange(key, event.target.value)}
                    rows={2}
                    className="w-full flex-1 resize-none rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm transition outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
                />
                {field.helperText && (
                    <p className="truncate text-xs text-gray-500">
                        {field.helperText}
                    </p>
                )}
            </div>
        );
    }

    if (field.type === 'select') {
        return (
            <div className="flex h-full flex-col justify-start space-y-1.5 overflow-hidden">
                {commonLabel}
                <select
                    id={field.id}
                    name={key}
                    required={field.required}
                    value={(values[key] as string) ?? ''}
                    onChange={(event) => onValueChange(key, event.target.value)}
                    className="w-full flex-1 rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm transition outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
                >
                    <option value="">
                        {field.placeholder ?? 'Selecionar opcao...'}
                    </option>
                    {field.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {field.helperText && (
                    <p className="truncate text-xs text-gray-500">
                        {field.helperText}
                    </p>
                )}
            </div>
        );
    }

    if (field.type === 'radio') {
        return (
            <fieldset className="flex h-full flex-col justify-start space-y-1.5 overflow-hidden">
                <legend
                    className="block font-semibold text-gray-700"
                    style={{ fontSize: `${fontSize}px` }}
                >
                    {field.label}
                    {field.required && (
                        <span className="ml-1 text-red-500">*</span>
                    )}
                </legend>
                <div className="flex-1 space-y-1.5 overflow-y-auto">
                    {(field.options?.length
                        ? field.options
                        : [{ label: 'Opcao 1', value: 'option1' }]
                    ).map((option) => (
                        <label
                            key={option.value}
                            className="flex items-center gap-2 text-sm text-gray-700"
                        >
                            <input
                                type="radio"
                                name={key}
                                value={option.value}
                                required={field.required}
                                checked={values[key] === option.value}
                                onChange={(event) =>
                                    onValueChange(key, event.target.value)
                                }
                                className="h-4 w-4 border-indigo-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="truncate">{option.label}</span>
                        </label>
                    ))}
                </div>
                {field.helperText && (
                    <p className="truncate text-xs text-gray-500">
                        {field.helperText}
                    </p>
                )}
            </fieldset>
        );
    }

    if (field.type === 'checkbox') {
        const selectedValues = Array.isArray(values[key])
            ? (values[key] as string[])
            : [];

        return (
            <fieldset className="flex h-full flex-col justify-start space-y-1.5 overflow-hidden">
                <legend
                    className="block font-semibold text-gray-700"
                    style={{ fontSize: `${fontSize}px` }}
                >
                    {field.label}
                    {field.required && (
                        <span className="ml-1 text-red-500">*</span>
                    )}
                </legend>
                <div className="flex-1 space-y-1.5 overflow-y-auto">
                    {(field.options?.length
                        ? field.options
                        : [{ label: 'Opcao 1', value: 'option1' }]
                    ).map((option) => (
                        <label
                            key={option.value}
                            className="flex items-center gap-2 text-sm text-gray-700"
                        >
                            <input
                                type="checkbox"
                                name={`${key}[]`}
                                value={option.value}
                                checked={selectedValues.includes(option.value)}
                                onChange={(event) => {
                                    const nextValues = event.target.checked
                                        ? [...selectedValues, option.value]
                                        : selectedValues.filter(
                                              (value) => value !== option.value,
                                          );

                                    onValueChange(key, nextValues);
                                }}
                                className="h-4 w-4 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="truncate">{option.label}</span>
                        </label>
                    ))}
                </div>
                {field.helperText && (
                    <p className="truncate text-xs text-gray-500">
                        {field.helperText}
                    </p>
                )}
            </fieldset>
        );
    }

    return (
        <div className="flex h-full flex-col justify-start space-y-1.5 overflow-hidden">
            {commonLabel}
            <input
                id={field.id}
                type="text"
                name={key}
                required={field.required}
                minLength={field.minLength}
                maxLength={field.maxLength}
                placeholder={field.placeholder ?? ''}
                value={(values[key] as string) ?? ''}
                onChange={(event) => onValueChange(key, event.target.value)}
                className="w-full rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm transition outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
            />
            {field.helperText && (
                <p className="truncate text-xs text-gray-500">
                    {field.helperText}
                </p>
            )}
        </div>
    );
}

export default function Form() {
    const [templates, setTemplates] = useState<FormTemplate[]>([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(
        null,
    );
    const [values, setValues] = useState<FormValues>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<SubmitState>({
        type: 'idle',
        message: 'Escolhe um template para preencher.',
    });

    const selectedTemplate = useMemo(
        () =>
            templates.find((template) => template.id === selectedTemplateId) ??
            null,
        [selectedTemplateId, templates],
    );

    const fields = useMemo(
        () => getTemplateFields(selectedTemplate),
        [selectedTemplate],
    );

    useEffect(() => {
        let isMounted = true;

        async function loadTemplates() {
            setIsLoading(true);

            try {
                const response = await fetch('/api/templates', {
                    headers: { Accept: 'application/json' },
                    credentials: 'same-origin',
                });

                if (!response.ok) {
                    throw new Error('Nao foi possivel carregar os templates.');
                }

                const payload = await response.json();
                const templateList = Array.isArray(payload)
                    ? payload
                    : (payload.data ?? []);

                if (!isMounted) {
                    return;
                }

                setTemplates(templateList);
                setSelectedTemplateId(templateList[0]?.id ?? null);
                setStatus({
                    type: 'idle',
                    message:
                        templateList.length > 0
                            ? 'Preenche os campos e submete o formulario.'
                            : 'Ainda nao existem templates guardados.',
                });
            } catch (error) {
                if (!isMounted) {
                    return;
                }

                setStatus({
                    type: 'error',
                    message:
                        error instanceof Error
                            ? error.message
                            : 'Nao foi possivel carregar os templates.',
                });
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        loadTemplates();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        setValues(createInitialValues(fields));
    }, [fields]);

    const handleTemplateSelect = (templateId: number) => {
        setSelectedTemplateId(templateId);
        setStatus({
            type: 'idle',
            message: 'Preenche os campos e submete o formulario.',
        });
    };

    const handleValueChange = (name: string, value: FieldValue) => {
        setValues((currentValues) => ({
            ...currentValues,
            [name]: value,
        }));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!selectedTemplate) {
            setStatus({
                type: 'error',
                message: 'Escolhe um template antes de submeter.',
            });

            return;
        }

        setIsSubmitting(true);
        setStatus({ type: 'idle', message: 'A enviar submissao...' });

        try {
            const response = await fetch('/api/submissions', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    form_template_id: selectedTemplate.id,
                    submitted_data: values,
                }),
            });

            if (!response.ok) {
                const error = await response.json().catch(() => null);

                throw new Error(
                    error?.message || 'Nao foi possivel submeter o formulario.',
                );
            }

            setValues(createInitialValues(fields));
            setStatus({
                type: 'success',
                message: 'Formulario submetido com sucesso.',
            });
        } catch (error) {
            setStatus({
                type: 'error',
                message:
                    error instanceof Error
                        ? error.message
                        : 'Nao foi possivel submeter o formulario.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Head title="Preencher Formularios" />
            <div className="flex h-full min-h-0 bg-gray-100 text-gray-900">
                <aside className="w-80 shrink-0 overflow-y-auto border-r border-gray-200 bg-white">
                    <div className="border-b border-gray-200 px-5 py-4">
                        <h1 className="text-lg font-semibold">
                            Preencher formularios
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Templates criados no canvas
                        </p>
                    </div>

                    <div className="space-y-2 p-3">
                        {isLoading && (
                            <div className="rounded-lg border border-gray-200 px-3 py-3 text-sm text-gray-500">
                                A carregar templates...
                            </div>
                        )}

                        {!isLoading &&
                            templates.map((template) => {
                                const templateFields =
                                    getTemplateFields(template);
                                const isSelected =
                                    template.id === selectedTemplateId;

                                return (
                                    <button
                                        key={template.id}
                                        type="button"
                                        onClick={() =>
                                            handleTemplateSelect(template.id)
                                        }
                                        className={`w-full rounded-lg border px-3 py-3 text-left transition ${
                                            isSelected
                                                ? 'border-indigo-300 bg-indigo-50 text-indigo-950'
                                                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <FileText className="mt-0.5 h-4 w-4 shrink-0" />
                                            <div className="min-w-0">
                                                <div className="truncate text-sm font-semibold">
                                                    {template.name}
                                                </div>
                                                <div className="mt-1 text-xs text-gray-500">
                                                    {templateFields.length}{' '}
                                                    elemento
                                                    {templateFields.length === 1
                                                        ? ''
                                                        : 's'}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}

                        {!isLoading && templates.length === 0 && (
                            <div className="rounded-lg border border-dashed border-gray-300 px-3 py-6 text-center text-sm text-gray-500">
                                Guarda um template no canvas para aparecer aqui.
                            </div>
                        )}
                    </div>
                </aside>

                <main className="min-w-0 flex-1 overflow-auto">
                    <form
                        onSubmit={handleSubmit}
                        className="mx-auto flex min-h-full w-max flex-col gap-4 px-8 py-6"
                    >
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h2 className="text-base font-semibold">
                                    {selectedTemplate?.name ??
                                        'Nenhum template selecionado'}
                                </h2>
                                <p
                                    className={`mt-1 text-sm ${
                                        status.type === 'success'
                                            ? 'text-emerald-700'
                                            : status.type === 'error'
                                              ? 'text-red-700'
                                              : 'text-gray-500'
                                    }`}
                                    aria-live="polite"
                                >
                                    {status.message}
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={
                                    !selectedTemplate ||
                                    fields.length === 0 ||
                                    isSubmitting
                                }
                                className="inline-flex h-9 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
                            >
                                {status.type === 'success' ? (
                                    <CheckCircle2 className="h-4 w-4" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                                {isSubmitting ? 'A enviar...' : 'Submeter'}
                            </button>
                        </div>

                        <div className="flex justify-center pb-8">
                            <div
                                className="relative bg-white shadow-2xl"
                                style={{
                                    width: '210mm',
                                    height: '297mm',
                                }}
                            >
                                <div
                                    className="pointer-events-none absolute inset-0 opacity-20"
                                    style={{
                                        backgroundImage: `
                                            repeating-linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                                            repeating-linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
                                        `,
                                        backgroundSize: '20px 20px',
                                    }}
                                />

                                {fields.map((field) => (
                                    <div
                                        key={field.id}
                                        className="absolute overflow-hidden"
                                        style={{
                                            left: `${field.x ?? 20}px`,
                                            top: `${field.y ?? 20}px`,
                                            width: `${field.width ?? 400}px`,
                                            height: `${field.height ?? 60}px`,
                                            maxWidth: `${A4_WIDTH_PX - (field.x ?? 20)}px`,
                                            maxHeight: `${A4_HEIGHT_PX - (field.y ?? 20)}px`,
                                        }}
                                    >
                                        {renderField(
                                            field,
                                            values,
                                            handleValueChange,
                                        )}
                                    </div>
                                ))}

                                {fields.length === 0 && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                                        <FileText className="mb-3 h-10 w-10" />
                                        <div className="font-semibold">
                                            Sem elementos para preencher
                                        </div>
                                        <div className="text-sm">
                                            Escolhe outro template ou cria um no
                                            canvas.
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </form>
                </main>
            </div>
        </>
    );
}

Form.layout = {
    breadcrumbs: [
        {
            title: 'Preencher Formularios',
            href: '/preencher-formularios',
        },
    ],
};
