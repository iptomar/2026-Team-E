import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';

export default function Form() {
    const [templateId, setTemplateId] = useState<string | null>(null);
    const [formData, setFormData] = useState<{ title: string; fields: any[] } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const params = new URLSearchParams(window.location.search);
        const id = params.get('templateId');
        setTemplateId(id);

        if (id) {
            fetchTemplate(id);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchTemplate = async (id: string) => {
        try {
            const response = await fetch(`/api/templates/${id}`, {
                headers: {
                    Accept: 'application/json',
                },
                credentials: 'same-origin',
            });

            if (!response.ok) {
                throw new Error('Falha ao carregar template');
            }

            const template = await response.json();
            setFormData({
                title: template.name,
                fields: template.structure || []
            });
        } catch (error) {
            console.error('Erro ao carregar template:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <>
                <Head title="Formulário" />
                <div className="container mx-auto p-4">
                    <div className="flex justify-center items-center h-64">
                        <div className="text-gray-500">Carregando formulário...</div>
                    </div>
                </div>
            </>
        );
    }

    if (!templateId) {
        return (
            <>
                <Head title="Formulário" />
                <div className="container mx-auto p-4">
                    <div className="flex justify-center items-center h-64">
                        <div className="text-red-500">Template ID não fornecido</div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="Formulário" />
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">Formulário - Template ID: {templateId}</h1>
                {formData ? (
                    <div>
                        <h2 className="text-xl mb-4">{formData.title}</h2>
                        {formData.fields.length > 0 ? (
                            <div className="space-y-4">
                                {formData.fields.map((field, index) => (
                                    <div key={index} className="border p-4 rounded">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {field.label || `Campo ${index + 1}`}
                                        </label>
                                        {field.type === 'input' && (
                                            <input
                                                type="text"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                placeholder={field.placeholder || ''}
                                            />
                                        )}
                                        {field.type === 'textarea' && (
                                            <textarea
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                rows={4}
                                                placeholder={field.placeholder || ''}
                                            />
                                        )}
                                        {field.type === 'select' && (
                                            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                                <option value="">Selecione...</option>
                                                {field.options?.map((option: string, optIndex: number) => (
                                                    <option key={optIndex} value={option}>{option}</option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                ))}
                                <button className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors">
                                    Enviar Formulário
                                </button>
                            </div>
                        ) : (
                            <p className="text-gray-600">Este template não possui campos configurados.</p>
                        )}
                    </div>
                ) : (
                    <div className="flex justify-center items-center h-64">
                        <div className="text-gray-500">Erro ao carregar formulário</div>
                    </div>
                )}
            </div>
        </>
    );
}
