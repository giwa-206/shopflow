from decimal import Decimal

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.cart import Cart, CartItem
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.user import User


def checkout(db: Session, user: User) -> dict:
    """
    The full checkout transaction:
    1. Validate cart  2. Lock & verify stock  3. Calculate totals
    4. Create order   5. Create order items   6. Reduce stock
    7. Clear cart
    All-or-nothing: any failure rolls everything back.
    """
    # 1. Validate cart
    cart = db.query(Cart).filter(Cart.user_id == user.id).first()
    if not cart or not cart.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    try:
        # 2. Lock product rows so two simultaneous checkouts can't
        #    oversell the same stock
        product_ids = [item.product_id for item in cart.items]
        products = (
            db.query(Product)
            .filter(Product.id.in_(product_ids))
            .with_for_update()
            .all()
        )
        products_dict = {p.id: p for p in products}

        # 3. Verify stock + calculate totals (server-side only)
        subtotal = Decimal("0")
        total_quantity = 0
        items_data = []

        for cart_item in cart.items:
            product = products_dict.get(cart_item.product_id)
            if not product:
                raise HTTPException(status_code=404, detail=f"Product {cart_item.product_id} no longer exists")

            if product.stock < cart_item.quantity:
                raise HTTPException(
                    status_code=400,
                    detail=f"Not enough stock for '{product.name}'. Available: {product.stock}, requested: {cart_item.quantity}"
                )

            line_total = product.price * cart_item.quantity
            subtotal += line_total
            total_quantity += cart_item.quantity

            items_data.append({
                "product_id": product.id,
                "quantity": cart_item.quantity,
                "unit_price": product.price,
                "line_total": line_total,
            })

            # 6. Reduce stock (inside the same transaction)
            product.stock -= cart_item.quantity

        # 4. Create the order
        new_order = Order(
            user_id=user.id,
            status="pending",
            total_quantity=total_quantity,
            subtotal=subtotal,
        )
        db.add(new_order)
        db.flush()  # assigns new_order.id without committing yet

        # 5. Create order items
        for item_data in items_data:
            db.add(OrderItem(order_id=new_order.id, **item_data))

        # 7. Clear the cart
        db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()

        # Commit EVERYTHING at once
        db.commit()
        db.refresh(new_order)
        return _format_order(new_order, db)

    except HTTPException:
        db.rollback()  # undo partial work, re-raise the clean error
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Checkout failed: {str(e)}")


def get_user_orders(db: Session, user: User) -> list:
    orders = (
        db.query(Order)
        .filter(Order.user_id == user.id)
        .order_by(Order.created_at.desc())
        .all()
    )
    return [_format_order(o, db) for o in orders]


def get_user_order(db: Session, user: User, order_id: int) -> dict:
    # Ownership check: customers can ONLY see their own orders
    order = (
        db.query(Order)
        .filter(Order.id == order_id, Order.user_id == user.id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return _format_order(order, db)


def get_all_orders(db: Session) -> list:
    orders = db.query(Order).order_by(Order.created_at.desc()).all()
    return [_format_order(o, db) for o in orders]


def update_order_status(db: Session, order_id: int, new_status: str) -> dict:
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = new_status
    db.commit()
    db.refresh(order)
    return _format_order(order, db)


def _format_order(order: Order, db: Session) -> dict:
    items = []
    for item in order.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        items.append({
            "id": item.id,
            "product_id": item.product_id,
            "product_name": product.name if product else "Deleted product",
            "quantity": item.quantity,
            "unit_price": item.unit_price,
            "line_total": item.line_total,
        })
    return {
        "id": order.id,
        "user_id": order.user_id,
        "status": order.status,
        "total_quantity": order.total_quantity,
        "subtotal": order.subtotal,
        "created_at": order.created_at,
        "updated_at": order.updated_at,
        "items": items,
    }