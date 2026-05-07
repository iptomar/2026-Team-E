import axios from 'axios';

const API_BASE_URL = '/api';

export interface Label {
    id: number;
    name: string;
    users?: any[];
}

export interface WorkflowStep {
    id?: number;
    name: string;
    type: 'aprovar' | 'informar';
    labels: Label[];
    order: number;
}

export interface WorkflowData {
    steps: WorkflowStep[];
}

export interface FormTemplate {
    id: number;
    name: string;
    structure: any;
    validation_sequence: any;
    allowed_roles: string[];
}

class WorkflowService {
    private api = axios.create({
        baseURL: API_BASE_URL,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
    });

    constructor() {
        // Adicionar interceptor para incluir token de autenticação
        this.api.interceptors.request.use((config) => {
            const token = localStorage.getItem('auth_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });
    }

    // Obter todos os labels disponíveis
    async getLabels(): Promise<Label[]> {
        try {
            const response = await this.api.get('/labels');
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar labels:', error);
            throw error;
        }
    }

    // Guardar workflow de um template
    async saveWorkflow(templateId: number, workflowData: WorkflowData): Promise<any> {
        try {
            const response = await this.api.post(`/templates/${templateId}/workflow`, workflowData);
            return response.data;
        } catch (error) {
            console.error('Erro ao guardar workflow:', error);
            throw error;
        }
    }

    // Obter workflow de um template
    async getWorkflow(templateId: number): Promise<WorkflowStep[]> {
        try {
            const response = await this.api.get(`/templates/${templateId}/workflow`);
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar workflow:', error);
            throw error;
        }
    }

    // Obter validações pendentes para o utilizador atual
    async getPendingValidations(): Promise<any[]> {
        try {
            const response = await this.api.get('/validations/pending');
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar validações pendentes:', error);
            throw error;
        }
    }

    // Processar uma validação (aprovar/rejeitar)
    async processValidation(validationId: number, action: 'approve' | 'reject', comments?: string): Promise<any> {
        try {
            const response = await this.api.post(`/validations/${validationId}/process`, {
                action,
                comments,
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao processar validação:', error);
            throw error;
        }
    }

    // Obter templates disponíveis
    async getTemplates(): Promise<FormTemplate[]> {
        try {
            const response = await this.api.get('/templates');
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar templates:', error);
            throw error;
        }
    }

    // Obter detalhes de um template específico
    async getTemplate(templateId: number): Promise<FormTemplate> {
        try {
            const response = await this.api.get(`/templates/${templateId}`);
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar template:', error);
            throw error;
        }
    }

    // Submeter formulário
    async submitForm(templateId: number, data: any): Promise<any> {
        try {
            const response = await this.api.post('/submissions', {
                form_template_id: templateId,
                data,
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao submeter formulário:', error);
            throw error;
        }
    }

    // Obter submissões do utilizador
    async getUserSubmissions(): Promise<any[]> {
        try {
            const response = await this.api.get('/submissions');
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar submissões:', error);
            throw error;
        }
    }

    // Obter detalhes de uma submissão
    async getSubmission(submissionId: number): Promise<any> {
        try {
            const response = await this.api.get(`/submissions/${submissionId}`);
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar submissão:', error);
            throw error;
        }
    }
}

export default new WorkflowService();
