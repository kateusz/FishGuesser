from pathlib import Path
p = Path("FishGuesser.html").read_text(encoding="utf-8")
i = p.find("const fishData")
print("idx", i)
print(p[i:i+2500])
print("---ASSETS---", p.find("const ASSETS"))
