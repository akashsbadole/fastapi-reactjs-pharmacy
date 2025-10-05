from pydantic import BaseModel
from typing import List, Optional, Dict

class MedicinePrediction(BaseModel):
    medicine_id: int
    name: str
    description: Optional[str]
    category: Optional[str]
    confidence: float
    stock_quantity: int
    in_stock: bool
    reasoning: str

class MedicinePredictionRequest(BaseModel):
    symptoms: List[str]
    patient_id: Optional[int] = None
    limit: int = 10

class MedicinePredictionResponse(BaseModel):
    predictions: List[MedicinePrediction]
    total_predictions: int
    symptoms_analyzed: List[str]

class UpcomingNeedPrediction(BaseModel):
    medicine_id: int
    name: str
    category: Optional[str]
    current_stock: int
    predicted_usage: int
    predicted_stock: int
    urgency: str  # critical, high, medium, low
    days_until_out: int
    recommended_order: int

class UpcomingNeedsResponse(BaseModel):
    predictions: List[UpcomingNeedPrediction]
    analysis_date: str
    prediction_period_days: int
    total_medicines_analyzed: int
    medicines_needing_attention: int

class MedicineAlternative(BaseModel):
    medicine_id: int
    name: str
    description: Optional[str]
    category: Optional[str]
    similarity: float
    stock_quantity: int
    in_stock: bool
    reasoning: str

class MedicineAlternativesRequest(BaseModel):
    medicine_id: int
    limit: int = 5

class MedicineAlternativesResponse(BaseModel):
    original_medicine_id: int
    alternatives: List[MedicineAlternative]
    total_alternatives: int