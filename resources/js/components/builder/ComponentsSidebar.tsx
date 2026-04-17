import { useDraggable } from '@dnd-kit/core';
import type { ReactNode } from 'react';
import type { ComponentConfig } from '@/types/builder';

const COMPONENTS: ComponentConfig[] = [
    { type: 'input', label: 'Text Input', icon: 'input', defaultProps: {} },
    {
        type: 'textarea',
        label: 'Text Area',
        icon: 'textarea',
        defaultProps: {},
    },
    { type: 'select', label: 'Dropdown', icon: 'select', defaultProps: {} },
    { type: 'radio', label: 'Radio Group', icon: 'radio', defaultProps: {} },
    { type: 'checkbox', label: 'Checkbox', icon: 'checkbox', defaultProps: {} },
    { type: 'label', label: 'Label', icon: 'label', defaultProps: {} },
];

const iconMap: Record<string, ReactNode> = {
    input: (
        <svg className="h-5 w-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
        </svg>
    ),
    textarea: (
        <svg className="h-5 w-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
    ),
    select: (
        <svg className="h-5 w-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
    ),
    radio: (
        <svg className="h-5 w-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3" strokeWidth={2} />
            <circle cx="12" cy="12" r="8" strokeWidth={2} strokeDasharray="4 2" />
        </svg>
    ),
    checkbox: (
        <svg className="h-5 w-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={2} />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
        </svg>
    ),
    label: (
        <svg className="h-5 w-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
    ),
};

function DraggableComponent({ config }: { config: ComponentConfig }) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `sidebar-${config.type}`,
        data: {
            type: 'sidebar-item',
            fieldType: config.type,
        },
    });

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={`flex cursor-grab items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 transition-all duration-200 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-100 ${
                isDragging ? 'scale-105 opacity-70 shadow-xl ring-2 ring-indigo-400' : ''
            }`}
        >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
                {iconMap[config.icon] ?? null}
            </div>
            <span className="text-sm font-medium text-gray-700">
                {config.label}
            </span>
        </div>
    );
}

export function ComponentsSidebar() {
    return (
        <div className="w-72 overflow-y-auto border-r border-gray-200 bg-white p-6">
            <h2 className="mb-6 text-xl font-bold text-gray-800">Components</h2>
            <div className="space-y-3">
                {COMPONENTS.map((config) => (
                    <DraggableComponent key={config.type} config={config} />
                ))}
            </div>
        </div>
    );
}

export { COMPONENTS };