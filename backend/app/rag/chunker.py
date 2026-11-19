import re
from typing import List, Dict, Any

def chunk_text(pages: List[Dict[str, Any]], chunk_size: int = 500, chunk_overlap: int = 80) -> List[Dict[str, Any]]:
    """
    Splits text across pages into chunks with specified word/character size and overlap.
    Preserves page numbers and metadata.
    """
    chunks = []
    chunk_index = 1

    for page_info in pages:
        page_num = page_info["page"]
        text = page_info["text"]

        # Clean excess spaces
        text = re.sub(r'\s+', ' ', text).strip()
        if not text:
            continue

        words = text.split(' ')
        if len(words) <= chunk_size:
            chunks.append({
                "chunk_index": chunk_index,
                "page_number": page_num,
                "content": text,
                "token_count": len(words)
            })
            chunk_index += 1
        else:
            # Sliding window over words
            start = 0
            while start < len(words):
                end = min(start + chunk_size, len(words))
                chunk_words = words[start:end]
                chunk_content = " ".join(chunk_words)

                chunks.append({
                    "chunk_index": chunk_index,
                    "page_number": page_num,
                    "content": chunk_content,
                    "token_count": len(chunk_words)
                })
                chunk_index += 1

                if end == len(words):
                    break
                start += (chunk_size - chunk_overlap)

    return chunks
