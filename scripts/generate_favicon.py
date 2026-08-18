from pathlib import Path
from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "client" / "public"
SOURCE = PUBLIC / "flowsites-logo.png"


def crop_mark(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    white = Image.new("RGBA", rgba.size, (255, 255, 255, 255))
    difference = ImageChops.difference(rgba, white).convert("RGB")
    bbox = difference.getbbox()
    if not bbox:
        return rgba
    left, top, right, bottom = bbox
    padding = max(4, round(max(right - left, bottom - top) * 0.06))
    return rgba.crop((max(0, left - padding), max(0, top - padding), min(rgba.width, right + padding), min(rgba.height, bottom + padding)))


def make_icon(mark: Image.Image, size: int) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), (255, 255, 255, 255))
    target = round(size * 0.88)
    mark_copy = mark.copy()
    mark_copy.thumbnail((target, target), Image.Resampling.LANCZOS)
    x = (size - mark_copy.width) // 2
    y = (size - mark_copy.height) // 2
    canvas.alpha_composite(mark_copy, (x, y))
    return canvas


def main() -> None:
    mark = crop_mark(Image.open(SOURCE))
    icon16 = make_icon(mark, 16)
    icon32 = make_icon(mark, 32)
    icon48 = make_icon(mark, 48)
    icon16.save(PUBLIC / "favicon-16.png", "PNG", optimize=True)
    icon32.save(PUBLIC / "favicon-32.png", "PNG", optimize=True)
    make_icon(mark, 180).save(PUBLIC / "apple-touch-icon.png", "PNG", optimize=True)
    make_icon(mark, 192).save(PUBLIC / "favicon-192.png", "PNG", optimize=True)
    icon32.save(PUBLIC / "favicon.ico", "ICO", sizes=[(16, 16), (32, 32), (48, 48)])


if __name__ == "__main__":
    main()
