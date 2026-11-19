import re
from typing import List, Dict, Any, Optional
from app.core.database import Database, supabase_client
from app.rag.embeddings import get_embedding, cosine_similarity

def retrieve_relevant_chunks(
    query: str,
    top_k: int = 4,
    threshold: float = 0.15,
    department_id: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Retrieves the most semantically relevant document chunks for a given user query.
    Supports Supabase RPC match_documents and local hybrid vector+keyword fallback.
    """
    query_emb = get_embedding(query)
    clean_query = re.sub(r'[^\w\s]', ' ', query.lower())
    query_terms = set(w for w in clean_query.split() if len(w) > 2)

    # Try live Supabase RPC first if client is active
    if supabase_client:
        try:
            params = {
                "query_embedding": query_emb,
                "match_threshold": threshold,
                "match_count": top_k,
                "filter_department_id": department_id
            }
            res = supabase_client.rpc("match_documents", params).execute()
            if res.data and len(res.data) > 0:
                results = []
                for item in res.data:
                    results.append({
                        "id": item.get("id"),
                        "document_id": item.get("document_id"),
                        "document_title": item.get("document_title") or "College Document",
                        "filename": item.get("filename"),
                        "page_number": item.get("page_number", 1),
                        "chunk_index": item.get("chunk_index", 1),
                        "content": item.get("content", ""),
                        "similarity": round(float(item.get("similarity", 0.0)), 4)
                    })
                return results
        except Exception as e:
            print(f"Supabase RPC match_documents error: {e}. Falling back to internal engine.")

    # Fallback: In-memory hybrid vector + keyword matching
    all_chunks = Database.get_chunks()
    all_docs = {d["id"]: d for d in Database.get_documents()}
    scored_chunks = []

    for chunk in all_chunks:
        doc_id = chunk["document_id"]
        doc = all_docs.get(doc_id)
        if not doc or doc.get("status") != "indexed":
            continue

        # Department filter
        if department_id and doc.get("department_id") != department_id:
            continue

        chunk_text = chunk["content"]
        chunk_emb = get_embedding(chunk_text)
        sim = cosine_similarity(query_emb, chunk_emb)

        # Keyword overlap
        clean_chunk = re.sub(r'[^\w\s]', ' ', chunk_text.lower())
        chunk_words = set(w for w in clean_chunk.split() if len(w) > 2)
        common = query_terms.intersection(chunk_words)
        kw_ratio = (len(common) / len(query_terms)) if query_terms else 0.0

        # Composite score
        composite_score = (sim * 0.50) + (kw_ratio * 0.50)

        if composite_score >= threshold:
            scored_chunks.append({
                "id": chunk["id"],
                "document_id": doc_id,
                "document_title": doc.get("title", "Official College Document"),
                "filename": doc.get("filename", ""),
                "page_number": chunk.get("page_number", 1),
                "chunk_index": chunk.get("chunk_index", 1),
                "content": chunk_text,
                "similarity": round(float(composite_score), 4)
            })

    # Sort descending by composite score
    scored_chunks.sort(key=lambda x: x["similarity"], reverse=True)
    return scored_chunks[:top_k]
