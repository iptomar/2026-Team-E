import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, { 
    addEdge, 
    Background, 
    Controls, 
    applyEdgeChanges, 
    applyNodeChanges,
    Node,
    Edge
} from 'reactflow';
import 'reactflow/dist/style.css';
import AppLayout from '@/layouts/app-layout'; // Ou o seu layout padrão
import { Head } from '@inertiajs/react';
import { StepNode } from '@/components/workflow/StepNode'; // Importa o componente do nó personalizado
import workflowService, { Label, WorkflowStep } from '@/services/workflowService';

// Registra o tipo de nó personalizado
const nodeTypes = {
    stepNode: StepNode,
};
const WorkflowEditor = () => {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [labels, setLabels] = useState<Label[]>([]);
    const [loading, setLoading] = useState(true);
    const [templateId, setTemplateId] = useState<number | null>(null);

    const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
    const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
    const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);

    // Carregar labels da API
    useEffect(() => {
        const loadLabels = async () => {
            try {
                const labelsData = await workflowService.getLabels();
                setLabels(labelsData);
            } catch (error) {
                console.error('Erro ao carregar labels:', error);
            } finally {
                setLoading(false);
            }
        };

        loadLabels();
    }, []);

    const onNodeClick = (_, node) => setSelectedNode(node);

    // Adiciona novo passo vazio ao clicar/arrastar
    const addNewStep = () => {
        const id = `node_${Date.now()}`;
        const newNode = {
            id,
            type: 'stepNode',
            position: { x: 100, y: 100 },
            data: { 
                name: 'Novo Passo', 
                description: '', 
                labels: [], 
                type: 'aprovar' 
            },
        };
        setNodes((nds) => nds.concat(newNode));
    };

    // Converter nós para formato da API
    const nodesToWorkflowSteps = (): WorkflowStep[] => {
        return nodes.map((node, index) => ({
            name: node.data.name,
            type: node.data.type,
            labels: node.data.labels || [],
            order: index,
        }));
    };

    // Salvar workflow
    const saveWorkflow = async () => {
        if (!templateId) {
            alert('Por favor, selecione um template primeiro');
            return;
        }

        try {
            const workflowSteps = nodesToWorkflowSteps();
            await workflowService.saveWorkflow(templateId, { steps: workflowSteps });
            alert('Workflow guardado com sucesso!');
        } catch (error) {
            console.error('Erro ao guardar workflow:', error);
            alert('Erro ao guardar workflow');
        }
    };

    // Função para atualizar dados do nó selecionado
    const updateNodeData = (newData: any) => {
        if (!selectedNode) return;
        
        setNodes((nds) => nds.map((n) => n.id === selectedNode.id ? { ...n, data: { ...n.data, ...newData } } : n));
        setSelectedNode((prev) => prev ? { ...prev, data: { ...prev.data, ...newData } } : null);
    };

    // Toggle de seleção de labels (1-N)
    const toggleLabel = (label: Label) => {
        if (!selectedNode) return;
        
        const currentLabels = selectedNode.data.labels || [];
        const exists = currentLabels.find(l => l.id === label.id);
        
        const newLabels = exists 
            ? currentLabels.filter(l => l.id !== label.id)
            : [...currentLabels, label];
        
        updateNodeData({ labels: newLabels });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-lg">A carregar...</div>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full overflow-hidden bg-gray-100">
            {/* SIDEBAR ESQUERDA */}
            <aside className="w-64 border-r bg-white p-4">
                <div className="space-y-4">
                    <button 
                        onClick={addNewStep}
                        className="w-full bg-indigo-600 text-white py-2 rounded shadow hover:bg-indigo-700 transition"
                    >
                        + Novo Passo de Validação
                    </button>
                    
                    <button 
                        onClick={saveWorkflow}
                        className="w-full bg-green-600 text-white py-2 rounded shadow hover:bg-green-700 transition"
                    >
                        💾 Guardar Workflow
                    </button>
                </div>
            </aside>

            {/* CANVAS */}
            <main className="flex-1 relative">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={onNodeClick}
                    nodeTypes={nodeTypes}
                >
                    <Background />
                    <Controls />
                </ReactFlow>
            </main>

            {/* SIDEBAR DIREITA: EDIÇÃO PROPRIEDADES */}
            <aside className="w-80 border-l bg-white p-6 shadow-2xl">
                {selectedNode ? (
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold border-b pb-2">Editar Passo</h3>
                        
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Nome do Passo</label>
                            <input 
                                className="w-full border p-2 rounded mt-1 outline-indigo-500" 
                                value={selectedNode.data.name}
                                onChange={(e) => updateNodeData({ name: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Tipo de Ação</label>
                            <div className="flex gap-2 mt-2">
                                {['aprovar', 'informar'].map(t => (
                                    <button
                                        key={t}
                                        onClick={() => updateNodeData({ type: t })}
                                        className={`flex-1 py-1 px-2 rounded text-xs capitalize border ${selectedNode.data.type === t ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600'}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Responsáveis (Labels)</label>
                            <div className="space-y-1 max-h-60 overflow-y-auto border rounded p-2">
                                {labels.map(label => {
                                    const isSelected = selectedNode.data.labels?.some(l => l.id === label.id);
                                    return (
                                        <div 
                                            key={label.id}
                                            onClick={() => toggleLabel(label)}
                                            className={`p-2 rounded text-sm cursor-pointer transition ${isSelected ? 'bg-indigo-50 border-indigo-200 border text-indigo-700' : 'hover:bg-gray-50 text-gray-600'}`}
                                        >
                                            <input type="checkbox" checked={isSelected} readOnly className="mr-2" />
                                            {label.name}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-gray-400 text-center mt-20">Selecione um passo no canvas</div>
                )}
            </aside>
        </div>
    );
};

export default WorkflowEditor;