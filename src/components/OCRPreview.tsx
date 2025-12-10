interface OCRPreviewProps {
  ocrText: string;
}

export function OCRPreview({ ocrText }: OCRPreviewProps) {
  if (!ocrText) {
    return (
      <div className="text-gray-500 text-center py-8">
        No OCR text available
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">OCR Text Preview</h3>
      <div className="bg-gray-50 rounded-lg p-4 overflow-auto max-h-96">
        <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
          {ocrText}
        </pre>
      </div>
    </div>
  );
}

