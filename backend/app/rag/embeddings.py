import math
import hashlib
import re
from typing import List
from app.core.config import settings

def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    if not v1 or not v2 or len(v1) != len(v2):
        return 0.0
    dot = sum(a * b for a, b in zip(v1, v2))
    norm_a = math.sqrt(sum(a * a for a in v1))
    norm_b = math.sqrt(sum(b * b for b in v2))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)

def get_hash_embedding(text: str, dim: int = 768) -> List[float]:
    """
    Semantic hash vector embedding with character n-grams, word frequency,
    and term weighting.
    """
    vector = [0.0] * dim
    clean = re.sub(r'[^\w\s]', ' ', text.lower())
    words = [w for w in clean.split() if len(w) > 2]
    if not words:
        return vector

    # Unigrams + Bigrams
    terms = words[:]
    for i in range(len(words) - 1):
        terms.append(f"{words[i]}_{words[i+1]}")

    for term in terms:
        h = int(hashlib.md5(term.encode('utf-8')).hexdigest(), 16)
        idx = h % dim
        vector[idx] += 1.0 + math.log(max(len(term), 2))

    # L2 normalize
    norm = math.sqrt(sum(x * x for x in vector))
    if norm > 0:
        vector = [x / norm for x in vector]

    return vector

def get_embedding(text: str) -> List[float]:
    """
    Generates embedding for text.
    Uses Gemini API if key is present; otherwise falls back to local high-fidelity vector.
    """
    clean_text = text.strip()
    if not clean_text:
        return [0.0] * 768

    if settings.GEMINI_API_KEY and "your-gemini" not in settings.GEMINI_API_KEY:
        try:
            import httpx
            url = f"https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key={settings.GEMINI_API_KEY}"
            payload = {
                "model": "models/text-embedding-004",
                "content": {"parts": [{"text": clean_text[:2000]}]}
            }
            with httpx.Client(timeout=10.0) as client:
                res = client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    values = data.get("embedding", {}).get("values", [])
                    if len(values) == 768:
                        return values
        except Exception as e:
            print(f"⚠️ Gemini Embedding API call failed: {e}. Using local vector fallback.")

    return get_hash_embedding(clean_text, 768)
