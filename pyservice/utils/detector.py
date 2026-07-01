from PIL import Image
import io

_detector = None

def get_detector():
    global _detector
    if _detector is None:
        from transformers import pipeline
        _detector = pipeline(
            "image-classification",
            model="Ateeqq/ai-vs-human-image-detector"
        )
    return _detector

def classify_image(image_bytes: bytes) -> dict:
    detector = get_detector()
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    results = detector(image)
    print("RAW MODEL OUTPUT:", results)
    top = results[0]

    # This model's labels: "ai" and "hum" (check actual labels printed below first time)
    label_map = {
        "ai":  "synthetic",
        "hum": "authentic",
        "human": "authentic",
        "artificial": "synthetic"
    }

    classification = label_map.get(top["label"].lower(), "inconclusive")
    confidence = round(top["score"], 4)

    return {
        "classification": classification,
        "confidence": confidence
    }

def calculate_trust_score(elements: list[dict]) -> int:
    if not elements:
        return 100
    score = 100
    for el in elements:
        if el["classification"] == "synthetic":
            score -= int(el["confidence"] * 40)
        elif el["classification"] == "manipulated":
            score -= int(el["confidence"] * 60)
        elif el["classification"] == "inconclusive":
            score -= 10
    return max(0, min(100, score))