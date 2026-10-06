"""Seed script: creates an admin user + sample catalog.
Run from the backend folder:  python seed.py
Safe to run multiple times - it skips anything that already exists.
"""
from sqlalchemy.orm import Session

from app.database import SessionLocal, Base, engine
from app.models import User, Category, Product
from app.utils.security import get_password_hash

SAMPLE_CATEGORIES = [
    {"name": "Electronics", "description": "Phones, laptops and gadgets"},
    {"name": "Fashion", "description": "Clothing and accessories"},
    {"name": "Home & Kitchen", "description": "Everything for your home"},
]

SAMPLE_PRODUCTS = [
    {
        "name": "Wireless Headphones",
        "description": "Noise cancelling bluetooth headphones",
        "price": 79.99,
        "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
        "stock": 25,
        "category": "Electronics",
    },
    {
        "name": "Smart Watch",
        "description": "Fitness tracking with heart-rate monitor",
        "price": 129.50,
        "image_url": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
        "stock": 15,
        "category": "Electronics",
    },
    {
        "name": "Classic Sneakers",
        "description": "Comfortable everyday sneakers",
        "price": 59.99,
        "image_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
        "stock": 40,
        "category": "Fashion",
    },
    {
        "name": "Denim Jacket",
        "description": "Timeless blue denim jacket",
        "price": 89.00,
        "image_url": "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=600",
        "stock": 20,
        "category": "Fashion",
    },
    {
        "name": "Ceramic Mug Set",
        "description": "Set of 4 handmade ceramic mugs",
        "price": 34.99,
        "image_url": "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600",
        "stock": 30,
        "category": "Home & Kitchen",
    },
]


def seed():
    Base.metadata.create_all(bind=engine)  # safety net: ensures tables exist
    db: Session = SessionLocal()
    try:
        # 1. Admin user
        admin = db.query(User).filter(User.email == "admin@shopflow.com").first()
        if not admin:
            admin = User(
                email="admin@shopflow.com",
                hashed_password=get_password_hash("password123"),
                full_name="Shop Admin",
                role="admin",
                is_active=True,
            )
            db.add(admin)
            print("Created admin: admin@shopflow.com / password123")
        else:
            print("Admin already exists - skipping")

        # 2. Categories
        cat_ids = {}
        for cat in SAMPLE_CATEGORIES:
            existing = db.query(Category).filter(Category.name == cat["name"]).first()
            if existing:
                cat_ids[cat["name"]] = existing.id
            else:
                new_cat = Category(**cat)
                db.add(new_cat)
                db.flush()
                cat_ids[cat["name"]] = new_cat.id
                print(f"Created category: {cat['name']}")

        # 3. Products
        for prod in SAMPLE_PRODUCTS:
            if db.query(Product).filter(Product.name == prod["name"]).first():
                continue
            data = dict(prod)
            category_name = data.pop("category")
            db.add(Product(**data, category_id=cat_ids[category_name]))
            print(f"Created product: {data['name']}")

        db.commit()
        print("Seeding complete!")
    finally:
        db.close()


if __name__ == "__main__":
    seed()