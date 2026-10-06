from decimal import Decimal
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.cart import Cart, CartItem
from app.models.product import Product
from app.models.user import User

def get_or_create_cart(db: Session, user: User) -> Cart:
    cart = db.query(Cart).filter(Cart.user_id == user.id).first()
    if not cart:
        cart = Cart(user_id=user.id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    return cart

def _build_cart_response(db: Session, cart: Cart) -> dict:
    """Calculate ALL money values here on the backend."""
    items = []
    subtotal = Decimal("0")
    total_quantity = 0

    for item in cart.items:
        product = item.product
        line_total = product.price * item.quantity
        subtotal += line_total
        total_quantity += item.quantity
        items.append({
            "id": item.id,
            "product_id": product.id,
            "product_name": product.name,
            "product_image_url": product.image_url,
            "unit_price": product.price,
            "quantity": item.quantity,
            "line_total": line_total,
        })

    return {
        "id": cart.id,
        "items": items,
        "total_quantity": total_quantity,
        "subtotal": subtotal,
    }

def get_cart(db: Session, user: User) -> dict:
    cart = get_or_create_cart(db, user)
    return _build_cart_response(db, cart)

def add_item_to_cart(db: Session, user: User, product_id: int, quantity: int) -> dict:
    if quantity < 1:
        raise HTTPException(status_code=400, detail="Quantity must be at least 1")

    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.stock < 1:
        raise HTTPException(status_code=400, detail="Product is out of stock")

    cart = get_or_create_cart(db, user)
    item = (
        db.query(CartItem)
        .filter(CartItem.cart_id == cart.id, CartItem.product_id == product_id)
        .first()
    )

    new_quantity = (item.quantity + quantity) if item else quantity

    # Stock validation happens HERE, on the server
    if new_quantity > product.stock:
        raise HTTPException(
            status_code=400,
            detail=f"Only {product.stock} unit(s) of '{product.name}' in stock"
        )

    if item:
        item.quantity = new_quantity
    else:
        item = CartItem(cart_id=cart.id, product_id=product_id, quantity=new_quantity)
        db.add(item)

    db.commit()
    return _build_cart_response(db, cart)

def update_item_quantity(db: Session, user: User, item_id: int, quantity: int) -> dict:
    if quantity < 1:
        raise HTTPException(status_code=400, detail="Quantity must be at least 1")

    cart = get_or_create_cart(db, user)
    item = db.query(CartItem).filter(CartItem.id == item_id).first()

    if not item or item.cart_id != cart.id:
        raise HTTPException(status_code=404, detail="Cart item not found")

    if quantity > item.product.stock:
        raise HTTPException(
            status_code=400,
            detail=f"Only {item.product.stock} unit(s) of '{item.product.name}' in stock"
        )

    item.quantity = quantity
    db.commit()
    return _build_cart_response(db, cart)

def remove_item(db: Session, user: User, item_id: int) -> dict:
    cart = get_or_create_cart(db, user)
    item = db.query(CartItem).filter(CartItem.id == item_id).first()

    if not item or item.cart_id != cart.id:
        raise HTTPException(status_code=404, detail="Cart item not found")

    db.delete(item)
    db.commit()
    return _build_cart_response(db, cart)

def clear_cart(db: Session, user: User) -> dict:
    cart = get_or_create_cart(db, user)
    db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
    db.commit()
    return _build_cart_response(db, cart)