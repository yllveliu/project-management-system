from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from app.database import engine, Base, get_db
from app.models.user import User
from app.models.project import Project
from app.models.task import Task
from app.routers import auth, project

app = FastAPI()

app.include_router(auth.router)
app.include_router(project.router)

Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"message": "Backend is working"}

@app.get("/test-db")
def test_db(db: Session = Depends(get_db)):
    return {"message": "Database session created successfully"}