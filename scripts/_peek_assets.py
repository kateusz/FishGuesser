from pathlib import Path
p = Path("FishGuesser.html").read_text(encoding="utf-8")
i = p.find("const ASSETS")
print(p[i:i+500])
print("---")
j = p.find("ASSETS=", i)
print("eq", j)
# find keys
import re
chunk = p[i:i+200]
print(chunk)
# count data urls near ASSETS
k = p.find("{", i)
print("brace", k, p[k:k+80])
