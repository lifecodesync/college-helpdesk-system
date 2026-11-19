import time
from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from app.models.schemas import (
    ChatQueryRequest, ChatQueryResponse, SourceCitation,
    ChatFeedbackRequest, ProfileResponse
)
from app.api.auth import get_current_user
from app.core.database import Database
from app.rag.retriever import retrieve_relevant_chunks
from app.rag.generator import generate_rag_answer

router = APIRouter(prefix="/chat", tags=["AI Chatbot & RAG"])

@router.post("/ask", response_model=ChatQueryResponse)
def ask_chat_rag(req: ChatQueryRequest, current_user: Optional[ProfileResponse] = Depends(get_current_user)):
    start_time = time.time()
    query = req.query.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    # 1. Retrieve semantically relevant chunks
    chunks = retrieve_relevant_chunks(
        query=query,
        top_k=4,
        threshold=0.20,
        department_id=req.department_id
    )

    # 2. Synthesize answer with RAG generator
    answer, confidence, is_answered, reason = generate_rag_answer(query, chunks)
    elapsed_ms = int((time.time() - start_time) * 1000)

    # 3. Format citations
    sources = []
    for c in chunks:
        sources.append(SourceCitation(
            document_id=c["document_id"],
            document_title=c["document_title"],
            filename=c.get("filename"),
            page_number=c["page_number"],
            chunk_index=c["chunk_index"],
            content_snippet=c["content"][:220] + "...",
            similarity=c["similarity"]
        ))

    # 4. Log query in database for analytics & admin review
    user_id = current_user.id if current_user else None
    log_entry = Database.log_query({
        "user_id": user_id,
        "query_text": query,
        "response_text": answer,
        "sources_used": [s.model_dump() for s in sources],
        "confidence_score": confidence,
        "is_answered": is_answered,
        "unanswered_reason": reason,
        "response_time_ms": elapsed_ms
    })

    return ChatQueryResponse(
        query_id=log_entry["id"],
        answer=answer,
        sources=sources,
        confidence_score=confidence,
        is_answered=is_answered,
        unanswered_reason=reason,
        response_time_ms=elapsed_ms
    )

@router.post("/feedback")
def submit_feedback(req: ChatFeedbackRequest):
    updated = Database.update_feedback(req.query_id, req.feedback, req.comment)
    if not updated:
        raise HTTPException(status_code=404, detail="Query log not found")
    return {"status": "success", "message": "Feedback submitted successfully"}

@router.get("/history")
def get_chat_history(current_user: ProfileResponse = Depends(get_current_user)):
    logs = Database.get_query_logs()
    if current_user.role != "admin":
        logs = [l for l in logs if l.get("user_id") == current_user.id]
    return logs[:25]
