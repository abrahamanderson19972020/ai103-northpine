"""Loads the fictional shop data from the data folder."""
import json
from functools import lru_cache

from .config import DATA_DIR


def _load(name: str):
    with open(DATA_DIR / name, encoding="utf-8") as f:
        return json.load(f)


@lru_cache
def products() -> list[dict]:
    manuals = {m["manual_id"]: m for m in _load("manuals/index.json")}
    items = _load("products.json")
    for p in items:
        manual = manuals.get(p.get("manual_id"))
        # The website can link to the manual PDF, if the product has one.
        p["manual"] = (
            {"title": manual["title"], "url": "/files/" + manual["file"]} if manual else None
        )
        # Product photo, if one exists in data/images. The file name is the SKU.
        image = DATA_DIR / "images" / f"{p['sku']}.webp"
        p["image"] = f"/files/images/{p['sku']}.webp" if image.exists() else None
    return items


@lru_cache
def orders() -> list[dict]:
    return _load("orders.json")


@lru_cache
def customers() -> list[dict]:
    return _load("customers.json")
