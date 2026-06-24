from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from utils.extractor import extract_images_with_positions
from utils.detector import classify_image, calculate_trust_score

router = APIRouter()

class ScanRequest(BaseModel):
    path: str

@router.post("/scan")
def scan_document(req: ScanRequest):
    try:
        # Step 1 - Extract all images from the PDF
        images = extract_images_with_positions(req.path)

        if not images:
            # No images found - document is text only
            return {
                "trustScore":    100,
                "modelVersion":  "v1",
                "elements":      []
            }

        # Step 2 - Run detection model on each image
        elements = []
        for img in images:
            result = classify_image(img["image_bytes"])

            elements.append({
                "type":           "image",
                "page":           img["page"],
                "bbox":           img["bbox"],
                "classification": result["classification"],
                "confidence":     result["confidence"]
            })

        # Step 3 - Calculate overall trust score
        trust_score = calculate_trust_score(elements)

        # Step 4 - Return real result in exact same shape as stub
        return {
            "trustScore":   trust_score,
            "modelVersion": "v1",
            "elements":     elements
        }

    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="PDF file not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))