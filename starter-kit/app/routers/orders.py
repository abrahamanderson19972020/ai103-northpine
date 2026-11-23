"""Module 01: a mock order system. In Module 09 the agents call it as a tool.

This is a training API. It has no sign-in, so never put real customer data behind it.
"""
from fastapi import APIRouter, HTTPException

from .. import data

router = APIRouter(prefix="/api", tags=["orders"])


@router.get("/orders/{order_id}")
def get_order(order_id: str) -> dict:
    for o in data.orders():
        if o["order_id"].lower() == order_id.lower():
            return o
    raise HTTPException(status_code=404, detail=f"No order with number {order_id}.")
