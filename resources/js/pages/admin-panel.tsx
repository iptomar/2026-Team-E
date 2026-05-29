import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import {
    Plus,
    Trash2,
    Edit2,
    ChevronDown,
    ChevronUp,
    Users,
    Building2,
    Shield,
} from 'lucide-react';

interface Department {
    id: number;
    name: string;
    description: string | null;
    users_count?: number;
}

interface Label {
    id: number;
    name: string;
    access_level: 'administrador' | 'validador' | 'utilizador';
    department_id: number | null;
    cargo: string | null;
    description: string | null;
    users_count?: number;
}

interface User {
    id: number;
    name: string;
    email: string;
    department_id: number | null;
    cargo: string | null;
    department?: Department;
    labels?: Label[];
}

export default function AdminPanel() {
    const [activeTab, setActiveTab] = useState<'departments' | 'labels' | 'users'>('departments');
    const [departments, setDepartments] = useState<Department[]>([]);
    const [labels, setLabels] = useState<Label[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedDept, setExpandedDept] = useState<number | null>(null);
    const [showDeptForm, setShowDeptForm] = useState(false);
    const [showLabelForm, setShowLabelForm] = useState(false);
    const [newDept, setNewDept] = useState({ name: '', description: '' });
    const [newLabel, setNewLabel] = useState({
        name: '',
        access_level: 'utilizador' as const,
        department_id: '',
        cargo: '',
        description: '',
    });

    // Carregar dados
    useEffect(() => {
        Promise.all([
            fetch('/api/departments').then(r => r.json()),
            fetch('/api/roles').then(r => r.json()),
            fetch('/api/users-management').then(r => r.json()),
        ])
            .then(([depts, lbls, usrs]) => {
                setDepartments(depts);
                setLabels(lbls);
                setUsers(usrs);
            })
            .catch(err => console.error('Erro ao carregar dados:', err))
            .finally(() => setLoading(false));
    }, []);

    const handleCreateDepartment = async () => {
        if (!newDept.name.trim()) return;

        try {
            const response = await fetch('/api/departments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newDept),
            });

            if (response.ok) {
                const data = await response.json();
                setDepartments([...departments, data.data]);
                setNewDept({ name: '', description: '' });
                setShowDeptForm(false);
            }
        } catch (error) {
            console.error('Erro ao criar departamento:', error);
        }
    };

    const handleCreateLabel = async () => {
        if (!newLabel.name.trim()) return;

        try {
            const payload = {
                name: newLabel.name,
                access_level: newLabel.access_level,
                department_id: newLabel.department_id ? parseInt(newLabel.department_id) : null,
                cargo: newLabel.cargo || null,
                description: newLabel.description || null,
            };

            const response = await fetch('/api/roles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const data = await response.json();
                setLabels([...labels, data.data]);
                setNewLabel({
                    name: '',
                    access_level: 'utilizador',
                    department_id: '',
                    cargo: '',
                    description: '',
                });
                setShowLabelForm(false);
            }
        } catch (error) {
            console.error('Erro ao criar label:', error);
        }
    };

    const handleDeleteDepartment = async (id: number) => {
        if (!window.confirm('Tem a certeza que deseja eliminar este departamento?')) return;

        try {
            const response = await fetch(`/api/departments/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setDepartments(departments.filter(d => d.id !== id));
            }
        } catch (error) {
            console.error('Erro ao eliminar departamento:', error);
        }
    };

    const handleDeleteLabel = async (id: number) => {
        if (!window.confirm('Tem a certeza que deseja eliminar este grupo?')) return;

        try {
            const response = await fetch(`/api/roles/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setLabels(labels.filter(l => l.id !== id));
            }
        } catch (error) {
            console.error('Erro ao eliminar label:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-gray-500">Carregando...</div>
            </div>
        );
    }

    return (
        <>
            <Head title="Painel de Administração" />
            <div className="min-h-screen bg-gray-100">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Painel de Administração</h1>
                        <p className="text-gray-600 mt-2">Gerir departamentos, grupos/labels e utilizadores</p>
                    </div>

                    {/* Abas */}
                    <div className="flex gap-4 mb-6 border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('departments')}
                            className={`flex items-center gap-2 px-4 py-2 font-medium border-b-2 transition ${
                                activeTab === 'departments'
                                    ? 'border-indigo-600 text-indigo-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <Building2 size={20} />
                            Departamentos
                        </button>
                        <button
                            onClick={() => setActiveTab('labels')}
                            className={`flex items-center gap-2 px-4 py-2 font-medium border-b-2 transition ${
                                activeTab === 'labels'
                                    ? 'border-indigo-600 text-indigo-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <Shield size={20} />
                            Grupos/Labels
                        </button>
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`flex items-center gap-2 px-4 py-2 font-medium border-b-2 transition ${
                                activeTab === 'users'
                                    ? 'border-indigo-600 text-indigo-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <Users size={20} />
                            Utilizadores
                        </button>
                    </div>

                    {/* DEPARTAMENTOS */}
                    {activeTab === 'departments' && (
                        <div className="bg-white rounded-lg shadow">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-semibold">Departamentos</h2>
                                    <button
                                        onClick={() => setShowDeptForm(!showDeptForm)}
                                        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                                    >
                                        <Plus size={20} />
                                        Novo Departamento
                                    </button>
                                </div>

                                {showDeptForm && (
                                    <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                                        <div className="space-y-4">
                                            <input
                                                type="text"
                                                placeholder="Nome do departamento"
                                                value={newDept.name}
                                                onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                            />
                                            <textarea
                                                placeholder="Descrição (opcional)"
                                                value={newDept.description}
                                                onChange={(e) => setNewDept({ ...newDept, description: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                                rows={3}
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handleCreateDepartment}
                                                    className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
                                                >
                                                    Criar
                                                </button>
                                                <button
                                                    onClick={() => setShowDeptForm(false)}
                                                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    {departments.map((dept) => (
                                        <div
                                            key={dept.id}
                                            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition cursor-pointer"
                                            onClick={() =>
                                                setExpandedDept(expandedDept === dept.id ? null : dept.id)
                                            }
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-gray-900">{dept.name}</h3>
                                                    {dept.description && (
                                                        <p className="text-sm text-gray-600 mt-1">{dept.description}</p>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-sm text-gray-500">
                                                        {dept.users_count || 0} utilizador(es)
                                                    </span>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteDepartment(dept.id);
                                                        }}
                                                        className="text-red-600 hover:text-red-800 transition"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* LABELS/GRUPOS */}
                    {activeTab === 'labels' && (
                        <div className="bg-white rounded-lg shadow">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-semibold">Grupos/Labels</h2>
                                    <button
                                        onClick={() => setShowLabelForm(!showLabelForm)}
                                        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                                    >
                                        <Plus size={20} />
                                        Novo Grupo
                                    </button>
                                </div>

                                {showLabelForm && (
                                    <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                                        <div className="space-y-4">
                                            <input
                                                type="text"
                                                placeholder="Nome do grupo"
                                                value={newLabel.name}
                                                onChange={(e) => setNewLabel({ ...newLabel, name: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                            />
                                            <select
                                                value={newLabel.access_level}
                                                onChange={(e) =>
                                                    setNewLabel({
                                                        ...newLabel,
                                                        access_level: e.target.value as any,
                                                    })
                                                }
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                            >
                                                <option value="utilizador">Utilizador</option>
                                                <option value="validador">Validador</option>
                                                <option value="administrador">Administrador</option>
                                            </select>
                                            <select
                                                value={newLabel.department_id}
                                                onChange={(e) =>
                                                    setNewLabel({ ...newLabel, department_id: e.target.value })
                                                }
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                            >
                                                <option value="">-- Departamento (opcional) --</option>
                                                {departments.map((dept) => (
                                                    <option key={dept.id} value={dept.id}>
                                                        {dept.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <input
                                                type="text"
                                                placeholder="Cargo (ex: Diretor, Técnico)"
                                                value={newLabel.cargo}
                                                onChange={(e) => setNewLabel({ ...newLabel, cargo: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                            />
                                            <textarea
                                                placeholder="Descrição (opcional)"
                                                value={newLabel.description}
                                                onChange={(e) => setNewLabel({ ...newLabel, description: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                                rows={3}
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handleCreateLabel}
                                                    className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
                                                >
                                                    Criar
                                                </button>
                                                <button
                                                    onClick={() => setShowLabelForm(false)}
                                                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    {labels.map((label) => (
                                        <div
                                            key={label.id}
                                            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-semibold text-gray-900">{label.name}</h3>
                                                        <span
                                                            className={`text-xs px-2 py-1 rounded ${
                                                                label.access_level === 'administrador'
                                                                    ? 'bg-red-100 text-red-700'
                                                                    : label.access_level === 'validador'
                                                                    ? 'bg-yellow-100 text-yellow-700'
                                                                    : 'bg-green-100 text-green-700'
                                                            }`}
                                                        >
                                                            {label.access_level}
                                                        </span>
                                                    </div>
                                                    {label.cargo && (
                                                        <p className="text-sm text-gray-600 mt-1">Cargo: {label.cargo}</p>
                                                    )}
                                                    {label.description && (
                                                        <p className="text-sm text-gray-500 mt-1">{label.description}</p>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteLabel(label.id)}
                                                    className="text-red-600 hover:text-red-800 transition"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* UTILIZADORES */}
                    {activeTab === 'users' && (
                        <div className="bg-white rounded-lg shadow">
                            <div className="p-6">
                                <h2 className="text-xl font-semibold mb-6">Utilizadores</h2>

                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                                    Nome
                                                </th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                                    Email
                                                </th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                                    Departamento
                                                </th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                                    Cargo
                                                </th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                                    Grupos
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {users.map((user) => (
                                                <tr key={user.id} className="hover:bg-gray-50 transition">
                                                    <td className="px-6 py-4 text-sm text-gray-900">{user.name}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">
                                                        {user.department?.name || '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">
                                                        {user.cargo || '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">
                                                        <div className="flex flex-wrap gap-1">
                                                            {user.labels && user.labels.length > 0 ? (
                                                                user.labels.map((label) => (
                                                                    <span
                                                                        key={label.id}
                                                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700"
                                                                    >
                                                                        {label.name}
                                                                    </span>
                                                                ))
                                                            ) : (
                                                                <span className="text-gray-400">-</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

AdminPanel.layout = (page: React.ReactNode) => page;
