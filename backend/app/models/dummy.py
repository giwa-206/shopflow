from sqlalchemy import Column, Integer, String
from app.database import Base

class DummyTest(Base):
    __tablename__ = "dummy_tests"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)