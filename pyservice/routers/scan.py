import os
import tempfile

from fastapi import APIRouter, File, HTTPException, UploadFile

from utils.detector import calculate_trust_score, classify_image
from utils.extractor import extract_images_with_positions

router = APIRouter()


@router.post("/scan")
async def scan_document(file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    # Persist the uploaded PDF to a temp file so PyMuPDF can open it by path.
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    try:
        tmp.write(await file.read())
        tmp.close()

        images = extract_images_with_positions(tmp.name)

        # Skip decorative images (icons, dividers, tiny logos). The classifier
        # gives noise on small non-photographic content, and it drags the trust
        # score down for no reason. 1% of page area ≈ ~40x40 on Letter.
        MIN_AREA = 0.01
        images = [i for i in images if i["bbox"][2] * i["bbox"][3] >= MIN_AREA]

        if not images:
            return {"trustScore": 100, "modelVersion": "v1", "elements": []}

        elements = []
        for img in images:
            result = classify_image(img["image_bytes"])
            elements.append({
                "type":           "image",
                "page":           img["page"],
                "bbox":           img["bbox"],
                "classification": result["classification"],
                "confidence":     result["confidence"],
            })

        return {
            "trustScore":   calculate_trust_score(elements),
            "modelVersion": "v1",
            "elements":     elements,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        try:
            os.unlink(tmp.name)
        except OSError:
            pass
