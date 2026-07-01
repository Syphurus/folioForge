from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from utils.pdf_utils import (
    merge_pdfs,
    compress_pdf,
    split_pdf,
)

router = APIRouter(
    prefix="/pdf",
    tags=["PDF Operations"]
)


class MergeRequest(BaseModel):
    paths: list[str]


class CompressRequest(BaseModel):
    path: str


class SplitRequest(BaseModel):
    path: str
    ranges: list[str]


@router.post("/merge")
def merge(request: MergeRequest):
    try:
        output_path = merge_pdfs(request.paths)
        return {"outputPath": output_path}

    except FileNotFoundError:
        raise HTTPException(
            status_code=404,
            detail="One or more PDF files were not found."
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Internal server error."
        )


@router.post("/compress")
def compress(request: CompressRequest):
    try:
        output_path = compress_pdf(request.path)
        return {"outputPath": output_path}

    except FileNotFoundError:
        raise HTTPException(
            status_code=404,
            detail="PDF file not found."
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Internal server error."
        )


@router.post("/split")
def split(request: SplitRequest):
    try:
        output_paths = split_pdf(
            request.path,
            request.ranges
        )

        return {"outputPaths": output_paths}

    except FileNotFoundError:
        raise HTTPException(
            status_code=404,
            detail="PDF file not found."
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Internal server error."
        )