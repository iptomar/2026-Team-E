import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, { 
    addEdge, 
    Background, 
    Controls, 
    applyEdgeChanges, 
    applyNodeChanges 
} from 'reactflow';
import 'reactflow/dist/style.css';
import AppLayout from '@/layouts/app-layout'; // Ou o seu layout padrão
import { Head } from '@inertiajs/react';
import { StepNode } from '@/components/workflow/StepNode'; // Importa o componente do nó personalizado

// Registra o tipo de nó personalizado
const nodeTypes = {
    stepNode: StepNode,
};
// Componente Principal
// Simulação do GetLabels
const STATIC_LABELS = [
    { id: 1, name: 'Engineering Secretary' },
    { id: 2, name: 'Dean\'s Office' },
    { id: 3, name: 'IT Coordination' },
    { id: 4, name: 'Financial Dept' },
];

const WorkflowEditor = () => {
    const [templateId, setTemplateId] = useState<string | null>(null);
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [selectedNode, setSelectedNode] = useState(null);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const params = new URLSearchParams(window.location.search);
        setTemplateId(params.get('templateId'));
    }, []);

    const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
    const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
    const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);

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

    // Função para atualizar dados do nó selecionado
    const updateNodeData = (newData) => {
        setNodes((nds) => nds.map((n) => n.id === selectedNode.id ? { ...n, data: { ...n.data, ...newData } } : n));
        setSelectedNode((prev) => ({ ...prev, data: { ...prev.data, ...newData } }));
    };

    // Toggle de seleção de labels (1-N)
    const toggleLabel = (label) => {
        const currentLabels = selectedNode.data.labels || [];
        const exists = currentLabels.find(l => l.id === label.id);
        
        const newLabels = exists 
            ? currentLabels.filter(l => l.id !== label.id)
            : [...currentLabels, label];
        
        updateNodeData({ labels: newLabels });
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-gray-100">
            {/* SIDEBAR ESQUERDA */}
            <aside className="w-64 border-r bg-white p-4">
                <button 
                    onClick={addNewStep}
                    className="w-full bg-indigo-600 text-white py-2 rounded shadow hover:bg-indigo-700 transition"
                >
                    + Novo Passo de Validação
                </button>
                {templateId ? (
                    <div className="mt-4 rounded border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                        Template ID: <span className="font-semibold">{templateId}</span>
                    </div>
                ) : null}
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
                                {STATIC_LABELS.map(label => {
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