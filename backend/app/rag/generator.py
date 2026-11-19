import re
from typing import List, Dict, Any, Tuple
from app.core.config import settings

SYSTEM_PROMPT = """You are the official AI Student Assistant for the College Helpdesk.
Your purpose is to answer students, faculty, and visitors with 100% accuracy based strictly on the official college documents provided in the context.

Guidelines:
1. Rely ONLY on the provided context. Do NOT hallucinate rules, dates, or fee amounts.
2. Formulate clear, empathetic, and structured answers using bullet points where helpful.
3. Explicitly cite your sources at the relevant points in your response, e.g.: "(Source: Academic Regulations 2026, Page 1)".
4. If the context does NOT contain enough information to answer the query, politely inform the user:
   "I could not locate verified details for this query in our current college knowledge base. Please create a Helpdesk ticket so our faculty or administration can assist you directly."
"""

def generate_rag_answer(query: str, retrieved_chunks: List[Dict[str, Any]]) -> Tuple[str, float, bool, str]:
    """
    Synthesizes an answer grounded in the retrieved chunks.
    Returns: (answer_text, confidence_score, is_answered, unanswered_reason)
    """
    if not retrieved_chunks:
        return (
            "I could not find any official college documents matching your query. "
            "Please check the FAQs, browse notices, or create a Helpdesk ticket to get support from the relevant department.",
            0.0,
            False,
            "no_documents"
        )

    # Calculate overall confidence from top chunk similarities
    top_score = retrieved_chunks[0]["similarity"]
    confidence = round(min(0.98, max(0.45, top_score + 0.25)), 2)

    # If match is too weak
    if top_score < 0.15:
        return (
            "I found some remotely related topics, but not enough verified details to answer your query with confidence. "
            "Please submit a Support Ticket in the Helpdesk tab to get a direct response from the department coordinator.",
            confidence,
            False,
            "low_confidence"
        )

    # Format context blocks
    context_blocks = []
    for idx, chunk in enumerate(retrieved_chunks, 1):
        context_blocks.append(
            f"--- CONTEXT CHUNK {idx} ---\n"
            f"Document: {chunk['document_title']}\n"
            f"Page: {chunk['page_number']}\n"
            f"Content:\n{chunk['content']}\n"
        )
    context_str = "\n".join(context_blocks)

    # Try calling Google Gemini API if key is present
    if settings.GEMINI_API_KEY and "your-gemini" not in settings.GEMINI_API_KEY:
        try:
            import httpx
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
            prompt_content = f"{SYSTEM_PROMPT}\n\nCollege Context:\n{context_str}\n\nStudent Query: {query}\n\nAnswer:"
            payload = {
                "contents": [{"parts": [{"text": prompt_content}]}],
                "generationConfig": {
                    "temperature": 0.2,
                    "maxOutputTokens": 800
                }
            }
            with httpx.Client(timeout=15.0) as client:
                res = client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        text_part = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                        if text_part.strip():
                            is_answered = "could not locate verified details" not in text_part.lower()
                            return (text_part.strip(), confidence, is_answered, None if is_answered else "out_of_scope")
        except Exception as e:
            print(f"⚠️ Gemini API generation failed: {e}. Falling back to intelligent synthesizer.")

    # High-quality deterministic RAG synthesizer fallback
    primary_chunk = retrieved_chunks[0]
    doc_title = primary_chunk["document_title"]
    page_num = primary_chunk["page_number"]
    content = primary_chunk["content"].strip()

    paragraphs = content.split('\n')
    main_body = "\n".join([p for p in paragraphs if len(p.strip()) > 20])
    if not main_body:
        main_body = content

    answer = (
        f"Based on official college records:\n\n"
        f"{main_body}\n\n"
        f"*(Source: {doc_title}, Page {page_num})*"
    )

    return (answer, confidence, True, None)
