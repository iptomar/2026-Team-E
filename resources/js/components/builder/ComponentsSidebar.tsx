import { useDraggable } from '@dnd-kit/core';
import type { ReactNode } from 'react';
import type { FieldType } from '@/types/builder';

interface ComponentItem {
    type: FieldType;
    label: string;
    description: string;
    icon: string;
}

const COMPONENTS: ComponentItem[] = [
    {
        type: 'input',
        label: 'Text Input',
        description: 'Single line text entry',
        icon: 'input',
    },
    {
        type: 'textarea',
        label: 'Text Area',
        description: 'Multi-line text',
        icon: 'textarea',
    },
    {
        type: 'select',
        label: 'Dropdown',
        description: 'Select from options',
        icon: 'select',
    },
    {
        type: 'radio',
        label: 'Radio Group',
        description: 'Choose one option',
        icon: 'radio',
    },
    {
        type: 'checkbox',
        label: 'Checkbox',
        description: 'Multiple choices',
        icon: 'checkbox',
    },
    {
        type: 'label',
        label: 'Label',
        description: 'Heading or text',
        icon: 'label',
    },
];

const iconMap: Record<string, ReactNode> = {
    input: (
        <svg
            className="h-5 w-5 text-indigo-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h7"
            />
        </svg>
    ),
    textarea: (
        <svg
            className="h-5 w-5 text-indigo-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
            />
        </svg>
    ),
    select: (
        <svg
            className="h-5 w-5 text-indigo-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
            />
        </svg>
    ),
    radio: (
        <svg
            className="h-5 w-5 text-indigo-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <circle cx="12" cy="12" r="3" strokeWidth={2} />
            <circle
                cx="12"
                cy="12"
                r="8"
                strokeWidth={2}
                strokeDasharray="4 2"
            />
        </svg>
    ),
    checkbox: (
        <svg
            className="h-5 w-5 text-indigo-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={2} />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4"
            />
        </svg>
    ),
    label: (
        <svg
            className="h-5 w-5 text-indigo-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
        </svg>
    ),
};

function DraggableComponent({ config }: { config: ComponentItem }) {
    const { attributes, listeners, setNodeRef, isDragging, transform } =
        useDraggable({
            id: `sidebar-${config.type}`,
            data: {
                type: 'sidebar-item',
                fieldType: config.type,
            },
        });

    const style = transform
        ? {
              transform: `translate(${transform.x}px, ${transform.y}px)`,
          }
        : undefined;

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            style={style}
            className={`group flex cursor-grab items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3.5 transition-all duration-200 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-100/50 active:cursor-grabbing ${
                isDragging
                    ? 'z-50 scale-105 opacity-70 shadow-xl ring-2 ring-indigo-400'
                    : ''
            }`}
        >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 group-hover:from-indigo-100 group-hover:to-purple-100">
                {iconMap[config.icon] ?? null}
            </div>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900">
                    {config.label}
                </p>
                <p className="truncate text-xs text-gray-500">
                    {config.description}
                </p>
            </div>
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100">
                <svg
                    className="h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                    />
                </svg>
            </div>
        </div>
    );
}

export function ComponentsSidebar() {
    return (
        <div className="w-72 shrink-0 overflow-y-auto border-r border-gray-200 bg-white/50 p-5 pb-4 backdrop-blur-xl">

            <div className="px-1 pb-6">
                <div className="mb-3">
                    <p className="text-xs font-medium tracking-wide text-gray-400 uppercase">
                        Form Fields
                    </p>
                </div>

                <div className="space-y-2.5">
                    {COMPONENTS.map((config) => (
                        <DraggableComponent key={config.type} config={config} />
                    ))}
                </div>
            </div>

            <div className="mt-8 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 p-4 shadow-inner">
                <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 shadow-sm">
                        <svg
                            className="h-4 w-4 text-indigo-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-700">
                            Pro tip
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                            Select a field on the canvas to edit its properties
                            in the right panel
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}