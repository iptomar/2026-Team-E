import { useDraggable } from '@dnd-kit/core';
import type { ComponentConfig } from '@/types/builder';

const COMPONENTS: ComponentConfig[] = [
    { type: 'input', label: 'Text Input', icon: '📝', defaultProps: {} },
    { type: 'textarea', label: 'Text Area', icon: '📄', defaultProps: {} },
    { type: 'select', label: 'Dropdown', icon: '▼', defaultProps: {} },
    { type: 'radio', label: 'Radio Group', icon: '◉', defaultProps: {} },
    { type: 'checkbox', label: 'Checkbox', icon: '☑', defaultProps: {} },
    { type: 'label', label: 'Label', icon: '🏷', defaultProps: {} },
];

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
            className={`flex cursor-grab items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 transition-all duration-150 hover:border-indigo-300 hover:shadow-md ${isDragging ? 'scale-105 opacity-50 shadow-lg' : ''} `}
        >
            <span className="text-xl">{config.icon}</span>
            <span className="text-sm font-medium text-gray-700">
                {config.label}
            </span>
        </div>
    );
}

export function ComponentsSidebar() {
    return (
        <div className="w-64 overflow-y-auto border-r border-gray-200 bg-gray-50 p-4">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">
                Components
            </h2>
            <div className="space-y-2">
                {COMPONENTS.map((config) => (
                    <DraggableComponent key={config.type} config={config} />
                ))}
            </div>
        </div>
    );
}

export { COMPONENTS };
