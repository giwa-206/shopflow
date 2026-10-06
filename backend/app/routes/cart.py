from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.cart import CartItemCreate, CartItemUpdate, CartResponse
from app.services import cart_service
from app.utils.security import get_current_active_user

router = APIRouter(prefix="/cart", tags=["Cart"])

@router.get("/", response_model=CartResponse)
def get_cart(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return cart_service.get_cart(db, current_user)

@router.post("/items", response_model=CartResponse, status_code=status.HTTP_201_CREATED)
def add_item(
    payload: CartItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return cart_service.add_item_to_cart(db, current_user, payload.product_id, payload.quantity)

@router.patch("/items/{item_id}", response_model=CartResponse)
def update_item(
    item_id: int,
    payload: CartItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return cart_service.update_item_quantity(db, current_user, item_id, payload.quantity)

@router.delete("/items/{item_id}", response_model=CartResponse)
def remove_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return cart_service.remove_item(db, current_user, item_id)

@router.delete("/", response_model=CartResponse)
def clear_cart(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return cart_service.clear_cart(db, current_user)