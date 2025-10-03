from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models import Medicine, MedicineBatch, Supplier, Base
from datetime import date, timedelta
import random

# Create tables
Base.metadata.create_all(bind=engine)

def create_demo_inventory():
    db = SessionLocal()
    try:
        # Check if medicines already exist
        existing_medicine = db.query(Medicine).first()
        if existing_medicine:
            print("Medicines already exist in database")
            return
        
        # Create suppliers
        suppliers = []
        supplier_data = [
            {"name": "MediSupply Corp", "contact_person": "John Smith", "phone": "1234567890", "email": "info@medisupply.com"},
            {"name": "PharmaSource Ltd", "contact_person": "Jane Doe", "phone": "0987654321", "email": "info@pharmasource.com"},
            {"name": "Global Health Imports", "contact_person": "Bob Johnson", "phone": "5555555555", "email": "info@globalhealth.com"}
        ]
        
        for data in supplier_data:
            supplier = Supplier(**data)
            db.add(supplier)
            suppliers.append(supplier)
        
        db.commit()
        print("Created demo suppliers")
        
        # Create medicines with batches
        medicines_data = [
            {
                "name": "Paracetamol 500mg",
                "generic_name": "Paracetamol",
                "brand": "MediCare",
                "category": "Analgesic",
                "dosage_form": "Tablet",
                "strength": "500mg",
                "manufacturer": "MediCare Pharma",
                "requires_prescription": False,
                "sku": "PAR500-100",
                "barcode": "123456789001",
                "pack_size": "10 tablets",
                "mrp": 15.0,
                "purchase_price": 10.0,
                "selling_price": 12.0,
                "tax_percent": 5.0,
                "stock_quantity": 100,
                "reorder_level": 20,
                "schedule": "H1"
            },
            {
                "name": "Amoxicillin 500mg",
                "generic_name": "Amoxicillin",
                "brand": "BioPharm",
                "category": "Antibiotic",
                "dosage_form": "Capsule",
                "strength": "500mg",
                "manufacturer": "BioPharm Inc",
                "requires_prescription": True,
                "sku": "AMX500-50",
                "barcode": "123456789002",
                "pack_size": "10 capsules",
                "mrp": 80.0,
                "purchase_price": 60.0,
                "selling_price": 70.0,
                "tax_percent": 5.0,
                "stock_quantity": 50,
                "reorder_level": 15,
                "schedule": "H"
            },
            {
                "name": "Ibuprofen 400mg",
                "generic_name": "Ibuprofen",
                "brand": "PainRelief",
                "category": "Analgesic",
                "dosage_form": "Tablet",
                "strength": "400mg",
                "manufacturer": "PainRelief Labs",
                "requires_prescription": False,
                "sku": "IBU400-100",
                "barcode": "123456789003",
                "pack_size": "10 tablets",
                "mrp": 25.0,
                "purchase_price": 18.0,
                "selling_price": 20.0,
                "tax_percent": 5.0,
                "stock_quantity": 80,
                "reorder_level": 20,
                "schedule": "H1"
            },
            {
                "name": "Omeprazole 20mg",
                "generic_name": "Omeprazole",
                "brand": "GastroCare",
                "category": "Antacid",
                "dosage_form": "Capsule",
                "strength": "20mg",
                "manufacturer": "GastroCare Pharma",
                "requires_prescription": True,
                "sku": "OME20-30",
                "barcode": "123456789004",
                "pack_size": "30 capsules",
                "mrp": 120.0,
                "purchase_price": 90.0,
                "selling_price": 100.0,
                "tax_percent": 5.0,
                "stock_quantity": 40,
                "reorder_level": 10,
                "schedule": "H"
            },
            {
                "name": "Cetirizine 10mg",
                "generic_name": "Cetirizine",
                "brand": "AllerFree",
                "category": "Antihistamine",
                "dosage_form": "Tablet",
                "strength": "10mg",
                "manufacturer": "AllerFree Labs",
                "requires_prescription": False,
                "sku": "CET10-100",
                "barcode": "123456789005",
                "pack_size": "10 tablets",
                "mrp": 35.0,
                "purchase_price": 25.0,
                "selling_price": 30.0,
                "tax_percent": 5.0,
                "stock_quantity": 60,
                "reorder_level": 15,
                "schedule": "H1"
            },
            {
                "name": "Metformin 500mg",
                "generic_name": "Metformin",
                "brand": "DiaControl",
                "category": "Antidiabetic",
                "dosage_form": "Tablet",
                "strength": "500mg",
                "manufacturer": "DiaControl Pharma",
                "requires_prescription": True,
                "sku": "MET500-100",
                "barcode": "123456789006",
                "pack_size": "10 tablets",
                "mrp": 45.0,
                "purchase_price": 35.0,
                "selling_price": 40.0,
                "tax_percent": 5.0,
                "stock_quantity": 70,
                "reorder_level": 20,
                "schedule": "H"
            },
            {
                "name": "Azithromycin 250mg",
                "generic_name": "Azithromycin",
                "brand": "ZithroMax",
                "category": "Antibiotic",
                "dosage_form": "Tablet",
                "strength": "250mg",
                "manufacturer": "ZithroMax Labs",
                "requires_prescription": True,
                "sku": "AZI250-50",
                "barcode": "123456789007",
                "pack_size": "6 tablets",
                "mrp": 90.0,
                "purchase_price": 70.0,
                "selling_price": 80.0,
                "tax_percent": 5.0,
                "stock_quantity": 30,
                "reorder_level": 10,
                "schedule": "H"
            },
            {
                "name": "Vitamin D3 1000 IU",
                "generic_name": "Vitamin D3",
                "brand": "VitaHealth",
                "category": "Supplement",
                "dosage_form": "Capsule",
                "strength": "1000 IU",
                "manufacturer": "VitaHealth Inc",
                "requires_prescription": False,
                "sku": "VITD1000-60",
                "barcode": "123456789008",
                "pack_size": "60 capsules",
                "mrp": 200.0,
                "purchase_price": 150.0,
                "selling_price": 170.0,
                "tax_percent": 5.0,
                "stock_quantity": 50,
                "reorder_level": 15,
                "schedule": "H1"
            },
            {
                "name": "Aspirin 75mg",
                "generic_name": "Aspirin",
                "brand": "HeartCare",
                "category": "Antiplatelet",
                "dosage_form": "Tablet",
                "strength": "75mg",
                "manufacturer": "HeartCare Pharma",
                "requires_prescription": False,
                "sku": "ASP75-100",
                "barcode": "123456789009",
                "pack_size": "100 tablets",
                "mrp": 50.0,
                "purchase_price": 35.0,
                "selling_price": 40.0,
                "tax_percent": 5.0,
                "stock_quantity": 100,
                "reorder_level": 25,
                "schedule": "H1"
            },
            {
                "name": "Losartan 50mg",
                "generic_name": "Losartan",
                "brand": "PressurEase",
                "category": "Antihypertensive",
                "dosage_form": "Tablet",
                "strength": "50mg",
                "manufacturer": "PressurEase Labs",
                "requires_prescription": True,
                "sku": "LOS50-30",
                "barcode": "123456789010",
                "pack_size": "30 tablets",
                "mrp": 150.0,
                "purchase_price": 110.0,
                "selling_price": 125.0,
                "tax_percent": 5.0,
                "stock_quantity": 40,
                "reorder_level": 10,
                "schedule": "H"
            }
        ]
        
        medicines = []
        for data in medicines_data:
            medicine = Medicine(**data)
            db.add(medicine)
            medicines.append(medicine)
        
        db.commit()
        print("Created demo medicines")
        
        # Create batches for each medicine
        for i, medicine in enumerate(medicines):
            # Create 1-3 batches for each medicine
            num_batches = random.randint(1, 3)
            
            for j in range(num_batches):
                # Generate batch number
                batch_number = f"BATCH{medicine.id:03d}{j+1:02d}"
                
                # Random manufacture date (within last year)
                manufacture_date = date.today() - timedelta(days=random.randint(30, 365))
                
                # Random expiry date (1-3 years from manufacture date)
                expiry_date = manufacture_date + timedelta(days=random.randint(365, 1095))
                
                # Random quantity and stock
                quantity = random.randint(50, 200)
                current_stock = random.randint(10, quantity)
                
                # Random cost and selling prices (within range)
                cost_price = medicine.purchase_price * random.uniform(0.9, 1.1)
                selling_price = medicine.selling_price * random.uniform(0.95, 1.05)
                
                # Random supplier
                supplier = random.choice(suppliers)
                
                batch = MedicineBatch(
                    batch_number=batch_number,
                    medicine_id=medicine.id,
                    supplier_id=supplier.id,
                    quantity=quantity,
                    current_stock=current_stock,
                    cost_price=round(cost_price, 2),
                    selling_price=round(selling_price, 2),
                    manufacture_date=manufacture_date,
                    expiry_date=expiry_date,
                    low_stock_threshold=medicine.reorder_level
                )
                
                db.add(batch)
            
            print(f"Created {num_batches} batches for {medicine.name}")
        
        db.commit()
        print("Created demo batches")
        print("Demo inventory created successfully!")
        
    except Exception as e:
        print(f"Error creating demo inventory: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_demo_inventory()