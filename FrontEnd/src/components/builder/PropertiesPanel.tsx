import { useForm, useFieldArray } from 'react-hook-form';
import { useFormStore } from '../../store/useFormStore';
import type { Option } from '../../types';

interface FieldFormData {
  label: string;
  name: string;
  placeholder: string;
  required: boolean;
  options: Option[];
}

export function PropertiesPanel() {
  const { selectedFieldId, updateField, getSelectedField } = useFormStore();
  const selectedField = getSelectedField();

  const { register, control, handleSubmit } = useForm<FieldFormData>({
    defaultValues: {
      label: selectedField?.label || '',
      name: selectedField?.name || '',
      placeholder: selectedField?.placeholder || '',
      required: selectedField?.required || false,
      options: selectedField?.options || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'options',
  });

  if (!selectedField) {
    return (
      <div className="w-80 bg-gray-50 border-l border-gray-200 p-4 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
          <p className="text-sm">Select a component to edit</p>
        </div>
      </div>
    );
  }

  const onSubmit = (data: FieldFormData) => {
    if (selectedFieldId) {
      updateField(selectedFieldId, {
        label: data.label,
        name: data.name,
        placeholder: data.placeholder,
        required: data.required,
        options: data.options,
      });
    }
  };

  const hasOptions = ['select', 'radio', 'checkbox'].includes(selectedField.type);

  return (
    <div className="w-80 bg-gray-50 border-l border-gray-200 overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Properties</h2>
        
        <form onChange={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Label
            </label>
            <input
              {...register('label')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Field Name
            </label>
            <input
              {...register('name')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {(selectedField.type === 'input' || selectedField.type === 'textarea' || selectedField.type === 'select') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Placeholder
              </label>
              <input
                {...register('placeholder')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          )}

          <div className="flex items-center">
            <input
              {...register('required')}
              type="checkbox"
              id="required"
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="required" className="ml-2 block text-sm text-gray-700">
              Required
            </label>
          </div>

          {hasOptions && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Options
              </label>
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-start">
                  <input
                    {...register(`options.${index}.label` as const)}
                    placeholder="Label"
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    {...register(`options.${index}.value` as const)}
                    placeholder="Value"
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="p-1 text-red-500 hover:text-red-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => append({ label: '', value: '' })}
                className="w-full py-1 px-3 border border-dashed border-gray-300 rounded text-sm text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
              >
                + Add Option
              </button>
            </div>
          )}

          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Type: <span className="font-medium capitalize">{selectedField.type}</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              ID: <span className="font-mono text-xs">{selectedField.id.slice(0, 8)}</span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
