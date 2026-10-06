from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, ConfigDict

class CartItemCreate(BaseModel):
    product_id: int
    quantity: int = 1

class CartItemUpdate(BaseModel):
    quantity: int

class CartItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    product_image_url: Optional[str] = None
    unit_price: Decimal      # computed by backend from DB
    quantity: int
    line_total: Decimal      # computed by backend: unit_price * quantity
    model_config = ConfigDict(from_attributes=True)

class CartResponse(BaseModel):
    id: int
    items: List[CartItemResponse]
    total_quantity: int      # computed by backend
    subtotal: Decimal        # computed by backend
    model_config = ConfigDict(from_attributes=True)