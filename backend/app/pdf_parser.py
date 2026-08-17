import io
import pypdf

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Extracts text content from PDF file bytes.
    If no text is found (e.g., scanned document), returns a user-friendly fallback notice.
    """
    try:
        pdf_file = io.BytesIO(file_bytes)
        reader = pypdf.PdfReader(pdf_file)
        text_content = []
        
        for i, page in enumerate(reader.pages):
            text = page.extract_text()
            if text:
                text_content.append(text)
                
        extracted = "\n\n--- Page {} ---\n\n".join(text_content)
        # Apply the layout or clean content joining
        cleaned_text = ""
        for index, text in enumerate(text_content):
            page_header = f"--- Page {index + 1} ---\n"
            cleaned_text += page_header + text + "\n\n"
            
        cleaned_text = cleaned_text.strip()
        
        if not cleaned_text:
            return "[No readable text detected in this PDF. It may contain scanned images, or represent a non-searchable document layout.]"
            
        return cleaned_text
    except Exception as e:
        raise ValueError(f"Failed to process PDF document: {str(e)}")
