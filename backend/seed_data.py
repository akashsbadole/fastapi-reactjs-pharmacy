from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models import User, Base
from app.utils.auth import get_password_hash, verify_password

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
                role="ADMIN",
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
                role="PHARMACIST",
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
                role="CASHIER",
                hashed_password=get_password_hash("cash123"),
                is_active=True
            )
            db.add(cashier_user)
            print("Created cashier user: cashier / cash123")
        else:
            print("Cashier user already exists")
        
        db.commit()
        print("Demo users created successfully!")
        
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

if __name__ == "__main__":
    create_demo_users()