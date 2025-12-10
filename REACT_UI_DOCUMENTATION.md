# React.js UI Documentation - Batch Sheet Extractor API

Complete documentation for building a React.js frontend for the Batch Sheet Extractor API.

## Table of Contents

1. [API Overview](#api-overview)
2. [API Endpoints](#api-endpoints)
3. [Request/Response Formats](#requestresponse-formats)
4. [Data Structures](#data-structures)
5. [Upload Functionality](#upload-functionality)
6. [Preview Features](#preview-features)
7. [Export to Excel](#export-to-excel)
8. [Complete Field Reference](#complete-field-reference)
9. [Table Structures](#table-structures)
10. [Error Handling](#error-handling)
11. [Example Implementation](#example-implementation)

---

## API Overview

**Base URL**: `http://localhost:8000/api` (or your deployed API URL)

The API provides two main endpoints:
- **POST /upload** - Upload a document file
- **POST /extract** - Extract structured data from uploaded document

---

## API Endpoints

### 1. Upload File Endpoint

**Endpoint**: `POST /api/upload`

**Description**: Uploads a document file (image or PDF) for processing.

**Content-Type**: `multipart/form-data`

**Request**:
```javascript
const formData = new FormData();
formData.append('file', file); // File object from input

const response = await fetch('http://localhost:8000/api/upload', {
  method: 'POST',
  body: formData
});
```

**Response** (200 OK):
```json
{
  "file_id": "550e8400-e29b-41d4-a716-446655440000",
  "filename": "batch_sheet.jpg",
  "path": "assets/550e8400-e29b-41d4-a716-446655440000_batch_sheet.jpg"
}
```

**Response Fields**:
- `file_id` (string): Unique identifier for the uploaded file
- `filename` (string): Original filename
- `path` (string): Server path where file is stored

**Error Responses**:
- `500 Internal Server Error`: File upload failed
  ```json
  {
    "detail": "Failed to save file: [error message]"
  }
  ```

---

### 2. Extract Data Endpoint

**Endpoint**: `POST /api/extract`

**Description**: Extracts structured data from an uploaded document using OCR and LLM.

**Content-Type**: `application/json`

**Request**:
```javascript
const requestBody = {
  file_id: "550e8400-e29b-41d4-a716-446655440000",
  run_ocr_only: false // Optional: set to true for OCR-only mode
};

const response = await fetch('http://localhost:8000/api/extract', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(requestBody)
});
```

**Request Fields**:
- `file_id` (string, required): File ID from upload response
- `run_ocr_only` (boolean, optional): If `true`, only runs OCR and returns OCR text. Default: `false`

**Response** (200 OK):
```json
{
  "file_id": "550e8400-e29b-41d4-a716-446655440000",
  "filename": "batch_sheet.jpg",
  "extracted_json": {
    "document_type": "batch_sheet",
    "fields": { /* see Fields section */ },
    "tables": [ /* see Tables section */ ],
    "entities": [ /* see Entities section */ ],
    "handwritten": [ /* see Handwritten section */ ],
    "raw_text": "Full OCR text...",
    "ocr_text": "Full OCR text...",
    "ocr_result": { /* OCR metadata */ },
    "metadata": { /* see Metadata section */ }
  },
  "excel_path": "assets/docai_550e8400-e29b-41d4-a716-446655440000.xlsx",
  "timing": {
    "ocr_time_ms": 1234.56,
    "llm_time_ms": 5678.90,
    "total_time_ms": 6913.46
  },
  "error": null
}
```

**Response Fields**:
- `file_id` (string): File identifier
- `filename` (string): Original filename
- `extracted_json` (object, optional): Extracted structured data (null if error)
- `excel_path` (string, optional): Path to generated Excel file
- `timing` (object, optional): Processing time metrics
  - `ocr_time_ms` (number): OCR processing time in milliseconds
  - `llm_time_ms` (number): LLM processing time in milliseconds
  - `total_time_ms` (number): Total processing time in milliseconds
- `error` (string, optional): Error message if processing failed

**Error Responses**:
- `404 Not Found`: File not found
  ```json
  {
    "detail": "File not found for file_id: [file_id]"
  }
  ```
- `500 Internal Server Error`: Processing failed
  ```json
  {
    "file_id": "...",
    "filename": "...",
    "error": "OCR failed: [error message]",
    "timing": { "ocr_time_ms": 1234.56 }
  }
  ```

**OCR-Only Mode Response**:
When `run_ocr_only: true`, response contains:
```json
{
  "file_id": "...",
  "filename": "...",
  "extracted_json": {
    "ocr_text": "Extracted OCR text here..."
  },
  "timing": {
    "ocr_time_ms": 1234.56,
    "total_time_ms": 1234.56
  }
}
```

---

## Request/Response Formats

### Upload Request Format

```typescript
interface UploadRequest {
  file: File; // Multipart form data
}
```

### Upload Response Format

```typescript
interface UploadResponse {
  file_id: string;
  filename: string;
  path: string;
}
```

### Extract Request Format

```typescript
interface ExtractRequest {
  file_id: string;
  run_ocr_only?: boolean; // Default: false
}
```

### Extract Response Format

```typescript
interface ExtractResponse {
  file_id: string;
  filename: string;
  extracted_json: ExtractedData | null;
  excel_path: string | null;
  error: string | null;
  timing: {
    ocr_time_ms?: number;
    llm_time_ms?: number;
    total_time_ms?: number;
  } | null;
}
```

---

## Data Structures

### ExtractedData Structure

```typescript
interface ExtractedData {
  document_type: string;
  fields: Fields;
  tables: Table[];
  entities: string[];
  handwritten: string[];
  raw_text: string;
  ocr_text: string;
  ocr_result?: OCRResult;
  metadata: Metadata;
}
```

### Fields Structure

```typescript
interface Fields {
  // Header Fields
  company?: string;
  form_title?: string;
  page?: string;
  issue_no?: string;
  printed_date?: string;
  qr_code?: string;
  
  // Machine & Batch Details
  machine_no?: string;           // M/C NO.
  shift?: string;               // SHIFT (e.g., "GEN", "C&D", "C & D")
  date?: string;                // Date (handwritten, e.g., "1/9/25")
  handwritten_date?: string;    // Alternative date field
  batch_no?: string;            // BATCH NO. (e.g., "SH-1663/16")
  material?: string;            // MATERIAL (e.g., "SAE-1010")
  batch_qty?: string;           // BATCH QTY. (e.g., "61,937")
  ball_size?: string;          // BALL SIZE (e.g., "7.13mm")
  unload_size?: string;         // UNLOAD SIZE (e.g., "7.145mm")
  exp_unload_time_hrs?: string; // EXP. UNLOAD TIME (Hrs.)
  plate_id?: string;            // PLATE I.D.
  
  // Process Control Parameters
  plc_current_detail?: string;      // PLC CURRENT DETAIL (AMP)
  vfd_frequency_detail?: string;     // VFD FREQUENCY DETAIL
  
  // Additional Information
  mc_run_time_hrs?: string;     // M/C RUN TIME (Hrs.)
  exp_cutting_hrs?: string;     // EXP. CUTTING/Hrs.
  total_cutting?: string;       // TOTAL CUTTING
  cutting_rate_hrs?: string;    // CUTTING RATE/Hrs.
  remarks?: string;             // REMARKS
  capa_sr_no?: string;         // CAPA Sr. No.
  prod_sup?: string;           // Prod. Sup.
  pic?: string;                // PIC
  
  // Additional fields (may vary)
  [key: string]: any;
}
```

### Table Structure

```typescript
interface Table {
  name: string;              // Table name (e.g., "LAPPING BALL SIZE")
  headers: string[];         // Column headers
  rows: string[][];          // Array of rows, each row is array of cell values
}
```

**Example Table**:
```json
{
  "name": "LAPPING BALL SIZE",
  "headers": [
    "TIME",
    "BALL SIZE MIN.",
    "BALL SIZE MAX.",
    "VERIATION",
    "OVALITY",
    "SURFACE",
    "BALL MIXUP",
    "PLC CURRENT DETAIL",
    "VFD VALUE",
    "OPR. SIG."
  ],
  "rows": [
    ["11:00", "7.248", "7.266", "0.018", "0.009", "Rough", "✓", "NA", "", ""],
    ["12:00", "7.245", "7.260", "0.015", "0.007", "Rough", "✓", "NA", "", ""]
  ]
}
```

**Canonical Tables** (for batch_sheet documents):
1. **LAPPING BALL SIZE** (10 columns)
   - Headers: TIME, BALL SIZE MIN., BALL SIZE MAX., VERIATION, OVALITY, SURFACE, BALL MIXUP, PLC CURRENT DETAIL, VFD VALUE, OPR. SIG.

2. **Controller of Variation & Ovality** (6 columns)
   - Headers: TIME, BALL SIZE MIN., BALL SIZE MAX., VERIATION, OVALITY, Q.I./SUP / PIC

### Entities Structure

```typescript
type Entities = string[];
```

**Example**:
```json
[
  "1/9/25",
  "SH-1663/16",
  "11:00",
  "7.248",
  "7.266",
  "0.018",
  "0.015",
  "0.009",
  "0.007",
  "Rough",
  "✓",
  "NA",
  "819"
]
```

### Handwritten Structure

```typescript
type Handwritten = string[];
```

**Example**:
```json
[
  "GEN",
  "1/9/25",
  "FAG-06",
  "SH-1663/16",
  "61,937",
  "7.145mm",
  "✓",
  "NA",
  "819",
  "साई सती का उतर",
  "2"
]
```

### Metadata Structure

```typescript
interface Metadata {
  model: string;              // Model used (e.g., "qwen2.5-vl")
  warnings: string[];        // Array of warning messages
  confidence: Record<string, any>; // Confidence scores (if available)
}
```

### OCRResult Structure

```typescript
interface OCRResult {
  text: string;
  provider: string;           // "huggingface"
  model: string;              // OCR model name
  quality_metrics: {
    total_chars: number;
    total_lines: number;
    non_empty_lines: number;
    has_numbers: boolean;
    has_letters: boolean;
    has_special_chars: boolean;
    quality_score: number;     // 0-100
  };
  finish_reason?: string;     // "length" if truncated
}
```

---

## Upload Functionality

### File Upload Implementation

```typescript
async function uploadFile(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('http://localhost:8000/api/upload', {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Upload failed');
  }
  
  return await response.json();
}
```

### Supported File Types

- **Images**: `.jpg`, `.jpeg`, `.png`
- **Documents**: `.pdf` (multi-page supported)

### File Size Considerations

- Images are automatically compressed if they exceed:
  - Max dimension: 2048px (width or height)
  - Max file size: 5MB
- Large files may take longer to process

---

## Preview Features

### 1. OCR Text Preview

Display the raw OCR text extracted from the document:

```typescript
function OCRPreview({ ocrText }: { ocrText: string }) {
  return (
    <div className="ocr-preview">
      <h3>OCR Text Preview</h3>
      <pre>{ocrText}</pre>
    </div>
  );
}
```

**Access**: `extracted_json.ocr_text` or `extracted_json.raw_text`

### 2. JSON Preview

Display the complete extracted JSON structure:

```typescript
function JSONPreview({ data }: { data: ExtractedData }) {
  return (
    <div className="json-preview">
      <h3>Extracted JSON</h3>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
```

**Access**: `extracted_json` from extract response

### 3. Response Preview

Display the complete API response:

```typescript
function ResponsePreview({ response }: { response: ExtractResponse }) {
  return (
    <div className="response-preview">
      <h3>API Response</h3>
      <div>
        <strong>File ID:</strong> {response.file_id}<br/>
        <strong>Filename:</strong> {response.filename}<br/>
        <strong>Processing Time:</strong> {response.timing?.total_time_ms}ms<br/>
        {response.error && <div className="error">{response.error}</div>}
      </div>
      <pre>{JSON.stringify(response, null, 2)}</pre>
    </div>
  );
}
```

### 4. Fields Preview

Display extracted fields in a formatted view:

```typescript
function FieldsPreview({ fields }: { fields: Fields }) {
  return (
    <div className="fields-preview">
      <h3>Extracted Fields</h3>
      <div className="field-grid">
        {Object.entries(fields).map(([key, value]) => (
          <div key={key} className="field-item">
            <strong>{key}:</strong> {value || '(empty)'}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 5. Tables Preview

Display extracted tables:

```typescript
function TablesPreview({ tables }: { tables: Table[] }) {
  return (
    <div className="tables-preview">
      <h3>Extracted Tables</h3>
      {tables.map((table, idx) => (
        <div key={idx} className="table-container">
          <h4>{table.name || `Table ${idx + 1}`}</h4>
          <table>
            <thead>
              <tr>
                {table.headers.map((header, hIdx) => (
                  <th key={hIdx}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, rIdx) => (
                <tr key={rIdx}>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx}>{cell || ''}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
```

### 6. Batch Sheet Format Preview

Display data in batch sheet format matching the original form:

```typescript
function BatchSheetPreview({ data }: { data: ExtractedData }) {
  const { fields, tables } = data;
  
  return (
    <div className="batch-sheet-preview">
      {/* Main Header */}
      <div className="header-section">
        <h1>{fields.company || 'DSP PRECISION PRODUCTS PVT. LTD.'}</h1>
        <h2>{fields.form_title || 'LAPPING MACHINE - PROCESS CONTROL (SFL)'}</h2>
        <div className="header-row">
          <span>Page: {fields.page}</span>
          <span>Issue No.: {fields.issue_no}</span>
          <span>Date: {fields.printed_date}</span>
          <span>QR Code: {fields.qr_code}</span>
        </div>
      </div>
      
      {/* Machine & Batch Details */}
      <div className="details-section">
        <div className="detail-row">
          <span>M/C NO.: {fields.machine_no}</span>
          <span>SHIFT: {fields.shift}</span>
          <span>Date: {fields.date || fields.handwritten_date}</span>
        </div>
        <div className="detail-row">
          <span>BATCH NO.: {fields.batch_no}</span>
          <span>MATERIAL: {fields.material}</span>
          <span>BATCH QTY.: {fields.batch_qty}</span>
        </div>
        {/* ... more detail rows ... */}
      </div>
      
      {/* Tables */}
      {tables.map((table, idx) => (
        <TablesPreview key={idx} tables={[table]} />
      ))}
      
      {/* Additional Information */}
      <div className="additional-section">
        {/* ... additional fields ... */}
      </div>
    </div>
  );
}
```

---

## Export to Excel

### Download Excel File

The API generates an Excel file automatically. To download it:

```typescript
async function downloadExcel(excelPath: string, filename: string) {
  // Option 1: Direct download from server path
  const response = await fetch(`http://localhost:8000/${excelPath}`);
  const blob = await response.blob();
  
  // Create download link
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'batch_sheet.xlsx';
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
```

### Excel File Structure

The Excel file follows the batch sheet format:
1. **Main Header**: Company name and form title (merged cells)
2. **Header Row**: Page, Issue No., Date, QR Code
3. **Machine & Batch Details**: Grid layout with labels and values
4. **Process Control Parameters**: PLC and VFD details (if present)
5. **Tables**: Two tables side-by-side (if both present) or single table
6. **Additional Information**: Bottom section with remaining fields

### Excel File Naming

- Pattern: `docai_{file_id}.xlsx`
- Example: `docai_550e8400-e29b-41d4-a716-446655440000.xlsx`

---

## Complete Field Reference

### All Possible Fields

| Field Name | Label | Type | Example | Notes |
|------------|-------|------|---------|-------|
| `company` | Company Name | string | "DSP PRECISION PRODUCTS PVT. LTD." | Main header |
| `form_title` | Form Title | string | "LAPPING MACHINE - PROCESS CONTROL (SFL)" | Document title |
| `page` | Page | string | "I", "20" | Page number |
| `issue_no` | Issue No. | string | "2.0" | Issue number |
| `printed_date` | Date | string | "1/9/25" | Printed date |
| `qr_code` | QR Code | string | "QR-7E21" | QR code value |
| `machine_no` | M/C NO. | string | "FAG-06" | Machine number (preserve exact format) |
| `shift` | SHIFT | string | "GEN", "C&D", "C & D" | Shift value (extract exactly as written) |
| `date` | Date | string | "1/9/25" | Handwritten date (preserve exact format) |
| `handwritten_date` | Date (alt) | string | "1/9/25" | Alternative date field |
| `batch_no` | BATCH NO. | string | "SH-1663/16" | Batch number |
| `material` | MATERIAL | string | "SAE-1010" | Material type |
| `batch_qty` | BATCH QTY. | string | "61,937" | Batch quantity (preserve commas) |
| `ball_size` | BALL SIZE | string | "7.13mm" | Ball size (no space before mm) |
| `unload_size` | UNLOAD SIZE | string | "7.145mm" | Unload size (no space before mm) |
| `exp_unload_time_hrs` | EXP. UNLOAD TIME (Hrs.) | string | "2" | Expected unload time |
| `plate_id` | PLATE I.D. | string | "PL-123" | Plate identifier |
| `plc_current_detail` | PLC CURRENT DETAIL (AMP) | string | "Full instruction text..." | Process control detail |
| `vfd_frequency_detail` | VFD FREQUENCY DETAIL | string | "Full instruction text..." | VFD frequency detail |
| `mc_run_time_hrs` | M/C RUN TIME (Hrs.) | string | "8" | Machine run time |
| `exp_cutting_hrs` | EXP. CUTTING/Hrs. | string | "10" | Expected cutting per hour |
| `total_cutting` | TOTAL CUTTING | string | "80" | Total cutting |
| `cutting_rate_hrs` | CUTTING RATE/Hrs. | string | "10" | Cutting rate per hour |
| `remarks` | REMARKS | string | "Any remarks text" | Remarks field |
| `capa_sr_no` | CAPA Sr. No. | string | "123" | CAPA serial number |
| `prod_sup` | Prod. Sup. | string | "Name" | Production supervisor |
| `pic` | PIC | string | "Name" | Person in charge |

### Field Value Formatting Rules

1. **Exact Extraction**: Extract values exactly as written in OCR text
2. **Spacing**: Preserve exact spacing (e.g., "FAG-06" not "FAG - 06")
3. **Dates**: Preserve format (e.g., "1/9/25" not "01/09/2025")
4. **Numbers**: Preserve precision (e.g., "7.248" not "7.25")
5. **Units**: No space before units (e.g., "7.13mm" not "7.13 mm")
6. **Special Characters**: Preserve exactly (e.g., "C&D" or "C & D" as written)

---

## Table Structures

### Table 1: LAPPING BALL SIZE

**Headers** (10 columns):
1. TIME
2. BALL SIZE MIN.
3. BALL SIZE MAX.
4. VERIATION
5. OVALITY
6. SURFACE
7. BALL MIXUP
8. PLC CURRENT DETAIL
9. VFD VALUE
10. OPR. SIG.

**Example Row**:
```json
["11:00", "7.248", "7.266", "0.018", "0.009", "Rough", "✓", "NA", "", ""]
```

### Table 2: Controller of Variation & Ovality

**Headers** (6 columns):
1. TIME
2. BALL SIZE MIN.
3. BALL SIZE MAX.
4. VERIATION
5. OVALITY
6. Q.I./SUP / PIC

**Example Row**:
```json
["11:00", "7.248", "7.266", "0.018", "0.009", "819"]
```

### Table Data Formatting Rules

1. **Time Format**: Preserve exactly (e.g., "11:00", "2:00" not "02:00")
2. **Numeric Precision**: Preserve all decimals (e.g., "7.248" not "7.25")
3. **Text Values**: Preserve case (e.g., "Rough" not "rough")
4. **Checkmarks**: Preserve symbols (e.g., "✓", "OK", "checkmark")
5. **Empty Cells**: Use empty string `""`

---

## Error Handling

### Common Errors

1. **File Not Found (404)**
   ```json
   {
     "detail": "File not found for file_id: [file_id]"
   }
   ```

2. **Upload Failed (500)**
   ```json
   {
     "detail": "Failed to save file: [error message]"
   }
   ```

3. **OCR Failed**
   ```json
   {
     "file_id": "...",
     "filename": "...",
     "error": "OCR failed: [error message]",
     "timing": { "ocr_time_ms": 1234.56 }
   }
   ```

4. **LLM Extraction Failed**
   ```json
   {
     "file_id": "...",
     "filename": "...",
     "error": "LLM extraction failed: [error message]",
     "timing": { "ocr_time_ms": 1234.56, "llm_time_ms": 5678.90 }
   }
   ```

5. **JSON Parse Error**
   ```json
   {
     "file_id": "...",
     "filename": "...",
     "error": "Failed to parse LLM response as JSON: [error message]",
     "timing": { "ocr_time_ms": 1234.56, "llm_time_ms": 5678.90 }
   }
   ```

6. **Validation Failed**
   ```json
   {
     "file_id": "...",
     "filename": "...",
     "error": "Validation failed: [error message]",
     "timing": { "ocr_time_ms": 1234.56, "llm_time_ms": 5678.90 }
   }
   ```

7. **Excel Export Failed**
   ```json
   {
     "file_id": "...",
     "filename": "...",
     "error": "Excel export failed: [error message]",
     "timing": { "ocr_time_ms": 1234.56, "llm_time_ms": 5678.90 }
   }
   ```

### Error Handling Implementation

```typescript
async function handleExtract(fileId: string, runOcrOnly: boolean = false) {
  try {
    const response = await fetch('http://localhost:8000/api/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file_id: fileId, run_ocr_only: runOcrOnly })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.detail || 'Extraction failed');
    }
    
    if (data.error) {
      // Handle processing error
      console.error('Processing error:', data.error);
      return { error: data.error, data: null };
    }
    
    return { error: null, data };
  } catch (error) {
    console.error('Request failed:', error);
    return { error: error.message, data: null };
  }
}
```

---

## Example Implementation

### Complete React Component Example

```typescript
import React, { useState } from 'react';

interface UploadResponse {
  file_id: string;
  filename: string;
  path: string;
}

interface ExtractResponse {
  file_id: string;
  filename: string;
  extracted_json: any | null;
  excel_path: string | null;
  error: string | null;
  timing: {
    ocr_time_ms?: number;
    llm_time_ms?: number;
    total_time_ms?: number;
  } | null;
}

const API_BASE_URL = 'http://localhost:8000/api';

function BatchSheetExtractor() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadResponse, setUploadResponse] = useState<UploadResponse | null>(null);
  const [extractResponse, setExtractResponse] = useState<ExtractResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadResponse(null);
      setExtractResponse(null);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }

      const data: UploadResponse = await response.json();
      setUploadResponse(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExtract = async (runOcrOnly: boolean = false) => {
    if (!uploadResponse) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/extract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_id: uploadResponse.file_id,
          run_ocr_only: runOcrOnly
        })
      });

      const data: ExtractResponse = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setExtractResponse(data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadExcel = async () => {
    if (!extractResponse?.excel_path) return;

    try {
      const response = await fetch(`http://localhost:8000/${extractResponse.excel_path}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `batch_sheet_${extractResponse.file_id}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(`Download failed: ${err.message}`);
    }
  };

  return (
    <div className="batch-sheet-extractor">
      <h1>Batch Sheet Extractor</h1>

      {/* File Upload */}
      <div className="upload-section">
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          onChange={handleFileChange}
        />
        <button onClick={handleUpload} disabled={!file || loading}>
          Upload File
        </button>
      </div>

      {/* Upload Response */}
      {uploadResponse && (
        <div className="upload-response">
          <p>File uploaded: {uploadResponse.filename}</p>
          <p>File ID: {uploadResponse.file_id}</p>
          <button onClick={() => handleExtract(false)} disabled={loading}>
            Extract Data
          </button>
          <button onClick={() => handleExtract(true)} disabled={loading}>
            OCR Only
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && <div>Processing...</div>}

      {/* Error Display */}
      {error && <div className="error">{error}</div>}

      {/* Extract Response */}
      {extractResponse && !extractResponse.error && (
        <div className="extract-response">
          <h2>Extraction Results</h2>
          
          {/* Timing Info */}
          {extractResponse.timing && (
            <div className="timing">
              <p>OCR Time: {extractResponse.timing.ocr_time_ms}ms</p>
              {extractResponse.timing.llm_time_ms && (
                <p>LLM Time: {extractResponse.timing.llm_time_ms}ms</p>
              )}
              <p>Total Time: {extractResponse.timing.total_time_ms}ms</p>
            </div>
          )}

          {/* Download Excel */}
          {extractResponse.excel_path && (
            <button onClick={downloadExcel}>
              Download Excel File
            </button>
          )}

          {/* Extracted Data */}
          {extractResponse.extracted_json && (
            <div className="extracted-data">
              {/* Fields Preview */}
              <div className="fields-preview">
                <h3>Fields</h3>
                <pre>{JSON.stringify(extractResponse.extracted_json.fields, null, 2)}</pre>
              </div>

              {/* Tables Preview */}
              <div className="tables-preview">
                <h3>Tables</h3>
                {extractResponse.extracted_json.tables?.map((table: any, idx: number) => (
                  <div key={idx}>
                    <h4>{table.name}</h4>
                    <table>
                      <thead>
                        <tr>
                          {table.headers.map((h: string, i: number) => (
                            <th key={i}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {table.rows.map((row: string[], r: number) => (
                          <tr key={r}>
                            {row.map((cell: string, c: number) => (
                              <td key={c}>{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>

              {/* OCR Text Preview */}
              {extractResponse.extracted_json.ocr_text && (
                <div className="ocr-preview">
                  <h3>OCR Text</h3>
                  <pre>{extractResponse.extracted_json.ocr_text}</pre>
                </div>
              )}

              {/* JSON Preview */}
              <div className="json-preview">
                <h3>Complete JSON</h3>
                <pre>{JSON.stringify(extractResponse.extracted_json, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default BatchSheetExtractor;
```

---

## Key-Value Pairs Summary

### Complete Key-Value Reference

**Response Keys**:
- `file_id` - Unique file identifier
- `filename` - Original filename
- `extracted_json` - Main data object
- `excel_path` - Path to Excel file
- `error` - Error message (if any)
- `timing` - Processing time metrics

**Extracted JSON Keys**:
- `document_type` - Type of document (e.g., "batch_sheet")
- `fields` - Object containing all extracted fields
- `tables` - Array of table objects
- `entities` - Array of extracted entity strings
- `handwritten` - Array of handwritten text strings
- `raw_text` - Raw OCR text
- `ocr_text` - OCR text (duplicate of raw_text)
- `ocr_result` - OCR metadata object
- `metadata` - Metadata object with model info and warnings

**Fields Object Keys** (see Complete Field Reference section)

**Table Object Keys**:
- `name` - Table name
- `headers` - Array of column headers
- `rows` - Array of row arrays

**Metadata Object Keys**:
- `model` - Model name used
- `warnings` - Array of warning messages
- `confidence` - Confidence scores object

**Timing Object Keys**:
- `ocr_time_ms` - OCR processing time
- `llm_time_ms` - LLM processing time
- `total_time_ms` - Total processing time

---

## Additional Notes

1. **API Base URL**: Configure based on your deployment (default: `http://localhost:8000/api`)

2. **CORS**: Ensure CORS is configured on the backend if accessing from a different origin

3. **File Size Limits**: Large files may take longer to process; consider showing progress indicators

4. **Retry Logic**: Consider implementing retry logic for failed requests

5. **State Management**: For complex UIs, consider using state management libraries (Redux, Zustand, etc.)

6. **TypeScript**: Full TypeScript types are provided for type safety

7. **Error Boundaries**: Implement React error boundaries for better error handling

8. **Loading States**: Show appropriate loading indicators during processing

9. **Responsive Design**: Ensure UI works on mobile and desktop

10. **Accessibility**: Follow WCAG guidelines for accessibility

---

## Quick Reference

### API Endpoints
- `POST /api/upload` - Upload file
- `POST /api/extract` - Extract data

### Required Request Fields
- Upload: `file` (multipart/form-data)
- Extract: `file_id` (string)

### Response Status Codes
- `200` - Success
- `404` - File not found
- `500` - Server error

### Processing Flow
1. Upload file → Get `file_id`
2. Extract data → Get `extracted_json` and `excel_path`
3. Display previews → Show fields, tables, OCR text, JSON
4. Download Excel → Use `excel_path` to download file

---

**End of Documentation**
