"""Wspólny kształt rekordu seeda katalogu ryb."""


def row(
    id_: str,
    name_pl: str,
    latin: str,
    family: str,
    pools: str,
    weight_kg: float,
    price: int,
    form: str,
    hint: str,
    fact: str,
    region: str,
) -> dict:
    if price <= 0:
        price = 15
    if form == "—":
        form = "tusza świeża (rzadko)"
    return {
        "id": id_,
        "namePl": name_pl,
        "nameLatin": latin,
        "family": family,
        "pools": [p.strip() for p in pools.split(",")],
        "weightKg": weight_kg,
        "weightNote": "Masa orientacyjna osobnika dorosłego, nie ze zdjęcia.",
        "weightHint": hint,
        "pricePln": price,
        "productForm": form,
        "funFact": fact,
        "regionNote": region,
    }