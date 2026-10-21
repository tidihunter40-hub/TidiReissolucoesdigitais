"""Download and optimize Unsplash demonstration photos for TidiReis Studio.

Source IDs and license: https://unsplash.com/license
The deployed simulator uses only the resulting local WebP files.
"""

from io import BytesIO
from pathlib import Path
from urllib.request import Request, urlopen

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1] / "assets" / "studio"
PHOTOS = {
    "furniture": ("1600210492486-724fe5c67fb0", "1600607687939-ce8a6c25118c"),
    "fashion": ("1490481651871-ab68de25d43d", "1687481795360-77c1115d26c6"),
    "restaurant": ("1517248135467-4c7edcad34c4", "1547592180-85f173990554"),
    "barbershop": ("1503951914875-452162b0f3f1", "1599351431202-1e0f0137899a"),
    "beauty": ("1560066984-138dadb4c035", "1522335789203-aabd1fc54bc9"),
    "automotive": ("1492144534655-ae79c964c9d7", "1503376780353-7e6692767b70"),
    "clinic": ("1538108149393-fbbd81895907", "1519494026892-80bbd2d6fd0d"),
    "technology": ("1498050108023-c5249f4df085", "1518770660439-4636190af475"),
    "fitness": ("1534438327276-14e5300c3a48", "1517836357463-d25dfeac3438"),
    "services": ("1581091226825-a6a2a5aee158", "1521737711867-e3b97375f902"),
}


def main():
    ROOT.mkdir(parents=True, exist_ok=True)
    for segment, ids in PHOTOS.items():
        for index, photo_id in enumerate(ids):
            target = ROOT / f"{segment}-{index + 1}.webp"
            if target.exists():
                continue
            width = 1440 if index == 0 else 800
            url = f"https://images.unsplash.com/photo-{photo_id}?auto=format&fit=crop&w={width}&q=80"
            request = Request(url, headers={"User-Agent": "Mozilla/5.0 (TidiReis Studio asset preparation)"})
            with urlopen(request, timeout=30) as response:
                data = response.read()
            with Image.open(BytesIO(data)) as source:
                image = ImageOps.exif_transpose(source).convert("RGB")
                image.thumbnail((width, 1100 if index == 0 else 800), Image.Resampling.LANCZOS)
                image.save(target, "WEBP", quality=78, method=6)
            print(f"{target.relative_to(ROOT.parent.parent)} {target.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
