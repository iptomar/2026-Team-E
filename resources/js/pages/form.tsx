import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';

interface Props {
    id: number;
}

export default function Form({ id }: Props) {
    const [formData, setFormData] = useState<{ title: string; fields: any[] } | null>(null);

    useEffect(() => {
        // Simular requisição GET para buscar o formulário
        console.log(`Buscando formulário para ID: ${id}`);
        
        // Dados estáticos por enquanto
        setFormData({
            title: 'Título do Formulário',
            fields: [] // Placeholder para campos dinâmicos
        });
    }, [id]);

    return (
        <>
            <Head title="Formulário" />
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">Formulário ID: {id}</h1>
                {formData ? (
                    <div>
                        <h2 className="text-xl mb-4">{formData.title}</h2>
                        {/* Placeholder para construção dinâmica do formulário */}
                        <p className="text-gray-600">Os campos do formulário serão renderizados aqui dinamicamente.</p>
                    </div>
                ) : (
                    <p>Carregando...</p>
                )}
            </div>
        </>
    );
}
