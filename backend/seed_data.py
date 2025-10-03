from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models import User, Patient, Base, UserRole
from app.utils.auth import get_password_hash, verify_password
from datetime import date

# Create tables
Base.metadata.create_all(bind=engine)

def create_demo_users():
    db = SessionLocal()
    try:
        # Check if admin user already exists
        admin_user = db.query(User).filter(User.username == "admin").first()
        if not admin_user:
            admin_user = User(
                username="admin",
                email="admin@pharmacy.com",
                full_name="System Administrator",
                phone="1234567890",
                role=UserRole.ADMIN,
                hashed_password=get_password_hash("admin123"),
                is_active=True
            )
            db.add(admin_user)
            print("Created admin user: admin / admin123")
        else:
            print("Admin user already exists")
        
        # Check if pharmacist user already exists
        pharmacist_user = db.query(User).filter(User.username == "pharmacist").first()
        if not pharmacist_user:
            pharmacist_user = User(
                username="pharmacist",
                email="pharmacist@pharmacy.com",
                full_name="John Pharmacist",
                phone="0987654321",
                role=UserRole.PHARMACIST,
                hashed_password=get_password_hash("pharm123"),
                is_active=True
            )
            db.add(pharmacist_user)
            print("Created pharmacist user: pharmacist / pharm123")
        else:
            print("Pharmacist user already exists")
        
        # Check if cashier user already exists
        cashier_user = db.query(User).filter(User.username == "cashier").first()
        if not cashier_user:
            cashier_user = User(
                username="cashier",
                email="cashier@pharmacy.com",
                full_name="Jane Cashier",
                phone="1122334455",
                role=UserRole.CASHIER,
                hashed_password=get_password_hash("cash123"),
                is_active=True
            )
            db.add(cashier_user)
            print("Created cashier user: cashier / cash123")
        else:
            print("Cashier user already exists")
        
        db.commit()
        print("Demo users created successfully!")
        
        # Create demo patients
        create_demo_patients(db)
        
        # Verify passwords were created correctly
        admin = db.query(User).filter(User.username == "admin").first()
        if admin:
            print(f"Admin user found: {admin.username}")
            print(f"Hashed password: {admin.hashed_password}")
            if verify_password("admin123", admin.hashed_password):
                print("Admin user password verification: SUCCESS")
            else:
                print("Admin user password verification: FAILED")
        else:
            print("Admin user not found")
    
    except Exception as e:
        print(f"Error creating demo users: {e}")
        db.rollback()
    finally:
        db.close()

def create_demo_patients(db: Session):
    """Create demo patients for testing"""
    try:
        # Check if demo patients already exist
        existing_patient = db.query(Patient).filter(Patient.patient_id == "P001").first()
        if not existing_patient:
            # Create a demo patient
            demo_patient = Patient(
                patient_id="P001",
                first_name="John",
                last_name="Doe",
                date_of_birth=date(1990, 5, 15),
                gender="Male",
                phone="1234567890",
                email="john.doe@example.com",
                address="123 Main St, City, State",
                emergency_contact="Jane Doe",
                emergency_phone="0987654321",
                allergies="Penicillin",
                medical_history="Asthma",
                insurance_provider="Health Insurance Co.",
                insurance_policy_number="HI123456789"
            )
            db.add(demo_patient)
            print("Created demo patient: John Doe (P001)")
        else:
            print("Demo patient already exists")
        
        # Create a second demo patient
        existing_patient2 = db.query(Patient).filter(Patient.patient_id == "P002").first()
        if not existing_patient2:
            demo_patient2 = Patient(
                patient_id="P002",
                first_name="Jane",
                last_name="Smith",
                date_of_birth=date(1985, 8, 22),
                gender="Female",
                phone="5555555555",
                email="jane.smith@example.com",
                address="456 Oak Ave, City, State",
                emergency_contact="John Smith",
                emergency_phone="4444444444",
                allergies="None",
                medical_history="Hypertension",
                insurance_provider="Health Insurance Co.",
                insurance_policy_number="HI987654321"
            )
            db.add(demo_patient2)
            print("Created demo patient: Jane Smith (P002)")
        else:
            print("Second demo patient already exists")
        
        db.commit()
        print("Demo patients created successfully!")
        
    except Exception as e:
        print(f"Error creating demo patients: {e}")
        db.rollback()

if __name__ == "__main__":
    create_demo_users()