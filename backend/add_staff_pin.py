#!/usr/bin/env python3
"""
Script to add PIN to existing staff users for POS login functionality.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.database import engine, SessionLocal
from app.models import User
import bcrypt

def add_pin_to_users():
    """Add PIN to existing users who don't have one."""
    db = SessionLocal()
    try:
        # Get all users without PIN
        users = db.query(User).filter(User.pin.is_(None)).all()
        
        if not users:
            print("All users already have PINs set.")
            return
        
        print(f"Found {len(users)} users without PINs.")
        
        for user in users:
            # Default PIN based on username (first 4 digits of a hash)
            default_pin = str(hash(user.username) % 10000).zfill(4)
            
            # Hash the PIN
            hashed_pin = bcrypt.hashpw(default_pin.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            
            user.pin = hashed_pin
            print(f"Added PIN '{default_pin}' for user: {user.username} (ID: {user.id})")
        
        db.commit()
        print("Successfully added PINs to all users.")
        
    except Exception as e:
        print(f"Error adding PINs: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_pin_to_users()