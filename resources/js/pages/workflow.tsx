import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
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

// Nota: Labels serão carregadas dinamicamente da API
const DEFAULT_EMPTY_LABELS: any[] = [];

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
    const [template, setTemplate] = useState(null);
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [selectedNode, setSelectedNode] = useState(null);
    const [loading, setLoading] = useState(true);
    const [labels, setLabels] = useState<any[]>([]);
    const [saveStatus, setSaveStatus] = useState<
        'idle' | 'saving' | 'success' | 'error'
    >('idle');
    const [saveMessage, setSaveMessage] = useState<string>('');
    const canvasRef = useRef(null);

    // Carregar template quando templateId está disponível
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const params = new URLSearchParams(window.location.search);
        const id = params.get('templateId');
        setTemplateId(id);

        // Carregar labels/grupos da API
        fetch('/api/roles')
            .then(r => r.json())
            .then(data => setLabels(data))
            .catch(err => console.error('Erro ao carregar labels:', err));

        if (id) {
            const fetchTemplate = async () => {
                try {
                    const response = await fetch(`/api/templates/${id}`);
                    if (response.ok) {
                        const data = await response.json();
                        setTemplate(data);
                        // Se o template já tem validation_sequence, carrega-lo como nodes
                        if (data.validation_sequence && data.validation_sequence.length > 0) {
                            const loadedNodes = convertSequenceToNodes(data.validation_sequence);
                            setNodes(loadedNodes);
                            setEdges(buildEdges(loadedNodes));
                        }
                    }
                } catch (error) {
                    console.error('Erro ao carregar template:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchTemplate();
        }
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

    // Converte validation_sequence de BD em nodes do ReactFlow
    const convertSequenceToNodes = (sequence) => {
        if (!Array.isArray(sequence)) return [];
        return sequence.map((step, index) => ({
            id: step.id || `node_${step.name}_${index}`,
            type: 'stepNode',
            position: { x: 0, y: index * NODE_GAP },
            style: { width: NODE_WIDTH, minHeight: NODE_HEIGHT, cursor: 'grab' },
            data: {
                name: step.name || 'Novo Passo',
                description: step.description || '',
                labels: step.labels || [],
                type: step.type || 'aprovar',
            },
        }));
    };

    // Converte nodes do ReactFlow em validation_sequence para guardar na BD
    const convertNodesToSequence = () => {
        return nodes.map((node) => ({
            name: node.data.name,
            description: node.data.description || '',
            labels: node.data.labels || [],
            type: node.data.type || 'aprovar',
        }));
    };

    // Guardar workflow no template
    const handleSaveWorkflow = async () => {
        if (!templateId) {
            setSaveStatus('error');
            setSaveMessage('Template ID não disponível');
            return;
        }

        if (nodes.length === 0) {
            setSaveStatus('error');
            setSaveMessage('Adicione pelo menos um passo de validação');
            return;
        }

        setSaveStatus('saving');
        setSaveMessage('Gravando workflow...');

        const validationSequence = convertNodesToSequence();

        try {
            const response = await fetch(`/api/templates/${templateId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    validation_sequence: validationSequence,
                }),
            });

            if (!response.ok) {
                const error = await response.json().catch(() => null);
                setSaveStatus('error');
                setSaveMessage(
                    error?.message || 'Falha ao gravar o workflow.'
                );
                return;
            }

            const result = await response.json();
            setSaveStatus('success');
            setSaveMessage('Workflow gravado com sucesso!');

            // Redirecionar para forms-list após 1.5 segundos
            setTimeout(() => {
                router.visit('/forms-list');
            }, 1500);
        } catch (error) {
            setSaveStatus('error');
            setSaveMessage('Erro de rede ao gravar o workflow');
        }
    };

    return (
        <div className="flex h-screen w-full overflow-hidden flex-col bg-gray-100">
            {/* HEADER COM BOTÃO GRAVAR */}
            <div className="flex items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
                <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Configurar Workflow de Validação
                    </h2>
                    {templateId && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            Template #{templateId}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={handleSaveWorkflow}
                        disabled={saveStatus === 'saving' || loading || nodes.length === 0}
                        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
                    >
                        {saveStatus === 'saving'
                            ? 'Gravando...'
                            : 'Gravar Workflow'}
                    </button>
                    {saveMessage ? (
                        <div
                            className={`rounded-lg px-3 py-2 text-sm ${
                                saveStatus === 'success'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : saveStatus === 'error'
                                    ? 'bg-rose-100 text-rose-700'
                                    : 'bg-slate-100 text-slate-700'
                            }`}
                        >
                            {saveMessage}
                        </div>
                    ) : null}
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center flex-1">
                    <div className="text-gray-500">Carregando template...</div>
                </div>
            ) : (
                <div className="flex flex-1 overflow-hidden">
                    {/* SIDEBAR ESQUERDA */}
                    <aside className="w-64 flex-shrink-0 border-r bg-white p-4 overflow-y-auto">
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
                        <div className="mt-6 space-y-2 text-sm">
                            <h3 className="font-semibold text-gray-700">Passos ({nodes.length})</h3>
                            <div className="space-y-1">
                                {nodes.map((node, index) => (
                                    <div
                                        key={node.id}
                                        onClick={() => setSelectedNode(node)}
                                        className={`p-2 rounded cursor-pointer text-xs transition ${
                                            selectedNode?.id === node.id
                                                ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                        }`}
                                    >
                                        <div className="font-semibold">{index + 1}. {node.data.name}</div>
                                        <div className="text-gray-500">
                                            {node.data.type === 'aprovar' ? '✓ Aprovação' : 'ℹ Informação'}
                                        </div>
                                        {node.data.labels?.length > 0 && (
                                            <div className="text-gray-500 mt-1">
                                                {node.data.labels.length} responsável(is)
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
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
                    <aside className="w-80 flex-shrink-0 border-l bg-white p-6 shadow-2xl overflow-y-auto">
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
                                                {t === 'aprovar' ? '✓ Aprovação' : 'ℹ Informação'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase block mb-2">
                                        Responsáveis (Labels)
                                    </label>
                                    <div className="space-y-1 max-h-60 overflow-y-auto border rounded p-2">
                                        {labels && labels.length > 0 ? (
                                            labels.map((label) => {
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
                                                        {label.cargo && (
                                                            <span className="text-xs text-gray-500 ml-1">
                                                                ({label.cargo})
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="text-gray-400 text-sm p-2">
                                                Nenhum grupo disponível. Crie grupos no Painel de Administração.
                                            </div>
                                        )}
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
            )}
        </div>
    );
};

// ReactFlowProvider é obrigatório para usar hooks internos do ReactFlow
const WorkflowEditor = () => (
    <>
        <Head title="Configurar Workflow" />
        <ReactFlowProvider>
            <WorkflowEditorInner />
        </ReactFlowProvider>
    </>
);

export default WorkflowEditor;