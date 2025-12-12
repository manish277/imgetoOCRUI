// Type definitions based on API documentation

export interface UploadResponse {
  file_id: string;
  filename: string;
  path: string;
}

export interface ExtractRequest {
  file_id: string;
  run_ocr_only?: boolean;
}

export interface Timing {
  ocr_time_ms?: number;
  llm_time_ms?: number;
  total_time_ms?: number;
}

export interface ExtractResponse {
  file_id: string;
  filename: string;
  extracted_json: ExtractedData | null;
  excel_path: string | null;
  error: string | null;
  timing: Timing | null;
}

export interface ExtractedData {
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

export interface Fields {
  company?: string;
  form_title?: string;
  page?: string;
  issue_no?: string;
  printed_date?: string;
  qr_code?: string;
  machine_no?: string;
  shift?: string;
  date?: string;
  handwritten_date?: string;
  batch_no?: string;
  material?: string;
  batch_qty?: string;
  ball_size?: string;
  unload_size?: string;
  exp_unload_time_hrs?: string;
  plate_id?: string;
  plc_current_detail?: string;
  vfd_frequency_detail?: string;
  mc_run_time_hrs?: string;
  exp_cutting_hrs?: string;
  total_cutting?: string;
  cutting_rate_hrs?: string;
  remarks?: string;
  capa_sr_no?: string;
  prod_sup?: string;
  pic?: string;
  [key: string]: any;
}

export interface Table {
  name: string;
  headers: string[];
  rows: string[][];
}

export interface Metadata {
  model: string;
  warnings: string[];
  confidence: Record<string, any>;
}

export interface OCRResult {
  text: string;
  provider: string;
  model: string;
  quality_metrics: {
    total_chars: number;
    total_lines: number;
    non_empty_lines: number;
    has_numbers: boolean;
    has_letters: boolean;
    has_special_chars: boolean;
    quality_score: number;
  };
  finish_reason?: string;
}

export interface DeleteResponse {
  file_id: string;
  deleted_files: string[];
  message: string;
}

export interface ProgressData {
  file_id: string;
  current_step: number;
  current_step_id: string;
  current_step_name: string;
  current_step_description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  progress_percent: number;
  message: string;
  error: string | null;
  steps: Array<{
    id: string;
    name: string;
    description: string;
  }>;
  timing: Record<string, number>;
  created_at: string;
  updated_at: string;
}

