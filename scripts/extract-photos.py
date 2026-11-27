import base64
import re
from pathlib import Path

html = Path("FishGuesser.html").read_text(encoding="utf-8")
out = Path("src/content/photos")
out.mkdir(parents=True, exist_ok=True)


def strip_meta(data: bytes) -> bytes:
    if data[:2] != b"\xff\xd8":
        return data
    result = bytearray(data[:2])
    i = 2
    while i + 1 < len(data):
        if data[i] != 0xFF:
            result.extend(data[i:])
            break
        marker = data[i + 1]
        if marker == 0xDA:
            result.extend(data[i:])
            break
        if marker in (0xD0, 0xD1, 0xD2, 0xD3, 0xD4, 0xD5, 0xD6, 0xD7, 0xD8, 0x01):
            result.extend(data[i : i + 2])
            i += 2
            continue
        if i + 4 > len(data):
            break
        length = int.from_bytes(data[i + 2 : i + 4], "big")
        # Drop EXIF, XMP, Photoshop, and comments so the species name is not in the file.
        if marker in (0xE1, 0xE2, 0xED, 0xFE):
            i += 2 + length
            continue
        result.extend(data[i : i + 2 + length])
        i += 2 + length
    return bytes(result)


for key in ("pike", "perch", "cod", "bream", "salmon"):
    match = re.search(rf'"{key}":"data:image/jpeg;base64,([A-Za-z0-9+/=]+)"', html)
    if not match:
        raise SystemExit(f"missing {key}")
    raw = strip_meta(base64.b64decode(match.group(1)))
    (out / f"{key}.jpg").write_bytes(raw)
    print(key, len(raw), b"Esox" in raw, b"lucius" in raw.lower() if False else b"Esox" in raw)
