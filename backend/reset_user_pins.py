#!/usr/bin/env python3
"""
Script to reset all user PINs to known values for testing.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.database import engine, SessionLocal
from app.models import User
import bcrypt

def reset_user_pins():
    """Reset all user PINs to known values."""
    db = SessionLocal()
    try:
        users = db.query(User).all()
        
        if not users:
            print("No users found in the database.")
            return
        
        print(f"Resetting PINs for {len(users)} users:")
        print("-" * 60)
        
        # Define known PINs for each user
        known_pins = {
            "admin": "1234",
            "pharmacist": "5678",
            "cashier": "9012"
        }
        
        for user in users:
            # Use known PIN if available, otherwise default to 1234
            pin = known_pins.get(user.username, "1234")
            
            # Hash the PIN
            hashed_pin = bcrypt.hashpw(pin.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            
            user.pin = hashed_pin
            print(f"Reset PIN for {user.username} ({user.full_name}) to: {pin}")
        
        db.commit()
        print("\nSuccessfully reset all user PINs.")
        print("\nYou can now use these credentials for staff login:")
        print("-" * 60)
        for user in users:
            pin = known_pins.get(user.username, "1234")
            print(f"Username: {user.username}, PIN: {pin}")
        
    except Exception as e:
        print(f"Error resetting user PINs: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    reset_user_pins()