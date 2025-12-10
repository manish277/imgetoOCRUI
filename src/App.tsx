import { useState, useEffect } from 'react';
import { uploadFile, extractData, downloadExcel } from './api';
import type { ExtractResponse } from './types';
import { FieldsPreview } from './components/FieldsPreview';
import { TablesPreview } from './components/TablesPreview';
import { OCRPreview } from './components/OCRPreview';
import { JSONPreview } from './components/JSONPreview';

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractResponse, setExtractResponse] = useState<ExtractResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'fields' | 'tables' | 'ocr' | 'json'>('fields');
  const [ocrOnly, setOcrOnly] = useState(false);

  // Clean up preview URL on unmount or file change
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setExtractResponse(null);
      setError(null);

      // Create preview URL for images
      if (selectedFile.type.startsWith('image/')) {
        // Revoke previous URL if exists
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
        const url = URL.createObjectURL(selectedFile);
        setPreviewUrl(url);
      } else {
        // For PDFs, clear preview URL
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
      }
    }
  };

  const handleUploadAndExtract = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      // Step 1: Upload file
      const uploadRes = await uploadFile(file);
      
      // Step 2: Automatically extract data
      const extractRes = await extractData({
        file_id: uploadRes.file_id,
        run_ocr_only: ocrOnly,
      });
      setExtractResponse(extractRes);
      
      if (extractRes.error) {
        setError(extractRes.error);
      } else {
        // Step 3: Automatically download Excel if available
        if (extractRes.file_id) {
          try {
            await downloadExcel(extractRes.file_id);
          } catch (downloadErr: any) {
            // Don't show error for download, just log it
            console.warn('Auto-download failed:', downloadErr);
          }
        }
      }
      
      // Clear preview after successful upload
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    } catch (err: any) {
      setError(err.message || 'Processing failed');
    } finally {
      setLoading(false);
    }
  };

  const handleNewUpload = () => {
    // Clear preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    
    // Reset all state
    setFile(null);
    setPreviewUrl(null);
    setExtractResponse(null);
    setError(null);
    setOcrOnly(false);
    setActiveTab('fields');
    
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Compact Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1">
            Batch Sheet Extractor
          </h1>
          <p className="text-sm text-gray-500">
            AI-powered document extraction
          </p>
        </div>

        {/* Simplified Upload Card - Only show if no results */}
        {!extractResponse && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-5 mb-4">
            {/* Upload Area */}
            <div className="relative mb-4">
              <label className="block">
                <div className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
                  file 
                    ? 'border-indigo-400 bg-indigo-50/50' 
                    : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50/30'
                }`}>
                  {!file ? (
                    <>
                      <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-sm font-medium text-gray-600">
                        <span className="text-indigo-600 font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG or PDF</p>
                    </>
                  ) : (
                    <div className="flex items-center gap-3">
                      <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-gray-900 truncate max-w-xs">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* File Preview & Process Button */}
            {file && (
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                {/* Image Preview */}
                {previewUrl && file.type.startsWith('image/') && (
                  <div className="flex-shrink-0">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-24 h-24 object-cover rounded-lg border-2 border-white shadow-md"
                    />
                  </div>
                )}
                
                {/* PDF Preview */}
                {file.type === 'application/pdf' && (
                  <div className="flex-shrink-0 w-24 h-24 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center shadow-md">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{file.name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                    <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full font-medium">
                      {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                    </span>
                  </div>
                </div>

                {/* OCR Only Checkbox */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ocrOnly}
                    onChange={(e) => setOcrOnly(e.target.checked)}
                    disabled={loading}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                  />
                  <span className="text-xs font-medium text-gray-700">OCR Only</span>
                </label>

                {/* Process Button - Upload + Extract + Download */}
                <button
                  onClick={handleUploadAndExtract}
                  disabled={loading}
                  className="flex-shrink-0 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-sm hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    'Process & Extract'
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-4 mb-4 flex items-center gap-3 shadow-sm">
            <div className="flex-shrink-0 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-red-800 font-medium text-sm">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6 mb-4 text-center">
            <div className="inline-flex flex-col items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-indigo-200 rounded-full"></div>
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
              </div>
              <p className="text-sm font-medium text-gray-700">Processing your document...</p>
            </div>
          </div>
        )}

        {/* Extract Response - Simplified */}
        {extractResponse && !extractResponse.error && extractResponse.extracted_json && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-5">
            {/* Compact Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Extraction Complete</h2>
                  {extractResponse.timing && (
                    <p className="text-xs text-gray-500">
                      Processed in {extractResponse.timing.total_time_ms?.toFixed(0)}ms
                      {extractResponse.file_id && ' • Excel downloaded'}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={handleNewUpload}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold text-sm hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                New Upload
              </button>
            </div>

            {/* Compact Tabs */}
            <div className="border-b border-gray-200 mb-4">
              <nav className="flex space-x-6">
                {['fields', 'tables', 'ocr', 'json'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`py-2 px-1 border-b-2 font-medium text-xs transition-colors ${
                      activeTab === tab
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content - Compact */}
            <div>
              {activeTab === 'fields' && (
                <FieldsPreview fields={extractResponse.extracted_json.fields} />
              )}
              {activeTab === 'tables' && (
                <TablesPreview tables={extractResponse.extracted_json.tables} />
              )}
              {activeTab === 'ocr' && (
                <OCRPreview ocrText={extractResponse.extracted_json.ocr_text || extractResponse.extracted_json.raw_text} />
              )}
              {activeTab === 'json' && (
                <JSONPreview data={extractResponse.extracted_json} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

