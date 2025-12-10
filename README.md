# Batch Sheet Extractor UI

A modern React.js Single Page Application (SPA) for extracting structured data from batch sheet documents using OCR and LLM processing.

## Features

- 📤 **File Upload**: Upload images (JPG, PNG) or PDF documents
- 🔍 **Data Extraction**: Extract structured data using OCR and LLM
- 📊 **Multiple Previews**: View extracted fields, tables, OCR text, and JSON
- 📥 **Excel Export**: Download extracted data as Excel file
- 🎨 **Modern UI**: Built with TailwindCSS for a beautiful, responsive interface
- ⚡ **Fast**: Powered by Vite for lightning-fast development

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure API URL (optional):
   - Copy `.env.example` to `.env`
   - Update `VITE_API_BASE_URL` if your API is running on a different URL

3. Start development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

1. **Upload a Document**: Click "Choose File" and select a batch sheet image or PDF
2. **Upload**: Click "Upload File" to upload the document to the server
3. **Extract Data**: 
   - Click "Extract Data" for full OCR + LLM extraction
   - Click "OCR Only" for OCR-only mode
4. **View Results**: Switch between tabs to view:
   - **Fields**: Extracted key-value pairs
   - **Tables**: Extracted table data
   - **OCR**: Raw OCR text
   - **JSON**: Complete extracted JSON structure
5. **Download Excel**: Click "Download Excel" to get the Excel file

## API Configuration

The app connects to the Batch Sheet Extractor API. By default, it expects the API at:
- `http://localhost:8000/api`

You can change this by setting the `VITE_API_BASE_URL` environment variable.

## Project Structure

```
batchtoSheetUI/
├── src/
│   ├── components/       # React components
│   │   ├── FieldsPreview.tsx
│   │   ├── TablesPreview.tsx
│   │   ├── OCRPreview.tsx
│   │   └── JSONPreview.tsx
│   ├── api.ts           # API service functions
│   ├── types.ts         # TypeScript type definitions
│   ├── App.tsx          # Main application component
│   ├── main.tsx         # Application entry point
│   └── index.css        # Global styles with TailwindCSS
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## Technologies

- **React 18**: UI library
- **TypeScript**: Type safety
- **TailwindCSS**: Styling
- **Vite**: Build tool and dev server

## License

MIT

