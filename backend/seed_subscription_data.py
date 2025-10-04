import json
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from app.config import settings
from app.models import SubscriptionPlan, UserSubscription, User
import logging
from datetime import datetime, timedelta

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create database engine
engine = create_engine(settings.DATABASE_URL)

# Subscription Plans
subscription_plans = [
    {
        "name": "Basic",
        "description": "Perfect for small pharmacies with basic needs",
        "price": 2900,  # $29.00 in cents
        "billing_cycle": "MONTHLY",
        "features": [
            "Up to 3 users",
            "1 pharmacy location",
            "10 GB storage",
            "Basic support",
            "Inventory management",
            "POS functionality",
            "Basic reporting"
        ],
        "max_users": 3,
        "max_pharmacies": 1,
        "storage_limit_gb": 10,
        "support_level": "Basic"
    },
    {
        "name": "Professional",
        "description": "Ideal for growing pharmacies with advanced needs",
        "price": 7900,  # $79.00 in cents
        "billing_cycle": "MONTHLY",
        "features": [
            "Up to 10 users",
            "3 pharmacy locations",
            "50 GB storage",
            "Priority support",
            "All Basic features",
            "Advanced reporting",
            "Prescription management",
            "Patient management",
            "API access"
        ],
        "max_users": 10,
        "max_pharmacies": 3,
        "storage_limit_gb": 50,
        "support_level": "Priority"
    },
    {
        "name": "Enterprise",
        "description": "Complete solution for large pharmacy chains",
        "price": 19900,  # $199.00 in cents
        "billing_cycle": "MONTHLY",
        "features": [
            "Unlimited users",
            "Unlimited pharmacy locations",
            "500 GB storage",
            "24/7 dedicated support",
            "All Professional features",
            "Custom integrations",
            "Advanced analytics",
            "Multi-store management",
            "Priority feature requests",
            "Dedicated account manager"
        ],
        "max_users": 999,
        "max_pharmacies": 999,
        "storage_limit_gb": 500,
        "support_level": "Premium"
    }
]

def seed_subscription_data():
    """Seed the database with subscription data"""
    with Session(engine) as db:
        try:
            # Get the admin user
            admin_user = db.query(User).filter(User.username == "admin").first()
            if not admin_user:
                logger.error("Admin user not found. Please make sure the database is seeded with users.")
                return
            
            # Seed Subscription Plans
            logger.info("Seeding Subscription Plans...")
            for plan_data in subscription_plans:
                # Check if plan already exists
                existing_plan = db.query(SubscriptionPlan).filter(
                    SubscriptionPlan.name == plan_data["name"]
                ).first()
                
                if not existing_plan:
                    # Convert features list to JSON string
                    features_json = json.dumps(plan_data["features"])
                    
                    plan = SubscriptionPlan(
                        name=plan_data["name"],
                        description=plan_data["description"],
                        price=plan_data["price"],
                        billing_cycle=plan_data["billing_cycle"],
                        features=features_json,
                        max_users=plan_data["max_users"],
                        max_pharmacies=plan_data["max_pharmacies"],
                        storage_limit_gb=plan_data["storage_limit_gb"],
                        support_level=plan_data["support_level"]
                    )
                    db.add(plan)
                    logger.info(f"Added subscription plan: {plan_data['name']}")
                else:
                    logger.info(f"Subscription plan already exists: {plan_data['name']}")
            
            # Commit plans first to get their IDs
            db.commit()
            
            # Get the Professional plan for the admin user
            professional_plan = db.query(SubscriptionPlan).filter(
                SubscriptionPlan.name == "Professional"
            ).first()
            
            if professional_plan:
                # Check if admin already has an active subscription
                existing_subscription = db.query(UserSubscription).filter(
                    UserSubscription.user_id == admin_user.id,
                    UserSubscription.status == "ACTIVE"
                ).first()
                
                if not existing_subscription:
                    # Create a subscription for the admin user
                    subscription = UserSubscription(
                        user_id=admin_user.id,
                        plan_id=professional_plan.id,
                        status="ACTIVE",
                        start_date=datetime.utcnow(),
                        end_date=datetime.utcnow() + timedelta(days=30),  # 30 days from now
                        auto_renew=True
                    )
                    db.add(subscription)
                    logger.info(f"Created subscription for admin user: {professional_plan.name}")
                else:
                    logger.info(f"Admin user already has an active subscription")
            
            # Commit all changes
            db.commit()
            logger.info("Subscription data seeding completed successfully!")
            
        except Exception as e:
            logger.error(f"Error seeding subscription data: {str(e)}")
            db.rollback()

if __name__ == "__main__":
    seed_subscription_data()