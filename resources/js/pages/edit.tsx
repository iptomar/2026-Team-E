import React from 'react';
import { Head } from '@inertiajs/react';

export default function Edit() {
    return (
        <>
            <Head title="Editar" />
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h1 className="text-2xl font-bold text-gray-900">
                                Página de Edição
                            </h1>
                        </div>
                        <div className="px-6 py-8">
                            <p className="text-gray-600">
                                Esta é uma página vazia para edição. Você pode adicionar conteúdo aqui conforme necessário.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}