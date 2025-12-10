interface JSONPreviewProps {
  data: any;
}

export function JSONPreview({ data }: JSONPreviewProps) {
  if (!data) {
    return (
      <div className="text-gray-500 text-center py-8">
        No data available
      </div>
    );
  }

  // Format JSON with proper indentation
  const jsonString = JSON.stringify(data, null, 2);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Complete JSON</h3>
      <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
        <div className="overflow-auto max-h-[600px] p-4">
          <pre className="text-sm text-gray-100 whitespace-pre font-mono leading-relaxed m-0">
            <code className="text-gray-100">
              {jsonString.split('\n').map((line, index) => (
                <div key={index} className="hover:bg-gray-800/50 px-2 -mx-2 rounded transition-colors">
                  <span className="text-gray-500 select-none mr-4 inline-block w-8 text-right">
                    {index + 1}
                  </span>
                  <span className="text-gray-100">{line || ' '}</span>
                </div>
              ))}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
}

