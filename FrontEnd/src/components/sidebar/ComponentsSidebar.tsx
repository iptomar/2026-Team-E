import { useDraggable } from '@dnd-kit/core';
import type { ComponentConfig } from '../../types';

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
      className={`
        flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg cursor-grab
        hover:border-indigo-300 hover:shadow-md transition-all duration-150
        ${isDragging ? 'opacity-50 shadow-lg scale-105' : ''}
      `}
    >
      <span className="text-xl">{config.icon}</span>
      <span className="text-sm font-medium text-gray-700">{config.label}</span>
    </div>
  );
}

export function ComponentsSidebar() {
  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Components</h2>
      <div className="space-y-2">
        {COMPONENTS.map((config) => (
          <DraggableComponent key={config.type} config={config} />
        ))}
      </div>
    </div>
  );
}

export { COMPONENTS };
