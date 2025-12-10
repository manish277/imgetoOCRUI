import type { Table } from '../types';

interface TablesPreviewProps {
  tables: Table[] | null | undefined;
}

export function TablesPreview({ tables }: TablesPreviewProps) {
  if (!tables || tables.length === 0) {
    return (
      <div className="text-gray-500 text-center py-8">
        No tables extracted
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {tables.map((table, idx) => (
        <div key={idx} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            {table.name || `Table ${idx + 1}`}
          </h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {table.headers.map((header, hIdx) => (
                    <th
                      key={hIdx}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {table.rows.map((row, rIdx) => (
                  <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    {row.map((cell, cIdx) => (
                      <td
                        key={cIdx}
                        className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap"
                      >
                        {cell || <span className="text-gray-400">—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

