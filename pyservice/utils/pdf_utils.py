import os
import uuid

from pypdf import PdfReader, PdfWriter

OUTPUT_DIR = "output"
os.makedirs(OUTPUT_DIR, exist_ok=True)


def merge_pdfs(paths):
    """
    Merge multiple PDF files into one PDF.
    Returns the output PDF path.
    """

    if not paths:
        raise ValueError("No PDF files provided.")

    writer = PdfWriter()

    for path in paths:
        if not os.path.exists(path):
            raise FileNotFoundError(path)

        reader = PdfReader(path)

        for page in reader.pages:
            writer.add_page(page)

    output_path = os.path.join(
        OUTPUT_DIR,
        f"merged_{uuid.uuid4().hex}.pdf"
    )

    with open(output_path, "wb") as output_file:
        writer.write(output_file)

    return output_path


def compress_pdf(path):
    """
    Prototype PDF compression.
    Rewrites the PDF into a new file.
    """

    if not os.path.exists(path):
        raise FileNotFoundError(path)

    reader = PdfReader(path)
    writer = PdfWriter()

    for page in reader.pages:
        writer.add_page(page)

    output_path = os.path.join(
        OUTPUT_DIR,
        f"compressed_{uuid.uuid4().hex}.pdf"
    )

    with open(output_path, "wb") as output_file:
        writer.write(output_file)

    return output_path


def split_pdf(path, ranges):
    """
    Split a PDF using page ranges.

    Example:
        ranges = ["1-3", "4-6"]
    """

    if not os.path.exists(path):
        raise FileNotFoundError(path)

    reader = PdfReader(path)
    total_pages = len(reader.pages)

    output_paths = []

    for page_range in ranges:

        try:
            start, end = map(int, page_range.split("-"))
        except ValueError:
            raise ValueError(
                f"Invalid page range: {page_range}"
            )

        if start < 1 or end > total_pages or start > end:
            raise ValueError(
                f"Invalid page range: {page_range}"
            )

        writer = PdfWriter()

        for page_num in range(start - 1, end):
            writer.add_page(reader.pages[page_num])

        output_path = os.path.join(
            OUTPUT_DIR,
            f"split_{uuid.uuid4().hex}.pdf"
        )

        with open(output_path, "wb") as output_file:
            writer.write(output_file)

        output_paths.append(output_path)

    return output_paths