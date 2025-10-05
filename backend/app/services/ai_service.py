import json
import random
from typing import List, Dict, Optional, Tuple
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from ..models import Medicine, Prescription, Patient, MedicineBatch
from ..config import settings

class AIService:
    def __init__(self, db: Session):
        self.db = db
    
    def predict_medicines(self, symptoms: List[str], patient_id: Optional[int] = None, limit: int = 10) -> List[Dict]:
        """
        Predict medicines based on symptoms and patient history
        
        Args:
            symptoms: List of symptoms described by the patient
            patient_id: Optional patient ID to consider patient history
            limit: Maximum number of predictions to return
            
        Returns:
            List of predicted medicines with confidence scores
        """
        # Get all medicines from database
        medicines = self.db.query(Medicine).filter(Medicine.is_active == True).all()
        
        # If no medicines found, return empty list
        if not medicines:
            return []
        
        # Simple symptom-based matching (in a real implementation, this would use ML)
        predictions = []
        
        # Define symptom-medicine mapping (simplified for demo)
        symptom_medicine_map = {
            "fever": ["Paracetamol", "Ibuprofen", "Aspirin"],
            "headache": ["Paracetamol", "Ibuprofen", "Aspirin", "Naproxen"],
            "cough": ["Dextromethorphan", "Guaifenesin", "Bromhexine"],
            "cold": ["Pseudoephedrine", "Loratadine", "Cetirizine"],
            "pain": ["Paracetamol", "Ibuprofen", "Aspirin", "Naproxen", "Diclofenac"],
            "inflammation": ["Ibuprofen", "Naproxen", "Diclofenac"],
            "allergy": ["Loratadine", "Cetirizine", "Fexofenadine"],
            "nausea": ["Ondansetron", "Metoclopramide", "Domperidone"],
            "diarrhea": ["Loperamide", "Oral Rehydration Salts"],
            "constipation": ["Lactulose", "Bisacodyl", "Psyllium"],
            "insomnia": ["Diphenhydramine", "Zolpidem", "Melatonin"],
            "anxiety": ["Diazepam", "Alprazolam", "Sertraline"],
            "depression": ["Sertraline", "Fluoxetine", "Escitalopram"],
            "hypertension": ["Amlodipine", "Lisinopril", "Metoprolol"],
            "diabetes": ["Metformin", "Insulin", "Glimepiride"],
            "asthma": ["Salbutamol", "Fluticasone", "Montelukast"],
            "infection": ["Amoxicillin", "Azithromycin", "Ciprofloxacin"],
            "vomiting": ["Ondansetron", "Metoclopramide", "Domperidone"]
        }
        
        # Normalize symptoms to lowercase
        normalized_symptoms = [symptom.lower() for symptom in symptoms]
        
        # Score each medicine based on symptom matches
        medicine_scores = {}
        for medicine in medicines:
            score = 0
            medicine_name = medicine.name.lower()
            
            # Check if medicine name matches any symptom directly
            for symptom in normalized_symptoms:
                if symptom in medicine_name:
                    score += 5
                
                # Check if medicine is in the symptom mapping
                if medicine_name in [m.lower() for m in symptom_medicine_map.get(symptom, [])]:
                    score += 10
            
            # Add some randomness to simulate more complex AI prediction
            score += random.uniform(0, 3)
            
            if score > 0:
                medicine_scores[medicine] = score
        
        # If patient history is available, boost scores for previously prescribed medicines
        if patient_id:
            patient_prescriptions = self.db.query(Prescription).filter(
                Prescription.patient_id == patient_id
            ).all()
            
            prescribed_medicine_names = set()
            for prescription in patient_prescriptions:
                # This would need to be adjusted based on your prescription-medicine relationship
                prescribed_medicine_names.add(prescription.notes.lower() if prescription.notes else "")
            
            for medicine in medicine_scores:
                if medicine.name.lower() in prescribed_medicine_names:
                    medicine_scores[medicine] += 2  # Boost score for previously prescribed medicines
        
        # Sort by score and get top predictions
        sorted_medicines = sorted(medicine_scores.items(), key=lambda x: x[1], reverse=True)[:limit]
        
        # Convert to response format
        predictions = []
        max_score = max([score for _, score in sorted_medicines]) if sorted_medicines else 1
        
        for medicine, score in sorted_medicines:
            confidence = min(score / max_score, 1.0)  # Normalize confidence to 0-1
            
            # Get inventory information
            inventory = self.db.query(MedicineBatch).filter(MedicineBatch.medicine_id == medicine.id).first()
            stock_quantity = inventory.current_stock if inventory else medicine.stock_quantity
            
            predictions.append({
                "medicine_id": medicine.id,
                "name": medicine.name,
                "description": medicine.description,
                "category": medicine.category,
                "confidence": round(confidence, 2),
                "stock_quantity": stock_quantity,
                "in_stock": stock_quantity > 0,
                "reasoning": f"Matched {int(score)} symptom criteria"
            })
        
        return predictions
    
    def predict_upcoming_needs(self, days_ahead: int = 30) -> Dict:
        """
        Predict upcoming inventory needs based on historical data and trends
        
        Args:
            days_ahead: Number of days to predict ahead
            
        Returns:
            Dictionary with predictions for medicines that might need restocking
        """
        # Get current inventory
        inventory_items = self.db.query(MedicineBatch).filter(MedicineBatch.current_stock > 0).all()
        
        # Get recent prescriptions (last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        recent_prescriptions = self.db.query(Prescription).filter(
            Prescription.created_at >= thirty_days_ago
        ).all()
        
        # Calculate medicine usage from prescriptions
        medicine_usage = {}
        for prescription in recent_prescriptions:
            # This is a simplified approach - in reality, you'd parse prescription details
            # For now, we'll use a simple keyword matching approach
            if prescription.notes:
                # Extract medicine names from prescription notes (simplified)
                for inventory_item in inventory_items:
                    if inventory_item.medicine.name.lower() in prescription.notes.lower():
                        medicine_name = inventory_item.medicine.name
                        medicine_usage[medicine_name] = medicine_usage.get(medicine_name, 0) + 1
        
        # Predict future usage
        predictions = []
        for inventory_item in inventory_items:
            medicine_name = inventory_item.medicine.name
            current_stock = inventory_item.current_stock
            monthly_usage = medicine_usage.get(medicine_name, 0)
            
            # Simple linear prediction
            daily_usage = monthly_usage / 30 if monthly_usage > 0 else 0.1  # Default to small usage
            predicted_usage = daily_usage * days_ahead
            predicted_stock = current_stock - predicted_usage
            
            # Calculate urgency
            if predicted_stock <= 0:
                urgency = "critical"
                days_until_out = int(current_stock / daily_usage) if daily_usage > 0 else 0
            elif predicted_stock < 10:
                urgency = "high"
                days_until_out = int(predicted_stock / daily_usage) if daily_usage > 0 else days_ahead
            elif predicted_stock < 30:
                urgency = "medium"
                days_until_out = int(predicted_stock / daily_usage) if daily_usage > 0 else days_ahead
            else:
                urgency = "low"
                days_until_out = int(predicted_stock / daily_usage) if daily_usage > 0 else days_ahead
            
            # Only include medicines that might need attention
            if urgency in ["critical", "high", "medium"]:
                predictions.append({
                    "medicine_id": inventory_item.medicine.id,
                    "name": medicine_name,
                    "category": inventory_item.medicine.category,
                    "current_stock": current_stock,
                    "predicted_usage": int(predicted_usage),
                    "predicted_stock": max(0, int(predicted_stock)),
                    "urgency": urgency,
                    "days_until_out": days_until_out,
                    "recommended_order": max(50, int(predicted_usage * 2))  # Recommend ordering double the predicted usage
                })
        
        # Sort by urgency and days until out of stock
        urgency_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
        predictions.sort(key=lambda x: (urgency_order.get(x["urgency"], 4), x["days_until_out"]))
        
        return {
            "predictions": predictions,
            "analysis_date": datetime.utcnow().isoformat(),
            "prediction_period_days": days_ahead,
            "total_medicines_analyzed": len(inventory_items),
            "medicines_needing_attention": len(predictions)
        }
    
    def get_medicine_alternatives(self, medicine_id: int, limit: int = 5) -> List[Dict]:
        """
        Get alternative medicines based on category and therapeutic effects
        
        Args:
            medicine_id: ID of the medicine to find alternatives for
            limit: Maximum number of alternatives to return
            
        Returns:
            List of alternative medicines with similarity scores
        """
        # Get the original medicine
        medicine = self.db.query(Medicine).filter(Medicine.id == medicine_id).first()
        if not medicine:
            return []
        
        # Get medicines in the same category
        same_category_medicines = self.db.query(Medicine).filter(
            Medicine.category == medicine.category,
            Medicine.id != medicine_id,
            Medicine.is_active == True
        ).all()
        
        # Calculate similarity scores
        alternatives = []
        for alt_medicine in same_category_medicines:
            # Simple similarity based on category and name patterns
            similarity = 0.7  # Base similarity for same category
            
            # Check for similar name patterns (simplified)
            if medicine.name.split()[0] in alt_medicine.name:
                similarity += 0.2
            
            # Add some randomness to simulate more complex analysis
            similarity += random.uniform(0, 0.3)
            similarity = min(similarity, 1.0)  # Cap at 1.0
            
            # Get inventory information
            inventory = self.db.query(MedicineBatch).filter(MedicineBatch.medicine_id == alt_medicine.id).first()
            stock_quantity = inventory.current_stock if inventory else alt_medicine.stock_quantity
            
            alternatives.append({
                "medicine_id": alt_medicine.id,
                "name": alt_medicine.name,
                "description": alt_medicine.description,
                "category": alt_medicine.category,
                "similarity": round(similarity, 2),
                "stock_quantity": stock_quantity,
                "in_stock": stock_quantity > 0,
                "reasoning": f"Same category ({medicine.category}) with similar therapeutic effects"
            })
        
        # Sort by similarity and return top results
        alternatives.sort(key=lambda x: x["similarity"], reverse=True)
        return alternatives[:limit]