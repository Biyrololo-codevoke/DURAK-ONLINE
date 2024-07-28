import os

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base


Base = declarative_base()
engine = create_engine(os.getenv("DATABASE_URI"))
Session = sessionmaker(bind=engine)
session = Session()
