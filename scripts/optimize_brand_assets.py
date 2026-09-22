#!/usr/bin/env python3
"""
Utility script to generate optimized web versions of brand assets from master logo.
Uses Pillow with LANCZOS resampling and PNG optimization, preserving RGBA transparency.
"""

from pathlib import Path
from PIL import Image

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
BRAND_DIR = PROJECT_ROOT / "frontend" / "mini-app" / "public" / "brand"
MASTER_FILE = BRAND_DIR / "tut-i-tam-logo-master.png"

SIZES = [256, 128, 64, 32]


def optimize_brand_assets():
    if not MASTER_FILE.exists():
        raise FileNotFoundError(f"Master file not found: {MASTER_FILE}")

    print(f"Loading master logo from {MASTER_FILE}...")
    with Image.open(MASTER_FILE) as img:
        img = img.convert("RGBA")
        width, height = img.size
        print(f"Master dimensions: {width}x{height}, mode={img.mode}")

        for size in SIZES:
            target_path = BRAND_DIR / f"tut-i-tam-logo-{size}.png"
            resized = img.resize((size, size), Image.Resampling.LANCZOS)
            resized.save(target_path, "PNG", optimize=True)
            file_kb = target_path.stat().st_size / 1024
            print(f"  -> Generated {target_path.name} ({size}x{size}px): {file_kb:.1f} KB")

    print("Brand assets optimization complete.")


if __name__ == "__main__":
    optimize_brand_assets()
