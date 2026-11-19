import os
from typing import List, Dict, Any

def extract_text_from_file(file_path: str, file_type: str) -> List[Dict[str, Any]]:
    """
    Extracts text from PDF, DOCX, or TXT file.
    Returns a list of dicts: [{"page": int, "text": str}]
    """
    file_type = file_type.lower()
    pages_content = []

    if file_type == "pdf":
        try:
            from pypdf import PdfReader
            reader = PdfReader(file_path)
            for idx, page in enumerate(reader.pages):
                text = page.extract_text() or ""
                if text.strip():
                    pages_content.append({"page": idx + 1, "text": text.strip()})
        except Exception as e:
            print(f"Error extracting PDF with pypdf: {e}")
            # Fallback to reading raw file if text-like
            try:
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    pages_content.append({"page": 1, "text": f.read()})
            except Exception:
                pass

    elif file_type == "docx":
        try:
            import docx
            doc = docx.Document(file_path)
            full_text = []
            for para in doc.paragraphs:
                if para.text.strip():
                    full_text.append(para.text.strip())
            
            # Group into synthetic pages of ~500 words
            text_str = "\n\n".join(full_text)
            words = text_str.split()
            page_size = 500
            for i in range(0, max(len(words), 1), page_size):
                page_words = words[i:i + page_size]
                pages_content.append({
                    "page": (i // page_size) + 1,
                    "text": " ".join(page_words)
                })
        except Exception as e:
            print(f"Error extracting DOCX: {e}")

    else:
        # Default txt or markdown
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
            pages_content.append({"page": 1, "text": content})
        except Exception as e:
            print(f"Error reading TXT file: {e}")

    return pages_content
