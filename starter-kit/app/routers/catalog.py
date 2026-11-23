"""Module 01: the product catalog. No AI yet."""
from fastapi import APIRouter, HTTPException

from .. import data

router = APIRouter(prefix="/api", tags=["catalog"])
FEATURES = ["catalog"]


@router.get("/products")
def list_products(category: str | None = None) -> list[dict]:
    items = data.products()
    if category:
        items = [p for p in items if p["category"].lower() == category.lower()]
    return items


@router.get("/products/{sku}")
def get_product(sku: str) -> dict:
    for p in data.products():
        if p["sku"].lower() == sku.lower():
            return p
    raise HTTPException(status_code=404, detail=f"No product with SKU {sku}.")


@router.get("/categories")
def list_categories() -> list[str]:
    seen: list[str] = []
    for p in data.products():
        if p["category"] not in seen:
            seen.append(p["category"])
    return seen
