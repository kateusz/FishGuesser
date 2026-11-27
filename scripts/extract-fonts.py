"""Pull WOFF2 faces out of FishGuesser.html. No CDN."""

import base64
import re
from pathlib import Path

html = Path("FishGuesser.html").read_text(encoding="utf-8")
style = html[html.find("<style>") + 7 : html.find("</style>")]
out = Path("src/fonts")
out.mkdir(parents=True, exist_ok=True)

faces = re.findall(
    r"font-family:\s*'([^']+)';\s*font-style:\s*(\w+);\s*font-weight:\s*(\d+);.*?url\(data:font/woff2;base64,([A-Za-z0-9+/=]+)\)",
    style,
    re.S,
)
assert len(faces) >= 3, len(faces)

slug = {"Bangers": "Bangers", "Comic Neue": "ComicNeue", "Nunito": "Nunito"}
canonical = {"Bangers": "400", "Comic Neue": "700", "Nunito": "400"}

for family, _font_style, weight, b64 in faces:
    stem = slug[family]
    data = base64.b64decode(b64)
    path = out / f"{stem}-{weight}.woff2"
    path.write_bytes(data)
    if weight == canonical[family]:
        (out / f"{stem}.woff2").write_bytes(data)
    print(f"{stem}-{weight}", len(data))
