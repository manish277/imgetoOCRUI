import type { Fields } from '../types';

interface FieldsPreviewProps {
  fields: Fields | null | undefined;
}

export function FieldsPreview({ fields }: FieldsPreviewProps) {
  // More robust check: ensure fields is a non-null object and not an array
  if (!fields || typeof fields !== 'object' || Array.isArray(fields)) {
    return (
      <div className="text-gray-500 text-center py-8">
        No fields extracted
      </div>
    );
  }

  // Additional safety check before Object.entries
  let fieldEntries: [string, any][] = [];
  try {
    fieldEntries = Object.entries(fields).filter(([_, value]) => value !== null && value !== undefined && value !== '');
  } catch (error) {
    return (
      <div className="text-gray-500 text-center py-8">
        No fields extracted
      </div>
    );
  }

  if (fieldEntries.length === 0) {
    return (
      <div className="text-gray-500 text-center py-8">
        No fields extracted
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Extracted Fields</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fieldEntries.map(([key, value]) => (
          <div key={key} className="border-b border-gray-100 pb-3">
            <div className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-1">
              {key.replace(/_/g, ' ')}
            </div>
            <div className="text-base text-gray-900 font-medium">
              {String(value) || <span className="text-gray-400 italic">(empty)</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

