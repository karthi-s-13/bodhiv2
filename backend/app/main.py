import os
from contextlib import asynccontextmanager
from typing import List
import httpx
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from .database import engine, Base, get_db, apply_schema_updates
from .models import User, PDFDocument, Assessment, LessonPresentation
from .schemas import UserCreate, UserResponse, Token, PDFDocumentResponse, PDFDocumentSummary, SemanticSearchQuery, SemanticSearchResult, AssessmentCreate, AssessmentResponse, PresentationCreate, PresentationResponse
from .auth import hash_password, verify_password, create_access_token, get_current_user
from .pdf_parser import extract_text_from_pdf

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure tables exist
    try:
        Base.metadata.create_all(bind=engine)
        print("Database tables initialized successfully.")
        apply_schema_updates()
    except Exception as e:
        print("\n" + "="*80)
        print("DATABASE CONNECTION WARNING: Could not connect to PostgreSQL during startup.")
        print(f"Error: {e}")
        print("Please check database status and update credentials in backend/.env if needed.")
        print("="*80 + "\n")
    yield

app = FastAPI(
    title="Teacher PDF Portal API",
    description="Backend service for Teacher login, registration, and PDF text extraction.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
# React frontend runs on port 5173 by default in Vite
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In development, allow all. Or specify ["http://localhost:5173", "http://127.0.0.1:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Authentication Endpoints ---

@app.post("/api/auth/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_teacher(user_in: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )
    
    # Hash password and store teacher account
    hashed_pwd = hash_password(user_in.password)
    db_user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=hashed_pwd
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/api/auth/login", response_model=Token)
def login_teacher(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Look up user by email
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Generate token
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/auth/me", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user


# --- PDF Document Endpoints ---

@app.post("/api/documents/upload", response_model=PDFDocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify file format
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only PDF documents are supported."
        )
        
    try:
        # Read contents
        contents = await file.read()
        file_size = len(contents)
        
        # Extract text from the PDF binary
        extracted_text = extract_text_from_pdf(contents)
        
        # Save to database
        db_doc = PDFDocument(
            user_id=current_user.id,
            filename=file.filename,
            file_size=file_size,
            extracted_text=extracted_text
        )
        db.add(db_doc)
        db.commit()
        db.refresh(db_doc)
        
        # Trigger background task to embed the document chunks
        background_tasks.add_task(embed_document_task, db_doc.id)
        
        return db_doc
        
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(val_err)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during file upload: {str(e)}"
        )

@app.get("/api/documents/", response_model=List[PDFDocumentSummary])
def list_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Return documents belonging to logged-in teacher only
    docs = db.query(PDFDocument).filter(PDFDocument.user_id == current_user.id).order_by(PDFDocument.uploaded_at.desc()).all()
    return docs

@app.get("/api/documents/{doc_id}", response_model=PDFDocumentResponse)
def get_document(
    doc_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc = db.query(PDFDocument).filter(PDFDocument.id == doc_id, PDFDocument.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found or you do not have permission to view it."
        )
    return doc

@app.delete("/api/documents/{doc_id}", status_code=status.HTTP_200_OK)
def delete_document(
    doc_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc = db.query(PDFDocument).filter(PDFDocument.id == doc_id, PDFDocument.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found or you do not have permission to delete it."
        )
    db.delete(doc)
    db.commit()
    return {"status": "deleted", "id": doc_id}


@app.post("/api/documents/{doc_id}/generate-textbook", response_model=PDFDocumentResponse)
async def generate_textbook_structure(
    doc_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Retrieve the document
    doc = db.query(PDFDocument).filter(PDFDocument.id == doc_id, PDFDocument.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found or you do not have permission to view it."
        )

    # Check configuration
    api_key = os.getenv("OPENROUTER_API_KEY")
    model = os.getenv("OPENROUTER_MODEL", "nvidia/nemotron-3-ultra-550b-a55b:free")

    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="OpenRouter API Key is not configured. Please add OPENROUTER_API_KEY to your backend/.env file."
        )

    # Truncate text content if extremely large to avoid timeout
    text_content = doc.extracted_text
    if len(text_content) > 100000:
        text_content = text_content[:100000] + "\n... [text truncated for textbook outline generation] ..."

    # Construct the prompt
    system_prompt = (
        "You are a helpful assistant specialized in educational content organization.\n"
        "Your task is to analyze the provided textbook, document, or syllabus text and structure its contents "
        "into a clean, logical textbook chapter outline tree using unicode branch characters.\n"
        "Please use the following format style:\n"
        "│\n"
        "├── Chapter 1: Matter\n"
        "│   ├── 1.1 Physical Nature of Matter\n"
        "│   └── 1.2 States of Matter\n"
        "│\n"
        "├── Chapter 2: Motion\n"
        "│   ├── 2.1 Speed\n"
        "│   └── 2.2 Velocity\n"
        "\n"
        "Strict Guidelines:\n"
        "1. Do NOT include any preamble, introduction, markdown descriptions, explanations, code blocks, or conversational responses.\n"
        "2. Return ONLY the ASCII/Unicode outline structure showing the chapters and sections.\n"
        "3. Match the main topics of the text provided."
    )

    user_prompt = f"Analyze this text and generate the textbook structure:\n\n{text_content}"

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://localhost:8000",
                "X-Title": "Teacher PDF Portal (Bodhi v2)",
            }
            payload = {
                "model": model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                "temperature": 0.3
            }
            
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                json=payload
            )

            if response.status_code != 200:
                error_msg = response.text
                try:
                    error_json = response.json()
                    if "error" in error_json:
                        error_msg = error_json["error"].get("message", error_msg)
                except Exception:
                    pass
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"OpenRouter API returned an error ({response.status_code}): {error_msg}"
                )

            result = response.json()
            choices = result.get("choices", [])
            if not choices:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail="OpenRouter API returned an empty completion response."
                )

            outline = choices[0].get("message", {}).get("content", "").strip()
            
            # Clean up markdown code blocks if the model generated them
            if outline.startswith("```"):
                lines = outline.splitlines()
                if lines[0].startswith("```"):
                    lines = lines[1:]
                if lines and lines[-1].startswith("```"):
                    lines = lines[:-1]
                outline = "\n".join(lines).strip()

            # Save to database
            doc.textbook_structure = outline
            doc.textbook_data = parse_outline_to_json(doc.filename, outline)
            db.commit()
            db.refresh(doc)
            return doc

    except httpx.RequestError as req_err:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Connection to OpenRouter failed: {str(req_err)}"
        )


# --- Helper Functions for pgvector Embedding & Chunking ---

def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> list[str]:
    """
    Splits text into chunks of chunk_size characters with overlap.
    """
    chunks = []
    if not text:
        return chunks
    start = 0
    while start < len(text):
        end = min(start + chunk_size, len(text))
        chunks.append(text[start:end])
        if end == len(text):
            break
        start += chunk_size - overlap
    return chunks


async def embed_text_chunks(texts: list[str]) -> list[list[float]]:
    """
    Calls OpenRouter embeddings API with nvidia/nemotron-3-embed-1b:free.
    """
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise ValueError("OPENROUTER_API_KEY is not configured. Please add it to your backend/.env file.")
    
    batch_size = 16
    embeddings = []
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        for i in range(0, len(texts), batch_size):
            batch_texts = texts[i:i+batch_size]
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://localhost:8000",
                "X-Title": "Teacher PDF Portal (Bodhi v2)",
            }
            payload = {
                "model": "nvidia/nemotron-3-embed-1b:free",
                "input": batch_texts
            }
            
            response = await client.post(
                "https://openrouter.ai/api/v1/embeddings",
                headers=headers,
                json=payload
            )
            
            if response.status_code != 200:
                raise Exception(f"OpenRouter Embeddings API failed with status {response.status_code}: {response.text}")
                
            data = response.json()
            embeddings_data = data.get("data", [])
            # Keep order intact
            embeddings_data.sort(key=lambda x: x.get("index", 0))
            for item in embeddings_data:
                embeddings.append(item.get("embedding"))
                
    return embeddings


async def embed_document_task(doc_id: int):
    """
    Background worker task to chunk, embed, and store document sections in pgvector.
    """
    from .database import SessionLocal
    from .models import PDFDocument, PDFChunk
    
    db = SessionLocal()
    try:
        doc = db.query(PDFDocument).filter(PDFDocument.id == doc_id).first()
        if not doc:
            print(f"Background embedding task: Document {doc_id} not found.")
            return

        # Clear existing chunks
        db.query(PDFChunk).filter(PDFChunk.document_id == doc_id).delete()
        db.commit()

        chunks = chunk_text(doc.extracted_text)
        if not chunks:
            print(f"Background embedding task: Document {doc_id} has no text to embed.")
            return

        print(f"Background embedding task: Generating embeddings for Doc {doc_id} ({len(chunks)} chunks)...")
        embeddings = await embed_text_chunks(chunks)
        
        for idx, (chunk_text_content, embedding_vector) in enumerate(zip(chunks, embeddings)):
            db_chunk = PDFChunk(
                document_id=doc_id,
                chunk_index=idx,
                text_content=chunk_text_content,
                embedding=embedding_vector
            )
            db.add(db_chunk)
        
        db.commit()
        print(f"Background embedding task: Completed for Doc {doc_id} successfully.")
    except Exception as e:
        print(f"Background embedding task failed for Doc {doc_id}: {e}")
    finally:
        db.close()


# --- Additional pgvector API Endpoints ---

@app.post("/api/documents/{doc_id}/embed", response_model=PDFDocumentResponse)
async def embed_document(
    doc_id: int,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc = db.query(PDFDocument).filter(PDFDocument.id == doc_id, PDFDocument.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found or you do not have permission to view it."
        )

    # Queue the embedding background task
    background_tasks.add_task(embed_document_task, doc_id)
    return doc


@app.post("/api/documents/{doc_id}/search", response_model=List[SemanticSearchResult])
async def search_document_semantics(
    doc_id: int,
    search_query: SemanticSearchQuery,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc = db.query(PDFDocument).filter(PDFDocument.id == doc_id, PDFDocument.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found or you do not have permission to search it."
        )

    if not doc.is_embedded:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This document has not been embedded yet. Please embed it first."
        )

    try:
        # Embed the query
        embeddings = await embed_text_chunks([search_query.query])
        if not embeddings:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Could not generate embedding for the search query."
            )
        query_embedding = embeddings[0]

        # Perform similarity search using pgvector
        from .models import PDFChunk
        results = db.query(
            PDFChunk,
            (1.0 - PDFChunk.embedding.cosine_distance(query_embedding)).label("similarity")
        ).filter(
            PDFChunk.document_id == doc_id
        ).order_by(
            PDFChunk.embedding.cosine_distance(query_embedding)
        ).limit(4).all()

        search_results = []
        for chunk, similarity in results:
            search_results.append(
                SemanticSearchResult(
                    chunk_index=chunk.chunk_index,
                    text_content=chunk.text_content,
                    similarity=max(0.0, float(similarity))
                )
            )
        return search_results

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Semantic search failed: {str(e)}"
        )


# --- Helper to Parse ASCII Outlines into structured JSON ---

def parse_outline_to_json(title: str, outline_text: str) -> dict:
    """
    Parses ASCII tree branch outline structures line-by-line into a structured
    JSON tree layout (Folders for Chapters, Files for Topics).
    """
    import re
    lines = outline_text.splitlines()
    data = {
        "title": title,
        "items": []
    }
    
    current_chapter = None
    folder_idx = 1
    file_idx = 1
    
    for line in lines:
        cleaned = line.strip()
        # strip branch characters
        cleaned = re.sub(r'^[│\s├─└─├──└──]+', '', cleaned).strip()
        if not cleaned:
            continue
            
        # Detect Chapter lines
        is_chapter = False
        if cleaned.lower().startswith("chapter") or re.match(r'^ch\s*\d+', cleaned.lower()):
            is_chapter = True
            
        if is_chapter:
            current_chapter = {
                "id": f"chap-{folder_idx}",
                "type": "folder",
                "name": cleaned,
                "children": []
            }
            data["items"].append(current_chapter)
            folder_idx += 1
        elif current_chapter is not None:
            # Subtopic under chapter
            current_chapter["children"].append({
                "id": f"topic-{file_idx}",
                "type": "file",
                "name": cleaned,
                "content": f"# {cleaned}\n\nNotes and lesson materials for {cleaned} will go here. Double click to edit this topic."
            })
            file_idx += 1
            
    # Fallback: if no chapters were parsed, wrap all content under a default chapter
    if not data["items"] and lines:
        current_chapter = {
            "id": "chap-1",
            "type": "folder",
            "name": "Chapter 1: Course Content",
            "children": []
        }
        data["items"].append(current_chapter)
        for line in lines:
            cleaned = re.sub(r'^[│\s├─└─├──└──]+', '', line.strip()).strip()
            if cleaned:
                current_chapter["children"].append({
                    "id": f"topic-{file_idx}",
                    "type": "file",
                    "name": cleaned,
                    "content": f"# {cleaned}\n\nNotes and lesson materials for {cleaned} will go here. Double click to edit this topic."
                })
                file_idx += 1
                
    return data


# --- Textbook JSON Editor & ZIP Export API Endpoints ---

@app.get("/api/documents/{doc_id}/textbook")
def get_textbook_data(
    doc_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc = db.query(PDFDocument).filter(PDFDocument.id == doc_id, PDFDocument.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found or you do not have permission to view it."
        )
        
    if not doc.textbook_data and doc.textbook_structure:
        doc.textbook_data = parse_outline_to_json(doc.filename, doc.textbook_structure)
        db.commit()
        db.refresh(doc)
        
    return doc.textbook_data or {"title": doc.filename, "items": []}


@app.put("/api/documents/{doc_id}/textbook")
def update_textbook_data(
    doc_id: int,
    textbook_payload: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc = db.query(PDFDocument).filter(PDFDocument.id == doc_id, PDFDocument.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found or you do not have permission to modify it."
        )
        
    doc.textbook_data = textbook_payload
    db.commit()
    db.refresh(doc)
    return doc.textbook_data


@app.get("/api/documents/{doc_id}/textbook/export")
def export_textbook_zip(
    doc_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    import io
    import zipfile
    from fastapi.responses import StreamingResponse
    
    doc = db.query(PDFDocument).filter(PDFDocument.id == doc_id, PDFDocument.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found or you do not have permission to view it."
        )
        
    data = doc.textbook_data
    if not data:
        if doc.textbook_structure:
            data = parse_outline_to_json(doc.filename, doc.textbook_structure)
            doc.textbook_data = data
            db.commit()
            db.refresh(doc)
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No textbook outline has been generated yet for this document."
            )
            
    title = data.get("title", doc.filename)
    safe_title = "".join(c for c in title if c.isalnum() or c in (" ", "_", "-")).rstrip()
    if not safe_title:
        safe_title = "textbook"
        
    zip_buffer = io.BytesIO()
    
    with zipfile.ZipFile(zip_buffer, "a", zipfile.ZIP_DEFLATED, False) as zip_file:
        items = data.get("items", [])
        for item in items:
            item_name = item.get("name", "Untitled Chapter")
            safe_item_name = "".join(c for c in item_name if c.isalnum() or c in (" ", "_", "-")).rstrip()
            
            if item.get("type") == "folder":
                # Chapter Folder
                children = item.get("children", [])
                for child in children:
                    child_name = child.get("name", "Untitled Topic")
                    if not child_name.lower().endswith(".md"):
                        child_filename = f"{child_name}.md"
                    else:
                        child_filename = child_name
                        
                    safe_child_filename = "".join(c for c in child_filename if c.isalnum() or c in (" ", "_", "-", ".")).rstrip()
                    content = child.get("content", f"# {child_name}\n\nContent goes here.")
                    
                    zip_path = f"{safe_item_name}/{safe_child_filename}"
                    zip_file.writestr(zip_path, content)
            elif item.get("type") == "file":
                # Topic at root level
                if not item_name.lower().endswith(".md"):
                    filename = f"{item_name}.md"
                else:
                    filename = item_name
                safe_filename = "".join(c for c in filename if c.isalnum() or c in (" ", "_", "-", ".")).rstrip()
                content = item.get("content", f"# {item_name}\n\nContent goes here.")
                zip_file.writestr(safe_filename, content)
                
    zip_buffer.seek(0)
    
    headers = {
        "Content-Disposition": f'attachment; filename="{safe_title}_textbook.zip"'
    }
    
    return StreamingResponse(
        zip_buffer,
        media_type="application/x-zip-compressed",
        headers=headers
    )

# --- MCQ Assessment Generator Endpoint ---

from pydantic import BaseModel as _PydanticBase

class MCQGenerateRequest(_PydanticBase):
    topic_name: str
    chapter_name: str
    subtopics: list[str]
    num_questions: int = 5


@app.post("/api/documents/{doc_id}/generate-mcq")
async def generate_mcq_assessment(
    doc_id: int,
    payload: MCQGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Generate MCQ questions using chapter subtopics + pgvector textbook context
    doc = db.query(PDFDocument).filter(PDFDocument.id == doc_id, PDFDocument.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    api_key = os.getenv("OPENROUTER_API_KEY")
    model = os.getenv("OPENROUTER_MODEL", "nvidia/nemotron-3-ultra-550b-a55b:free")
    if not api_key:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="OpenRouter API Key not configured.")

    num_q = max(1, min(payload.num_questions, 30))

    # Retrieve relevant chunks via pgvector if embedded
    textbook_context = ""
    if doc.is_embedded:
        try:
            from .models import PDFChunk
            query_text = " ".join([payload.chapter_name, payload.topic_name] + payload.subtopics[:5])
            query_embeddings = await embed_text_chunks([query_text])
            if query_embeddings:
                qv = query_embeddings[0]
                results = db.query(
                    PDFChunk,
                    (1.0 - PDFChunk.embedding.cosine_distance(qv)).label("similarity")
                ).filter(PDFChunk.document_id == doc_id).order_by(
                    PDFChunk.embedding.cosine_distance(qv)
                ).limit(6).all()
                chunks_text = [chunk.text_content for chunk, sim in results if float(sim) > 0.3]
                if chunks_text:
                    textbook_context = "\n\n---\n\n".join(chunks_text)
        except Exception as e:
            print(f"MCQ pgvector search failed: {e}")

    subtopics_str = "\n".join(f"  - {s}" for s in payload.subtopics) if payload.subtopics else "  - (No subtopics listed)"

    system_prompt = (
        "You are an expert educational assessment designer. Generate high-quality MCQ questions for school students.\n\n"
        "STRICT OUTPUT RULES:\n"
        "1. Return ONLY a valid JSON array. No preamble, no explanation, no markdown code fences.\n"
        '2. Each element: { "question": "...", "options": ["A. ...", "B. ...", "C. ...", "D. ..."], "answer": "A", "explanation": "..." }\n'
        "3. The answer field must be exactly A, B, C, or D.\n"
        "4. Make questions clear and appropriate for school-level students.\n"
        "5. Vary question types: recall, application, and concept-based."
    )

    ctx = f"\n\n### Relevant Textbook Content:\n{textbook_context[:4000]}" if textbook_context else "\n\n### Note: Textbook not yet indexed. Generate from subtopics and general knowledge."

    user_prompt = (
        f"Generate exactly {num_q} MCQ questions.\n\n"
        f"Chapter: {payload.chapter_name}\n"
        f"Topic: {payload.topic_name}\n\n"
        f"Subtopics:\n{subtopics_str}"
        f"{ctx}\n\nReturn a JSON array of exactly {num_q} MCQ objects."
    )

    try:
        async with httpx.AsyncClient(timeout=90.0) as client:
            req_headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://localhost:8000",
                "X-Title": "Teacher PDF Portal (Bodhi v2)",
            }
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=req_headers,
                json={
                    "model": model,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    "temperature": 0.7
                }
            )
            if response.status_code != 200:
                error_msg = response.text
                try:
                    err_json = response.json()
                    if "error" in err_json:
                        error_msg = err_json["error"].get("message", error_msg)
                except Exception:
                    pass
                raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"OpenRouter error: {error_msg}")

            result = response.json()
            choices = result.get("choices", [])
            if not choices:
                raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Empty response from AI.")

            raw_content = choices[0].get("message", {}).get("content", "").strip()
            if raw_content.startswith("```"):
                lines = [l for l in raw_content.splitlines() if not l.strip().startswith("```")]
                raw_content = "\n".join(lines).strip()

            import json as _json, re as _re
            try:
                questions = _json.loads(raw_content)
                if not isinstance(questions, list):
                    raise ValueError("Not a list")
            except Exception:
                match = _re.search(r"\[.*\]", raw_content, _re.DOTALL)
                if match:
                    questions = _json.loads(match.group())
                else:
                    raise HTTPException(
                        status_code=status.HTTP_502_BAD_GATEWAY,
                        detail="Could not parse MCQ JSON from AI response."
                    )

            return {
                "questions": questions,
                "topic_name": payload.topic_name,
                "chapter_name": payload.chapter_name,
                "num_questions": len(questions),
                "used_textbook_context": bool(textbook_context)
            }
    except HTTPException:
        raise
    except httpx.RequestError as e:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=f"OpenRouter connection failed: {str(e)}")


# --- PPT Lesson Presentation Generator Endpoint ---

class PPTGenerateRequest(_PydanticBase):
    topic_name: str
    chapter_name: str
    subject: str = "General"
    board: str = "Tamil Nadu State Board"
    duration_minutes: int = 45
    language: str = "English"
    subtopics: list[str] = []


BODHI_PPT_SYSTEM_PROMPT = """You are BODHI Teacher Copilot, an AI teaching assistant for school teachers.

Your task is to create a classroom-ready lesson presentation for a teacher to explain ONE selected textbook topic to school students.

IMPORTANT:
- The uploaded textbook is the primary source of truth.
- Use only the provided textbook evidence and approved curriculum context for factual claims.
- Do NOT invent facts.
- Do NOT introduce advanced concepts unnecessarily.
- Do NOT generate MCQs, quizzes, marks, homework, or assessment questions.
- This presentation is ONLY for teaching and explaining the concept.
- The teacher will review and approve the presentation before classroom use.

TEACHING PRINCIPLES:
1. AGE APPROPRIATE - Content must match the student's grade. Avoid university-level terminology.
2. SIMPLE FIRST - Introduce the idea before giving technical details. Move from familiar to unfamiliar.
3. 4-QUADRANT STRUCTURE - EVERY slide must strictly follow the 4-quadrant layout: Concept, How it works, Example, AI Co-teacher.
4. COGNITIVE LOAD - Keep text minimal. Use short bullet points.

SLIDE FLOW (8-12 slides):
Slide 1: HOOK / TOPIC INTRODUCTION - Create curiosity with a question, situation or observation.
Slide 2: PRIOR KNOWLEDGE - Connect to what students already know.
Slide 3: LEARNING OBJECTIVES - What students will understand by the end.
Slide 4: CORE CONCEPT - Simplest accurate explanation. Introduce important terminology.
Slide 5: PROCESS EXPLANATION - Step-by-step breakdown.
Slide 6: DEEP DIVE - Explore the core mechanism in more detail.
Slide 7: RELATED CONCEPT - ONE highly relevant related concept.
Slide 8: EXAMPLE / REAL-WORLD CONNECTION - Concrete example students can understand.
Slide 9: ANALOGY / COMPARISON - Analogy, comparison table, or familiar system.
Slide 10: MISCONCEPTION - Address most important likely misconception. Explain correct mental model.
Slide 11: SUMMARY - Summarize key concept. Show relationships. End with memorable takeaway.

OUTPUT FORMAT - Return ONLY valid JSON:
{
  "presentation": {
    "title": "",
    "grade": "",
    "subject": "",
    "topic": "",
    "language": "",
    "duration_minutes": 0,
    "learning_objectives": [],
    "slides": [
      {
        "slide_number": 1,
        "title": "Slide Heading",
        "concept": ["Definition", "Key idea"],
        "how_it_works": ["Step 1", "Step 2"],
        "example": ["Real world application"],
        "ai_co_teacher": ["BODHI's advice or misconception warning"],
        "evidence_ids": []
      }
    ]
  }
}

QUALITY CHECK before returning JSON:
- Topic is grounded in the selected textbook
- Every slide strictly contains the 4 arrays: concept, how_it_works, example, ai_co_teacher
- No unsupported factual claims
- Content matches student grade
- No MCQs, no homework, no scoring, no assessment questions
- Output is valid JSON"""


def build_bodhi_ppt_prompt(
    topic_name: str,
    chapter_name: str,
    subject: str,
    board: str,
    duration_minutes: int,
    language: str,
    subtopics: list,
    textbook_evidence: str,
) -> str:
    """
    Builds the user-side BODHI Teacher Copilot prompt with all placeholders filled.
    """
    # Derive plausible grade from board string
    grade = "Class 8"

    # Build structured prerequisite / related concepts from subtopics
    prerequisite_concepts = "Basic understanding of cells and plant biology"
    related_concepts = "; ".join(subtopics[:3]) if subtopics else f"Related topics in {chapter_name}"
    learning_objectives = (
        f"1. Understand what {topic_name} means and why it is important.\n"
        f"2. Identify the key components involved in {topic_name}.\n"
        f"3. Describe the process of {topic_name} step by step.\n"
        f"4. Connect {topic_name} to real-world examples."
    )
    misconceptions = (
        f"Students may confuse {topic_name} with related but different processes. "
        f"They may think the process only happens under certain conditions when it actually happens in other situations too."
    )
    knowledge_graph = (
        f"Chapter: {chapter_name}\n"
        f"Topic: {topic_name}\n"
        f"Subtopics: {', '.join(subtopics) if subtopics else 'See textbook evidence'}"
    )

    prompt = f"""==================================================
INPUT
==================================================

Subject: {subject}
Board/Curriculum: {board}
Grade: {grade}
Lesson Duration: {duration_minutes} minutes
Chapter: {chapter_name}
Selected Topic: {topic_name}

Learning Objectives:
{learning_objectives}

Prerequisite Concepts:
{prerequisite_concepts}

Related Concepts:
{related_concepts}

Known Misconceptions:
{misconceptions}

TEXTBOOK EVIDENCE:
{textbook_evidence}

CURRICULUM KNOWLEDGE GRAPH:
{knowledge_graph}

==================================================
YOUR OBJECTIVE
==================================================

Transform the selected textbook topic into a pedagogically structured classroom presentation.

The presentation should help a teacher answer:
1. What should I teach first?
2. How can I introduce the concept?
3. What previous knowledge should I connect?
4. How can I explain the difficult part simply?
5. What example can I give?
6. What visual/diagram would make the concept easier?
7. Which related concept should I introduce?
8. What misconception should I watch for?
9. How can I connect the concept to students' real life?
10. How should I summarize the lesson?

==================================================
LANGUAGE REQUIREMENTS
==================================================

Generate the teaching explanation naturally in: {language}

Do NOT perform literal word-for-word translation.
Instead:
- Understand the textbook concept first.
- Generate a natural explanation appropriate for students.
- Use simple vocabulary appropriate for {grade}.
- Keep important scientific/technical terms where necessary.

==================================================
FINAL INSTRUCTION
==================================================

Return ONLY valid JSON matching the exact output format described in your system prompt.
Do not include any text, explanation, or markdown outside the JSON object.
"""
    return prompt


@app.post("/api/documents/{doc_id}/generate-ppt")
async def generate_ppt_presentation(
    doc_id: int,
    payload: PPTGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    BODHI Teacher Copilot – Generate a structured classroom PPT presentation
    for the selected topic using the uploaded textbook as the primary source.
    """
    import json as _json
    import re as _re

    doc = db.query(PDFDocument).filter(
        PDFDocument.id == doc_id, PDFDocument.user_id == current_user.id
    ).first()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found or you do not have permission.",
        )

    api_key = os.getenv("OPENROUTER_API_KEY")
    model = os.getenv("OPENROUTER_MODEL", "nvidia/nemotron-3-ultra-550b-a55b:free")
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="OpenRouter API Key is not configured. Please add OPENROUTER_API_KEY to your backend/.env file.",
        )

    # --- Retrieve textbook evidence ---
    textbook_evidence = ""

    if doc.is_embedded:
        try:
            from .models import PDFChunk

            query_text = " ".join(
                [payload.chapter_name, payload.topic_name] + payload.subtopics[:5]
            )
            query_embeddings = await embed_text_chunks([query_text])
            if query_embeddings:
                qv = query_embeddings[0]
                results = db.query(
                    PDFChunk,
                    (1.0 - PDFChunk.embedding.cosine_distance(qv)).label("similarity"),
                ).filter(PDFChunk.document_id == doc_id).order_by(
                    PDFChunk.embedding.cosine_distance(qv)
                ).limit(8).all()

                chunks_text = [
                    f"[Evidence {i+1}] {chunk.text_content}"
                    for i, (chunk, sim) in enumerate(results)
                    if float(sim) > 0.2
                ]
                if chunks_text:
                    textbook_evidence = "\n\n---\n\n".join(chunks_text)
        except Exception as e:
            print(f"PPT pgvector search failed: {e}")

    # Fallback: raw extracted text
    if not textbook_evidence and doc.extracted_text:
        raw = doc.extracted_text[:8000]
        textbook_evidence = f"[Extracted textbook text (first 8000 chars)]\n\n{raw}"

    if not textbook_evidence:
        textbook_evidence = "No textbook evidence available. Generate from general curriculum knowledge."

    # --- Build prompt ---
    user_prompt = build_bodhi_ppt_prompt(
        topic_name=payload.topic_name,
        chapter_name=payload.chapter_name,
        subject=payload.subject,
        board=payload.board,
        duration_minutes=payload.duration_minutes,
        language=payload.language,
        subtopics=payload.subtopics,
        textbook_evidence=textbook_evidence,
    )

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            req_headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://localhost:8000",
                "X-Title": "BODHI Teacher Copilot (Bodhi v2)",
            }
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=req_headers,
                json={
                    "model": model,
                    "messages": [
                        {"role": "system", "content": BODHI_PPT_SYSTEM_PROMPT},
                        {"role": "user", "content": user_prompt},
                    ],
                    "temperature": 0.4,
                },
            )

            if response.status_code != 200:
                error_msg = response.text
                try:
                    err_json = response.json()
                    if "error" in err_json:
                        error_msg = err_json["error"].get("message", error_msg)
                except Exception:
                    pass
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"OpenRouter error ({response.status_code}): {error_msg}",
                )

            result = response.json()
            choices = result.get("choices", [])
            if not choices:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail="Empty response from AI model.",
                )

            raw_content = choices[0].get("message", {}).get("content", "").strip()

            # Strip markdown code fences if model wrapped the JSON
            if raw_content.startswith("```"):
                lines = [
                    ln for ln in raw_content.splitlines()
                    if not ln.strip().startswith("```")
                ]
                raw_content = "\n".join(lines).strip()

            # Parse JSON
            try:
                parsed = _json.loads(raw_content)
                if "presentation" not in parsed:
                    raise ValueError("Missing 'presentation' key")
            except Exception:
                # Try to extract JSON object from surrounding text
                match = _re.search(r"\{.*\}", raw_content, _re.DOTALL)
                if match:
                    parsed = _json.loads(match.group())
                else:
                    raise HTTPException(
                        status_code=status.HTTP_502_BAD_GATEWAY,
                        detail="Could not parse presentation JSON from AI response.",
                    )

            return {
                "presentation": parsed.get("presentation", parsed),
                "topic_name": payload.topic_name,
                "chapter_name": payload.chapter_name,
                "used_textbook_context": bool(doc.is_embedded),
            }

    except HTTPException:
        raise
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"OpenRouter connection failed: {str(e)}",
        )

# --- Presentation Endpoints ---

@app.post("/api/documents/{doc_id}/presentations", response_model=PresentationResponse, status_code=status.HTTP_201_CREATED)
def create_presentation(
    doc_id: int,
    payload: PresentationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc = db.query(PDFDocument).filter(
        PDFDocument.id == doc_id, PDFDocument.user_id == current_user.id
    ).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    new_presentation = LessonPresentation(
        user_id=current_user.id,
        document_id=doc_id,
        title=payload.title,
        topic_name=payload.topic_name,
        chapter_name=payload.chapter_name,
        slides_data=payload.slides_data
    )
    db.add(new_presentation)
    db.commit()
    db.refresh(new_presentation)
    return new_presentation

@app.get("/api/documents/{doc_id}/presentations", response_model=List[PresentationResponse])
def get_presentations(
    doc_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc = db.query(PDFDocument).filter(
        PDFDocument.id == doc_id, PDFDocument.user_id == current_user.id
    ).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    presentations = db.query(LessonPresentation).filter(
        LessonPresentation.document_id == doc_id,
        LessonPresentation.user_id == current_user.id
    ).order_by(LessonPresentation.created_at.desc()).all()
    return presentations

@app.get("/api/presentations", response_model=List[PresentationResponse])
def get_all_presentations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    presentations = db.query(LessonPresentation).filter(
        LessonPresentation.user_id == current_user.id
    ).order_by(LessonPresentation.created_at.desc()).all()
    return presentations

# --- Assessment Endpoints ---

@app.post("/api/documents/{doc_id}/assessments", response_model=AssessmentResponse, status_code=status.HTTP_201_CREATED)
def create_assessment(
    doc_id: int,
    payload: AssessmentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc = db.query(PDFDocument).filter(
        PDFDocument.id == doc_id, PDFDocument.user_id == current_user.id
    ).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    # Properly dump Pydantic objects to JSON serializable dictionaries
    questions_data = [q.model_dump() if hasattr(q, "model_dump") else q.dict() for q in payload.questions]

    new_assessment = Assessment(
        user_id=current_user.id,
        document_id=doc_id,
        title=payload.title,
        topic_name=payload.topic_name,
        chapter_name=payload.chapter_name,
        questions=questions_data
    )
    db.add(new_assessment)
    db.commit()
    db.refresh(new_assessment)
    return new_assessment

@app.get("/api/assessments", response_model=List[AssessmentResponse])
def get_all_assessments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    assessments = db.query(Assessment).filter(
        Assessment.user_id == current_user.id
    ).order_by(Assessment.created_at.desc()).all()
    return assessments

@app.get("/api/documents/{doc_id}/assessments", response_model=List[AssessmentResponse])
def get_document_assessments(
    doc_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc = db.query(PDFDocument).filter(
        PDFDocument.id == doc_id, PDFDocument.user_id == current_user.id
    ).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    assessments = db.query(Assessment).filter(
        Assessment.document_id == doc_id,
        Assessment.user_id == current_user.id
    ).order_by(Assessment.created_at.desc()).all()
    return assessments
