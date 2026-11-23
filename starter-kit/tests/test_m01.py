"""Module 01 check: the app starts, the catalog works, and AI features are still locked.

Run from the starter-kit folder:  pytest tests/test_m01.py
"""
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    assert client.get("/api/health").json()["status"] == "ok"


def test_catalog_has_40_products():
    products = client.get("/api/products").json()
    assert len(products) == 40
    assert all(p["price_nok"] > 0 for p in products)


def test_one_product_and_its_manual():
    tent = client.get("/api/products/TNT-201").json()
    assert tent["name"] == "Skarvo Stormhytte 2"
    assert client.get(tent["manual"]["url"]).status_code == 200


def test_product_photo_is_served():
    tent = client.get("/api/products/TNT-201").json()
    assert client.get(tent["image"]).status_code == 200


def test_unknown_product_gives_404():
    assert client.get("/api/products/NOPE-000").status_code == 404


def test_order_lookup():
    assert client.get("/api/orders/NP-2026-00105").json()["total_nok"] == 2799


def test_only_the_catalog_is_unlocked():
    enabled = [f["id"] for f in client.get("/api/features").json() if f["enabled"]]
    assert enabled == ["catalog"]


def test_website_is_served():
    assert "Northpine" in client.get("/").text
