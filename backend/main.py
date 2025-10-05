from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
import uvicorn

from app.database import get_db
from app.routers import auth, inventory, prescriptions, patients, billing, reports, pos, audit, support, subscription, notifications, sms, ai, payments
from app.routers.settings import router as settings_router
from app.config import settings

app = FastAPI(
    title="Pharmacy Management System",
    description="A comprehensive pharmacy management system built with FastAPI",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(inventory.router, prefix="/api/inventory", tags=["inventory"])
app.include_router(prescriptions.router, prefix="/api/prescriptions", tags=["prescriptions"])
app.include_router(patients.router, prefix="/api/patients", tags=["patients"])
app.include_router(billing.router, prefix="/api/billing", tags=["billing"])
app.include_router(pos.router, prefix="/api/pos", tags=["pos"])
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])
app.include_router(audit.router, prefix="/api/audit", tags=["audit"])
app.include_router(support.router, prefix="/api/support", tags=["support"])
app.include_router(subscription.router, prefix="/api/subscription", tags=["subscription"])
app.include_router(notifications.router, prefix="/api", tags=["notifications"])
app.include_router(sms.router, prefix="/api/sms", tags=["sms"])
app.include_router(ai.router, prefix="/api/ai", tags=["ai"])
app.include_router(payments.router, prefix="/api/payments", tags=["payments"])
app.include_router(settings_router, prefix="/api", tags=["settings"])

@app.get("/")
async def root():
    return {"message": "Pharmacy Management System API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/test")
async def test():
    return {"message": "Test endpoint working"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)