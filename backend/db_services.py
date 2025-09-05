from sqlalchemy import create_engine, Column, Integer, String, ForeignKey,Boolean, DateTime, Date, Float, Numeric, Text 
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from pydantic import BaseModel, Field, validator
from typing import Annotated, Union 
from typing import List, Optional
from datetime import datetime, date


def init():
    DATABASE_URL = "postgresql://postgres:root@localhost:5432/enndata360"
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
    Base = declarative_base()
    return SessionLocal, Base, engine


SessionLocal, Base, engine = init()



class AuthRequest(BaseModel):
    email: str
    password: str


class RoleMaster(Base):
    __tablename__ = "dim_master_role"
    role_id = Column(Integer, primary_key=True, index=True)
    role_name = Column(String)
    # status = Column(Integer)
    # created_date = Column(Date)
    # modified_date = Column(DateTime)
    description = Column(String)
    #relationship
    users = relationship("DimUser", back_populates="role")



class DimUser(Base):
    __tablename__ = "dim_user"
    user_id = Column(Integer, primary_key=True, index=True)
    user_name = Column(String)
    role_id = Column(Integer, ForeignKey("dim_master_role.role_id"))
    status = Column(Integer)
    created_date = Column(Date)
    modified_date = Column(DateTime)
    email_id = Column(String, unique=True)
    password = Column(String)
    encrypted_password = Column(String)
    #relationship
    role = relationship("RoleMaster", back_populates="users")
