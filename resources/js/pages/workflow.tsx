import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactFlow, {
    Background,
    Controls,
    applyEdgeChanges,
    applyNodeChanges,
    ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { StepNode } from '@/components/workflow/StepNode';

const nodeTypes = {
    stepNode: StepNode,
};

const STATIC_LABELS = [
    { id: 1, name: 'Engineering Secretary' },
    { id: 2, name: "Dean's Office" },
    { id: 3, name: 'IT Coordination' },
    { id: 4, name: 'Financial Dept' },
];

const NODE_WIDTH  = 320; // largura do nó
const NODE_HEIGHT = 80;  // altura mínima do nó
const NODE_GAP    = 130; // espaço vertical entre nós (centro a centro)

// Reconstrói edges em sequência com base na ordem atual dos nós
const buildEdges = (nodes) =>
    nodes.slice(0, -1).map((node, i) => ({
        id: `edge_${i}`,
        source: node.id,
        target: nodes[i + 1].id,
        type: 'smoothstep',
    }));

const WorkflowEditorInner = () => {
    const [templateId, setTemplateId] = useState(null);
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [selectedNode, setSelectedNode] = useState(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const params = new URLSearchParams(window.location.search);
        setTemplateId(params.get('templateId'));
    }, []);

    // X centrado com base na largura actual do canvas
    const getX = useCallback(() => {
        const w = canvasRef.current?.offsetWidth ?? 800;
        return Math.max((w - NODE_WIDTH) / 2, 40);
    }, []);

    // Aplica posições em coluna centrada a uma lista de nós
    const reposition = useCallback(
        (nds) => {
            const x = getX();
            return nds.map((node, index) => ({
                ...node,
                position: { x, y: index * NODE_GAP },
                style: { width: NODE_WIDTH, minHeight: NODE_HEIGHT, cursor: 'grab' },
            }));
        },
        [getX]
    );

    // Durante o drag: bloqueia o eixo X, só deixa mover em Y
    const onNodeDrag = useCallback(
        (_, draggedNode) => {
            const x = getX();
            setNodes((nds) =>
                nds.map((n) =>
                    n.id === draggedNode.id
                        ? { ...n, position: { x, y: draggedNode.position.y } }
                        : n
                )
            );
        },
        [getX]
    );

    // No fim do drag: reordena a lista com base na posição Y final
    const onNodeDragStop = useCallback(
        (_, draggedNode) => {
            setNodes((nds) => {
                const draggedIndex = nds.findIndex((n) => n.id === draggedNode.id);
                const targetIndex = Math.round(draggedNode.position.y / NODE_GAP);
                const clamped = Math.max(0, Math.min(targetIndex, nds.length - 1));

                let reordered = [...nds];
                if (clamped !== draggedIndex) {
                    const [moved] = reordered.splice(draggedIndex, 1);
                    reordered.splice(clamped, 0, moved);
                }

                const repositioned = reposition(reordered);
                setEdges(buildEdges(repositioned));
                return repositioned;
            });
        },
        [reposition]
    );

    const onNodesChange = useCallback((changes) => {
        // Ignora changes de posição — controlamos isso no drag
        const filtered = changes.filter((c) => c.type !== 'position');
        setNodes((nds) => applyNodeChanges(filtered, nds));
    }, []);

    const onEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        []
    );

    const onNodeClick = (_, node) => setSelectedNode(node);

    const addNewStep = () => {
        const id = `node_${Date.now()}`;
        setNodes((nds) => {
            const newNode = {
                id,
                type: 'stepNode',
                position: { x: getX(), y: nds.length * NODE_GAP },
                style: { width: NODE_WIDTH, minHeight: NODE_HEIGHT, cursor: 'grab' },
                data: {
                    name: 'Novo Passo',
                    description: '',
                    labels: [],
                    type: 'aprovar',
                },
            };
            const updated = [...nds, newNode];
            setEdges(buildEdges(updated));
            return updated;
        });
    };

    const updateNodeData = (newData) => {
        setNodes((nds) =>
            nds.map((n) =>
                n.id === selectedNode.id
                    ? { ...n, data: { ...n.data, ...newData } }
                    : n
            )
        );
        setSelectedNode((prev) => ({
            ...prev,
            data: { ...prev.data, ...newData },
        }));
    };

    const toggleLabel = (label) => {
        const currentLabels = selectedNode.data.labels || [];
        const exists = currentLabels.find((l) => l.id === label.id);
        const newLabels = exists
            ? currentLabels.filter((l) => l.id !== label.id)
            : [...currentLabels, label];
        updateNodeData({ labels: newLabels });
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-gray-100">
            {/* SIDEBAR ESQUERDA */}
            <aside className="w-64 flex-shrink-0 border-r bg-white p-4">
                <button
                    onClick={addNewStep}
                    className="w-full bg-indigo-600 text-white py-2 rounded shadow hover:bg-indigo-700 transition"
                >
                    + Novo Passo de Validação
                </button>
                {nodes.length > 0 && (
                    <p className="mt-3 text-xs text-gray-400 text-center">
                        Arrasta para reordenar
                    </p>
                )}
                {templateId && (
                    <div className="mt-4 rounded border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                        Template ID:{' '}
                        <span className="font-semibold">{templateId}</span>
                    </div>
                )}
            </aside>

            {/* CANVAS */}
            <main className="relative flex-1" ref={canvasRef}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onNodeClick={onNodeClick}
                    onNodeDrag={onNodeDrag}
                    onNodeDragStop={onNodeDragStop}
                    nodeTypes={nodeTypes}
                    nodesDraggable={true}
                    nodesConnectable={false}
                    onConnect={() => {}}
                    connectOnClick={false}
                    fitView
                    fitViewOptions={{ padding: 2 }}
                >
                    <Background />
                    <Controls showInteractive={false} />
                </ReactFlow>
            </main>

            {/* SIDEBAR DIREITA */}
            <aside className="w-80 flex-shrink-0 border-l bg-white p-6 shadow-2xl">
                {selectedNode ? (
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold border-b pb-2">
                            Editar Passo
                        </h3>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">
                                Nome do Passo
                            </label>
                            <input
                                className="w-full border p-2 rounded mt-1 outline-indigo-500"
                                value={selectedNode.data.name}
                                onChange={(e) =>
                                    updateNodeData({ name: e.target.value })
                                }
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">
                                Tipo de Ação
                            </label>
                            <div className="flex gap-2 mt-2">
                                {['aprovar', 'informar'].map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => updateNodeData({ type: t })}
                                        className={`flex-1 py-1 px-2 rounded text-xs capitalize border ${
                                            selectedNode.data.type === t
                                                ? 'bg-indigo-600 text-white border-indigo-600'
                                                : 'bg-white text-gray-600'
                                        }`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-2">
                                Responsáveis (Labels)
                            </label>
                            <div className="space-y-1 max-h-60 overflow-y-auto border rounded p-2">
                                {STATIC_LABELS.map((label) => {
                                    const isSelected = selectedNode.data.labels?.some(
                                        (l) => l.id === label.id
                                    );
                                    return (
                                        <div
                                            key={label.id}
                                            onClick={() => toggleLabel(label)}
                                            className={`p-2 rounded text-sm cursor-pointer transition ${
                                                isSelected
                                                    ? 'bg-indigo-50 border-indigo-200 border text-indigo-700'
                                                    : 'hover:bg-gray-50 text-gray-600'
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                readOnly
                                                className="mr-2"
                                            />
                                            {label.name}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-gray-400 text-center mt-20">
                        Selecione um passo no canvas
                    </div>
                )}
            </aside>
        </div>
    );
};

// ReactFlowProvider é obrigatório para usar hooks internos do ReactFlow
const WorkflowEditor = () => (
    <ReactFlowProvider>
        <WorkflowEditorInner />
    </ReactFlowProvider>
);

export default WorkflowEditor;