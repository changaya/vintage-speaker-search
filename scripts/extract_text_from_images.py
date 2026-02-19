#!/usr/bin/env python3
"""
OCR Script for Vintage Audio Library Images
Extracts text from JPG/PNG images using Tesseract OCR.

Usage:
    # Activate virtual environment first
    source scripts/ocr-venv/bin/activate

    # Extract text from all images in a folder
    python scripts/extract_text_from_images.py altec-library

    # Extract from specific subfolder
    python scripts/extract_text_from_images.py altec-library/altec-catalogs

    # Extract single file
    python scripts/extract_text_from_images.py path/to/image.jpg
"""

import sys
import os
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

try:
    import pytesseract
    from PIL import Image
except ImportError:
    print("Error: Required packages not installed.")
    print("Run: source scripts/ocr-venv/bin/activate")
    sys.exit(1)


def extract_text(image_path: Path) -> tuple[Path, str, str | None]:
    """Extract text from a single image file."""
    try:
        img = Image.open(image_path)
        text = pytesseract.image_to_string(img)
        return (image_path, text.strip(), None)
    except Exception as e:
        return (image_path, "", str(e))


def process_directory(directory: Path, output_dir: Path | None = None, workers: int = 4):
    """Process all images in a directory recursively."""

    # Find all image files
    image_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff'}
    image_files = [
        f for f in directory.rglob('*')
        if f.suffix.lower() in image_extensions
    ]

    if not image_files:
        print(f"No image files found in {directory}")
        return

    print(f"Found {len(image_files)} images to process...")

    # Determine output directory
    if output_dir is None:
        output_dir = directory / "extracted_text"
    output_dir.mkdir(parents=True, exist_ok=True)

    success_count = 0
    error_count = 0

    # Process images in parallel
    with ThreadPoolExecutor(max_workers=workers) as executor:
        futures = {executor.submit(extract_text, img): img for img in image_files}

        for i, future in enumerate(as_completed(futures), 1):
            image_path, text, error = future.result()

            if error:
                print(f"[{i}/{len(image_files)}] ERROR: {image_path.name} - {error}")
                error_count += 1
                continue

            if text:
                # Create output path mirroring source structure
                relative_path = image_path.relative_to(directory)
                output_path = output_dir / relative_path.with_suffix('.txt')
                output_path.parent.mkdir(parents=True, exist_ok=True)
                output_path.write_text(text, encoding='utf-8')

                success_count += 1
                print(f"[{i}/{len(image_files)}] OK: {image_path.name} -> {output_path.name}")
            else:
                print(f"[{i}/{len(image_files)}] EMPTY: {image_path.name} (no text found)")

    print(f"\nDone! Processed: {success_count} success, {error_count} errors")
    print(f"Output directory: {output_dir}")


def process_single_file(image_path: Path):
    """Process a single image file and print/save the result."""
    print(f"Processing: {image_path}")

    _, text, error = extract_text(image_path)

    if error:
        print(f"Error: {error}")
        return

    if not text:
        print("No text found in image.")
        return

    # Save to .txt file next to the image
    output_path = image_path.with_suffix('.txt')
    output_path.write_text(text, encoding='utf-8')

    print(f"\n{'='*60}")
    print(f"Extracted text saved to: {output_path}")
    print(f"{'='*60}")
    print(text[:2000])  # Print first 2000 chars
    if len(text) > 2000:
        print(f"\n... (truncated, {len(text)} total characters)")


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    target = Path(sys.argv[1])

    if not target.exists():
        print(f"Error: Path does not exist: {target}")
        sys.exit(1)

    if target.is_file():
        process_single_file(target)
    else:
        process_directory(target)


if __name__ == "__main__":
    main()
