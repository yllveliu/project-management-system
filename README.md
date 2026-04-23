# Project Management System

This project is a full-stack web application developed as part of a final diploma thesis. It provides a structured system for managing projects and tasks through a simple and efficient interface.

## Technologies

### Frontend
- React
- TypeScript
- Tailwind CSS

### Backend
- FastAPI (Python)

### Database
- SQLite (development)

## Features

- User registration and login
- Project creation and listing
- Task management with status tracking
- Kanban-style task board (To Do / In Progress / Done)
- REST API integration between frontend and backend

## Application Structure

- `/frontend` – React application  
- `/backend` – FastAPI application  
- `test.db` – SQLite database file  

## How to Run the Project

### Backend

```bash
cd backend
uvicorn main:app --reload

# Backend runs at:
# http://127.0.0.1:8000

cd frontend
npm install
npm run dev

# Frontend runs at:
# http://localhost:5173
```

## Notes
The project uses SQLite for simplicity during development.
Authentication is currently basic and can be extended with token-based security.
The UI is built using Tailwind CSS with a focus on clean and professional design.

## Purpose

The goal of this project is to demonstrate full-stack development skills, including:

frontend development with React
backend API design with FastAPI
database integration
building a functional user interface
