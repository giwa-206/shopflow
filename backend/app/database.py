from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from app.config import settings

# future=True enables SQLAlchemy 2.0 style.
# pool_pre_ping guards against stale connections after DB restarts.
engine = create_engine(
    settings.DATABASE_URL,
    future=True,
    pool_pre_ping=True,
    echo=settings.DEBUG,  # logs SQL in dev; turn off in prod
)

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
    future=True,
)


class Base(DeclarativeBase):
    """All ORM models will inherit from this."""
    pass


def get_db():
    """FastAPI dependency that yields a DB session and closes it afterwards."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()