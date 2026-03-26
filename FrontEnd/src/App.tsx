import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  rectIntersection,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { ComponentsSidebar } from './components/sidebar/ComponentsSidebar';
import { Canvas } from './components/builder/Canvas';
import { PropertiesPanel } from './components/builder/PropertiesPanel';
import { useFormStore } from './store/useFormStore';
import { renderFieldComponent } from './components/form-fields/FormFields';
import type { FormField, FieldType } from './types';

function createPreviewField(type: FieldType): FormField {
  const id = 'preview';
  return {
    id,
    type,
    label: type === 'input' ? 'Text Input' :
           type === 'textarea' ? 'Text Area' :
           type === 'select' ? 'Select Dropdown' :
           type === 'radio' ? 'Radio Group' :
           type === 'checkbox' ? 'Checkbox Group' :
           'Label',
    required: false,
    name: `preview_${type}`,
  };
}

function App() {
  const { formName, setFormName, fields, clearForm, addField, reorderFields } = useFormStore();
  const [showPreview, setShowPreview] = useState(false);
  const [activeField, setActiveField] = useState<FormField | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const fieldId = active.id as string;
    
    if (fieldId.startsWith('sidebar-')) {
      const fieldType = active.data.current?.fieldType as FieldType;
      if (fieldType) {
        setActiveField(createPreviewField(fieldType));
      }
      return;
    }
    
    const field = fields.find((f) => f.id === fieldId);
    if (field) {
      setActiveField(field);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveField(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId.startsWith('sidebar-')) {
      const fieldType = active.data.current?.fieldType;
      if (fieldType) {
        if (overId === 'canvas-drop-zone') {
          addField(fieldType);
        } else if (!overId.startsWith('sidebar-')) {
          const overIndex = fields.findIndex((f) => f.id === overId);
          addField(fieldType, overIndex >= 0 ? overIndex : undefined);
        }
      }
      return;
    }

    if (activeId !== overId && !overId.startsWith('sidebar-')) {
      reorderFields(activeId, overId);
    }
  };

  const handleExportJSON = () => {
    const data = {
      name: formName,
      fields: fields,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formName.replace(/\s+/g, '_').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearForm = () => {
    if (window.confirm('Are you sure you want to clear the form?')) {
      clearForm();
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-screen flex flex-col bg-gray-50">
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-800">Form Builder</h1>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Form name"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                showPreview
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {showPreview ? 'Edit' : 'Preview'}
            </button>
            <button
              onClick={handleExportJSON}
              className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
            >
              Export JSON
            </button>
            <button
              onClick={handleClearForm}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-md text-sm font-medium hover:bg-red-100 transition-colors"
            >
              Clear
            </button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <ComponentsSidebar />
          <Canvas />
          <PropertiesPanel />
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeField && (
          <div className="bg-white border-2 border-indigo-500 rounded-lg p-4 shadow-2xl cursor-grabbing">
            <div className="w-64">
              {renderFieldComponent(activeField)}
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

export default App;
