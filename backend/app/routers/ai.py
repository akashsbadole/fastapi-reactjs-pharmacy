from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import User
from ..utils.auth import get_current_active_user
from ..services.ai_service import AIService
from ..schemas.ai import (
    MedicinePredictionRequest, MedicinePredictionResponse,
    UpcomingNeedsResponse, MedicineAlternativesRequest,
    MedicineAlternativesResponse
)

router = APIRouter()

@router.post("/predict-medicines", response_model=MedicinePredictionResponse)
async def predict_medicines(
    request: MedicinePredictionRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Predict medicines based on symptoms and patient history"""
    try:
        ai_service = AIService(db)
        predictions = ai_service.predict_medicines(
            symptoms=request.symptoms,
            patient_id=request.patient_id,
            limit=request.limit
        )
        
        return MedicinePredictionResponse(
            predictions=predictions,
            total_predictions=len(predictions),
            symptoms_analyzed=request.symptoms
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error predicting medicines: {str(e)}"
        )

@router.get("/predict-upcoming-needs", response_model=UpcomingNeedsResponse)
async def predict_upcoming_needs(
    days_ahead: int = 30,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Predict upcoming inventory needs based on historical data and trends"""
    try:
        ai_service = AIService(db)
        predictions = ai_service.predict_upcoming_needs(days_ahead=days_ahead)
        
        return UpcomingNeedsResponse(**predictions)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error predicting upcoming needs: {str(e)}"
        )

@router.post("/medicine-alternatives", response_model=MedicineAlternativesResponse)
async def get_medicine_alternatives(
    request: MedicineAlternativesRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get alternative medicines based on category and therapeutic effects"""
    try:
        ai_service = AIService(db)
        alternatives = ai_service.get_medicine_alternatives(
            medicine_id=request.medicine_id,
            limit=request.limit
        )
        
        return MedicineAlternativesResponse(
            original_medicine_id=request.medicine_id,
            alternatives=alternatives,
            total_alternatives=len(alternatives)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error getting medicine alternatives: {str(e)}"
        )

@router.get("/ai-status")
async def get_ai_status(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get AI service status and capabilities"""
    from ..models import Medicine, MedicineBatch
    
    # Get database statistics
    total_medicines = db.query(Medicine).filter(Medicine.is_active == True).count()
    total_inventory = db.query(MedicineBatch).count()
    
    return {
        "ai_enabled": True,
        "capabilities": [
            "Medicine prediction based on symptoms",
            "Upcoming inventory needs prediction",
            "Medicine alternatives recommendation"
        ],
        "database_stats": {
            "total_medicines": total_medicines,
            "total_inventory_items": total_inventory
        },
        "model_info": {
            "version": "1.0.0",
            "type": "Rule-based with statistical analysis",
            "last_updated": "2024-01-01"
        }
    }