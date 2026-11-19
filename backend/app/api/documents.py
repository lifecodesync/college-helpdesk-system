import os
import shutil
import uuid
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, status
from app.models.schemas import DocumentResponse, DocumentChunkResponse, ProfileResponse
from app.api.auth import get_current_user
from app.core.config import settings
from app.core.database import Database
from app.rag.extractor import extract_text_from_file
from app.rag.chunker import chunk_text
from app.rag.embeddings import get_embedding

router = APIRouter(prefix="/documents", tags=["Knowledge Base & Documents"])

@router.get("/", response_model=List[DocumentResponse])
def list_documents(department_id: Optional[str] = None):
    docs = Database.get_documents()
    if department_id:
        docs = [d for d in docs if d.get("department_id") == department_id]
    return [DocumentResponse(**d) for d in docs]

@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(document_id: str):
    doc = Database.get_document_by_id(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return DocumentResponse(**doc)

@router.get("/{document_id}/chunks", response_model=List[DocumentChunkResponse])
def get_document_chunks(document_id: str):
    chunks = Database.get_chunks(document_id)
    return [DocumentChunkResponse(**c) for c in chunks]

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    title: str = Form(...),
    department_id: Optional[str] = Form(None),
    current_user: ProfileResponse = Depends(get_current_user)
):
    if current_user.role not in ["admin", "faculty"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only faculty and admin can upload documents")

    filename = file.filename or "document.txt"
    file_ext = filename.split(".")[-1].lower() if "." in filename else "txt"

    if file_ext not in ["pdf", "docx", "txt", "md"]:
        raise HTTPException(status_code=400, detail="Unsupported file format. Please upload PDF, DOCX, or TXT.")

    doc_id = str(uuid.uuid4())
    safe_filename = f"{doc_id}_{filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, safe_filename)

    # Save to disk
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {e}")

    file_size = os.path.getsize(file_path)

    # Register initial document record
    doc_record = Database.add_document({
        "id": doc_id,
        "title": title,
        "filename": filename,
        "file_type": file_ext,
        "file_size": file_size,
        "storage_path": file_path,
        "department_id": department_id,
        "uploaded_by": current_user.id,
        "status": "processing",
        "chunk_count": 0,
        "summary": "Indexing document contents..."
    })

    # Ingestion & Chunking pipeline
    try:
        pages = extract_text_from_file(file_path, file_ext)
        if not pages:
            Database.update_document_status(doc_id, "failed", 0, "No text could be extracted from document.")
            raise HTTPException(status_code=400, detail="No readable text extracted from file.")

        chunks = chunk_text(pages, chunk_size=350, chunk_overlap=60)
        
        # Save chunks with embeddings
        for c in chunks:
            Database.add_chunk({
                "document_id": doc_id,
                "chunk_index": c["chunk_index"],
                "page_number": c["page_number"],
                "content": c["content"],
                "metadata": {
                    "source": filename,
                    "title": title,
                    "page": c["page_number"],
                    "department_id": department_id
                }
            })

        summary_snippet = chunks[0]["content"][:160] + "..." if chunks else "No text preview available."
        Database.update_document_status(doc_id, "indexed", len(chunks), summary_snippet)
        
    except Exception as e:
        Database.update_document_status(doc_id, "failed", 0, str(e))
        raise HTTPException(status_code=500, detail=f"Document processing failed: {e}")

    updated_doc = Database.get_document_by_id(doc_id)
    return DocumentResponse(**updated_doc)

@router.delete("/{document_id}")
def delete_document(document_id: str, current_user: ProfileResponse = Depends(get_current_user)):
    if current_user.role not in ["admin", "faculty"]:
        raise HTTPException(status_code=403, detail="Permission denied")
    
    doc = Database.get_document_by_id(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Remove from store
    Database.DOCUMENTS = [d for d in Database.DOCUMENTS if d["id"] != document_id]
    Database.DOCUMENT_CHUNKS = [c for c in Database.DOCUMENT_CHUNKS if c["document_id"] != document_id]
    
    # Clean up file on disk if exists
    if doc.get("storage_path") and os.path.exists(doc["storage_path"]):
        try:
            os.remove(doc["storage_path"])
        except Exception:
            pass
            
    return {"status": "success", "message": "Document deleted successfully"}
