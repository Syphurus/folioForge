import fitz  # PyMuPDF

def extract_images_with_positions(pdf_path: str) -> list[dict]:
    """
    Opens a PDF and returns each embedded image with:
    - which page it's on
    - its bbox normalized to 0-1 (fraction of page size)
    - the raw image bytes (for the detection model on Day 2)
    """
    doc = fitz.open(pdf_path)
    results = []

    for page_num, page in enumerate(doc, start=1):
        page_width  = page.rect.width
        page_height = page.rect.height

        for img_info in page.get_images(full=True):
            xref = img_info[0]

            rects = page.get_image_rects(xref)
            if not rects:
                continue

            rect = rects[0]

            # Normalize coordinates to 0-1
            norm_bbox = [
                round(rect.x0 / page_width,  4),
                round(rect.y0 / page_height, 4),
                round(rect.width  / page_width,  4),
                round(rect.height / page_height, 4),
            ]

            base_image   = doc.extract_image(xref)
            image_bytes  = base_image["image"]

            results.append({
                "page":        page_num,
                "bbox":        norm_bbox,
                "image_bytes": image_bytes,
                "ext":         base_image["ext"],
            })

    doc.close()
    return results