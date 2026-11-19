-- ==============================================================================
-- AI-Based College Helpdesk and Student Assistance System
-- pgvector Semantic Search Function (RPC) for Supabase
-- ==============================================================================

CREATE OR REPLACE FUNCTION match_documents (
  query_embedding vector(768),
  match_threshold float DEFAULT 0.35,
  match_count int DEFAULT 5,
  filter_department_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  document_title text,
  chunk_index int,
  page_number int,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.document_id,
    d.title AS document_title,
    dc.chunk_index,
    dc.page_number,
    dc.content,
    dc.metadata,
    1 - (dc.embedding <=> query_embedding) AS similarity
  FROM document_chunks dc
  JOIN documents d ON d.id = dc.document_id
  WHERE (filter_department_id IS NULL OR d.department_id = filter_department_id)
    AND d.status = 'indexed'
    AND (1 - (dc.embedding <=> query_embedding)) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;
