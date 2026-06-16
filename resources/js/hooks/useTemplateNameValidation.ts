import { useState, useCallback } from 'react';

export interface NameValidationState {
    isValid: boolean;
    isChecking: boolean;
    message: string;
}

/**
 * Hook para validar disponibilidade do nome do template em tempo real
 */
export function useTemplateNameValidation() {
    const [validation, setValidation] = useState<NameValidationState>({
        isValid: true,
        isChecking: false,
        message: '',
    });

    const checkNameAvailability = useCallback(
        async (name: string, currentTemplateId?: string | null) => {
            // Se o nome está vazio, não valida
            if (!name?.trim()) {
                setValidation({ isValid: true, isChecking: false, message: '' });
                return true;
            }

            setValidation((prev) => ({
                ...prev,
                isChecking: true,
            }));

            try {
                // Faz um GET para verificar se o nome existe
                const response = await fetch(
                    `/api/templates/check-name?name=${encodeURIComponent(name)}${
                        currentTemplateId ? `&currentId=${currentTemplateId}` : ''
                    }`,
                    {
                        headers: { Accept: 'application/json' },
                        credentials: 'same-origin',
                    }
                );

                const data = await response.json();

                if (data.available) {
                    setValidation({
                        isValid: true,
                        isChecking: false,
                        message: '',
                    });
                    return true;
                } else {
                    setValidation({
                        isValid: false,
                        isChecking: false,
                        message: 'Este nome de template já existe. Escolha outro nome.',
                    });
                    return false;
                }
            } catch (error) {
                // Se houver erro na verificação, deixa o utilizador continuar
                // (o backend fará a validação final)
                setValidation({
                    isValid: true,
                    isChecking: false,
                    message: '',
                });
                return true;
            }
        },
        []
    );

    return { validation, checkNameAvailability };
}
