from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.order import OrderResponse, OrderStatusUpdate
from app.services import order_service
from app.utils.security import get_current_admin_user

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/orders", response_model=list[OrderResponse])
def get_all_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    return order_service.get_all_orders(db)


@router.patch("/orders/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: int,
    payload: OrderStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    return order_service.update_order_status(db, order_id, payload.status)