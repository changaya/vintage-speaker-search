#!/usr/bin/env python3
"""
PDF to Pages Converter for Phasemation Library

Converts PDF documents to per-page JPG images and extracts text content.
Uses pdf2image (poppler) for image conversion and pdfplumber for text extraction.

Usage:
    # Install dependencies
    pip install pdf2image pdfplumber

    # Convert all PDFs in phasemation-library
    python scripts/convert_pdfs_to_pages.py phasemation-library

    # Convert a specific subfolder
    python scripts/convert_pdfs_to_pages.py phasemation-library/catalogues

    # Convert a single PDF
    python scripts/convert_pdfs_to_pages.py phasemation-library/manuals/CA-1000_manual.pdf

Output structure:
    phasemation-library/
    ├── phasemation-catalogues/images/{model-name}/page01.jpg ...
    ├── phasemation-manuals/images/{model-name}/page01.jpg ...
    └── extracted_text/
        ├── phasemation-catalogues/images/{model-name}/page01.txt ...
        └── phasemation-manuals/images/{model-name}/page01.txt ...
"""

import sys
import os
import re
from pathlib import Path

try:
    from pdf2image import convert_from_path
except ImportError:
    print("Error: pdf2image not installed. Run: pip install pdf2image")
    sys.exit(1)

try:
    import pdfplumber
except ImportError:
    print("Error: pdfplumber not installed. Run: pip install pdfplumber")
    sys.exit(1)


# Mapping from source folder names to output folder names
FOLDER_MAP = {
    "catalogues": "phasemation-catalogues",
    "manuals": "phasemation-manuals",
}


def extract_model_name(pdf_filename: str) -> str:
    """
    Extract model name from PDF filename.

    Examples:
        CA-1000Catalog.pdf -> CA-1000
        CM-1500_cata.pdf -> CM-1500
        EA-1000_manual.pdf -> EA-1000
        PP-Mono-300Catalog.pdf -> PP-Mono-300
        PP200_DG100_cata.pdf -> PP200_DG100
        sogocata_a.pdf -> sogocata_a
        t1000_manual_ol.pdf -> T-1000
        CT-1manual.pdf -> CT-1
        PT23A_manual.pdf -> PT-23A
        PT300S_manual.pdf -> PT-300S
        ea350_manual_ol.pdf -> EA-350
        ea550_manual_ol.pdf -> EA-550
        cm2000_manual.pdf -> CM-2000
        EA1200_manual.pdf -> EA-1200
        EA320_manual.pdf -> EA-320
        CM2200_cata.pdf -> CM-2200
        service_regulations.pdf -> service_regulations
    """
    # Remove extension
    name = Path(pdf_filename).stem

    # Remove common suffixes (case-insensitive)
    suffixes_to_remove = [
        r'_manual_ol$', r'_manual$', r'_cata$',
        r'Catalog$', r'catalog$', r'_ol$',
    ]
    for suffix in suffixes_to_remove:
        name = re.sub(suffix, '', name, flags=re.IGNORECASE)

    # Remove trailing 'manual' without underscore (e.g., CT-1manual -> CT-1)
    name = re.sub(r'manual$', '', name, flags=re.IGNORECASE)

    # Normalize: lowercase prefix + number without dash -> add dash
    # e.g., t1000 -> T-1000, ea350 -> EA-350, CM2200 -> CM-2200
    match = re.match(r'^([a-zA-Z]{1,3})(\d{2,4}[A-Z]?)$', name)
    if match:
        prefix = match.group(1).upper()
        number = match.group(2)
        name = f"{prefix}-{number}"

    # Normalize: PT23A -> PT-23A, PT300S -> PT-300S
    match = re.match(r'^(PT)(\d+[A-Z]?)$', name, re.IGNORECASE)
    if match:
        prefix = match.group(1).upper()
        number = match.group(2)
        name = f"{prefix}-{number}"

    # Ensure consistent casing for known prefixes
    known_prefixes = ['CA', 'CM', 'CS', 'CT', 'CC', 'EA', 'MA', 'SA', 'PP', 'PS', 'PT', 'DG', 'EPA', 'HD', 'T', 'P']
    for prefix in known_prefixes:
        if name.upper().startswith(prefix + '-'):
            name = prefix + name[len(prefix):]
            break

    return name


def determine_category(pdf_path: Path, base_dir: Path) -> str:
    """Determine the category folder based on the PDF's location."""
    try:
        relative = pdf_path.relative_to(base_dir)
        first_part = relative.parts[0] if relative.parts else ""
    except ValueError:
        first_part = pdf_path.parent.name

    return FOLDER_MAP.get(first_part, "phasemation-other")


def convert_single_pdf(pdf_path: Path, base_dir: Path, dpi: int = 200):
    """Convert a single PDF to page images and extract text."""
    model_name = extract_model_name(pdf_path.name)
    category = determine_category(pdf_path, base_dir)

    # Output directories
    image_dir = base_dir / category / "images" / model_name
    text_dir = base_dir / "extracted_text" / category / "images" / model_name

    image_dir.mkdir(parents=True, exist_ok=True)
    text_dir.mkdir(parents=True, exist_ok=True)

    print(f"\nProcessing: {pdf_path.name} -> {category}/images/{model_name}/")

    # Convert PDF to images
    try:
        images = convert_from_path(str(pdf_path), dpi=dpi)
    except Exception as e:
        print(f"  ERROR converting to images: {e}")
        return 0

    page_count = len(images)
    print(f"  Pages: {page_count}")

    # Save images
    for i, img in enumerate(images, 1):
        page_name = f"page{i:02d}"
        image_path = image_dir / f"{page_name}.jpg"
        img.save(str(image_path), "JPEG", quality=85)

    # Extract text with pdfplumber
    try:
        with pdfplumber.open(str(pdf_path)) as pdf:
            for i, page in enumerate(pdf.pages, 1):
                page_name = f"page{i:02d}"
                text_path = text_dir / f"{page_name}.txt"

                text = page.extract_text() or ""
                if text.strip():
                    text_path.write_text(text.strip(), encoding="utf-8")
                else:
                    # Write empty marker so we know it was processed
                    text_path.write_text("", encoding="utf-8")
    except Exception as e:
        print(f"  WARNING: Text extraction failed: {e}")

    print(f"  OK: {page_count} pages converted")
    return page_count


def process_directory(directory: Path, base_dir: Path):
    """Process all PDFs in a directory recursively."""
    pdf_files = sorted(directory.rglob("*.pdf")) + sorted(directory.rglob("*.PDF"))
    # Deduplicate (in case both patterns match same file)
    seen = set()
    unique_pdfs = []
    for f in pdf_files:
        if f.resolve() not in seen:
            seen.add(f.resolve())
            unique_pdfs.append(f)

    if not unique_pdfs:
        print(f"No PDF files found in {directory}")
        return

    print(f"Found {len(unique_pdfs)} PDF files to convert")

    total_pages = 0
    success_count = 0
    error_count = 0

    for pdf_path in unique_pdfs:
        pages = convert_single_pdf(pdf_path, base_dir)
        if pages > 0:
            total_pages += pages
            success_count += 1
        else:
            error_count += 1

    print(f"\n{'='*60}")
    print(f"Conversion complete!")
    print(f"  PDFs processed: {success_count} success, {error_count} errors")
    print(f"  Total pages: {total_pages}")
    print(f"  Images: {base_dir}/phasemation-*/images/")
    print(f"  Text: {base_dir}/extracted_text/phasemation-*/images/")
    print(f"{'='*60}")


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    target = Path(sys.argv[1])

    if not target.exists():
        print(f"Error: Path does not exist: {target}")
        sys.exit(1)

    if target.is_file() and target.suffix.lower() == '.pdf':
        # Single file - use parent's parent as base_dir
        base_dir = target.parent.parent if target.parent.name in FOLDER_MAP else target.parent
        convert_single_pdf(target, base_dir)
    elif target.is_dir():
        # Directory - use it as base_dir if it looks like a library root
        if any((target / folder).exists() for folder in FOLDER_MAP):
            base_dir = target
        else:
            base_dir = target.parent
        process_directory(target, base_dir)
    else:
        print(f"Error: {target} is not a PDF file or directory")
        sys.exit(1)


if __name__ == "__main__":
    main()
