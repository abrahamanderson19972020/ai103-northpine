"""The feature map of Northpine Basecamp.

Every feature of the shop belongs to one course module. A feature is "locked"
until its router file exists in app/routers and lists the feature id in FEATURES.
The website reads /api/features and shows locked features with their module number.
"""
import importlib
import pkgutil

from fastapi import FastAPI

FEATURES = [
    # id, module, area, title, summary
    ("catalog", 1, "shop", "Product catalog", "Browse 40 products with prices, weights and specs."),
    ("chat", 3, "chat", "Gear Guide chat", "Ask a model about gear. First answers, no shop knowledge yet."),
    ("search", 5, "shop", "Smart search", "Search the catalog, manuals and policy by meaning, not only by words."),
    ("rag", 6, "chat", "Answers with sources", "The Gear Guide answers from the manuals and shows where each answer comes from."),
    ("quality", 7, "staff", "Quality scores", "Test questions scored for groundedness, relevance and safety."),
    ("agent", 8, "chat", "Gear Guide agent", "The chat becomes an agent that can call functions."),
    ("tools", 9, "chat", "Stock check and memory", "The agent checks stock and orders, and remembers your sizes."),
    ("returns", 10, "returns", "Returns with approval", "Upload a receipt. Refunds above 1,500 NOK wait for staff."),
    ("frontdesk", 11, "chat", "Front Desk", "One entry point that sends each request to the right agent."),
    ("selfcheck", 12, "chat", "Self-check", "Answers are checked against the sources before they are shown."),
    ("specsheets", 13, "staff", "Listing from a spec sheet", "Upload a supplier PDF and get a draft product listing."),
    ("vision", 14, "chat", "Photo questions", "Upload a photo and ask about it. Alt text for product images."),
    ("images", 15, "staff", "Product images", "Generate and edit product images."),
    ("video", 16, "staff", "Product video", "Generate a short product clip."),
    ("reviews", 17, "staff", "Review insights", "Sentiment, topics and translation for customer reviews."),
    ("voice", 18, "chat", "Voice", "Talk to the Gear Guide in English, Norwegian or German."),
    ("guardrails", 19, "staff", "Guardrails", "Blocked attacks and unsafe content, with the reason."),
    ("traces", 20, "staff", "Traces and cost", "Follow one request across all agents, with tokens and time."),
]

_enabled: set[str] = set()


def include_routers(app: FastAPI) -> None:
    """Find every module in app/routers, add its router, and unlock its features."""
    from . import routers

    for info in pkgutil.iter_modules(routers.__path__):
        module = importlib.import_module(f"{routers.__name__}.{info.name}")
        if hasattr(module, "router"):
            app.include_router(module.router)
            _enabled.update(getattr(module, "FEATURES", []))


def feature_list() -> list[dict]:
    return [
        {"id": fid, "module": module, "area": area, "title": title, "summary": summary, "enabled": fid in _enabled}
        for fid, module, area, title, summary in FEATURES
    ]
