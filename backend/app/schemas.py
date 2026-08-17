from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# PDF Document Schemas
class PDFDocumentBase(BaseModel):
    filename: str
    file_size: int

class PDFDocumentCreate(PDFDocumentBase):
    extracted_text: str

class PDFDocumentResponse(PDFDocumentBase):
    id: int
    user_id: int
    uploaded_at: datetime
    extracted_text: str
    textbook_structure: Optional[str] = None
    textbook_data: Optional[dict] = None
    is_embedded: bool = False

    class Config:
        from_attributes = True

class PDFDocumentSummary(PDFDocumentBase):
    id: int
    user_id: int
    uploaded_at: datetime
    textbook_structure: Optional[str] = None
    textbook_data: Optional[dict] = None
    is_embedded: bool = False
    # We omit extracted_text for bulk listing to save bandwidth
    
    class Config:
        from_attributes = True

# Semantic Search Schemas
class SemanticSearchQuery(BaseModel):
    query: str

class SemanticSearchResult(BaseModel):
    chunk_index: int
    text_content: str
    similarity: float

    class Config:
        from_attributes = True
