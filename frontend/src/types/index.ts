export interface User {
  id: number;
  email: string;
  full_name: string;
  created_at: string;
}

export interface PDFDocument {
  id: number;
  filename: string;
  file_size: number;
  uploaded_at: string;
  extracted_text: string;
  user_id: number;
  textbook_structure?: string;
  textbook_data?: any;
  is_embedded?: boolean;
}

export interface PDFDocumentSummary {
  id: number;
  filename: string;
  file_size: number;
  uploaded_at: string;
  user_id: number;
  textbook_structure?: string;
  textbook_data?: any;
  is_embedded?: boolean;
}
