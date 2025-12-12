import axios from 'axios';
import type { UploadResponse, ExtractResponse, ExtractRequest, DeleteResponse } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function uploadFile(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await apiClient.post<UploadResponse>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || error.message || 'Upload failed');
  }
}

export async function extractData(request: ExtractRequest): Promise<ExtractResponse> {
  try {
    const response = await apiClient.post<ExtractResponse>('/extract', request);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || error.message || 'Extraction failed');
  }
}

export async function downloadExcel(fileId: string): Promise<void> {
  try {
    const response = await apiClient.get(`/download/${fileId}`, {
      responseType: 'blob',
    });

    // Extract filename from Content-Disposition header or use default
    const contentDisposition = response.headers['content-disposition'];
    let filename = `${fileId}.xlsx`;
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }

    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || error.message || 'Failed to download Excel file');
  }
}

export async function cleanupFiles(fileId: string): Promise<DeleteResponse> {
  try {
    const response = await apiClient.delete<DeleteResponse>(`/cleanup/${fileId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || error.message || 'Failed to cleanup files');
  }
}

