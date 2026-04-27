from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.database import engine, Base, get_db
from app.models.user import User
from app.models.project import Project
from app.models.task import Task
from app.models.comment import Comment
from app.models.activity import Activity
from app.routers import auth, project, task, user, comment, activity, dashboard

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(project.router)
app.include_router(task.router)
app.include_router(user.router)
app.include_router(comment.router)
app.include_router(activity.router)
app.include_router(dashboard.router)


@app.get("/")
def root():
    return {"message": "Backend is working"}


@app.get("/test-db")
def test_db(db: Session = Depends(get_db)):
    return {"message": "Database session created successfully"}

