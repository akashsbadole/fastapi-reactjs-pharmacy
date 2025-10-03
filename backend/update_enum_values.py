"""
Script to update enum values in the database from lowercase to uppercase
"""
import sqlite3
from pathlib import Path

def update_enum_values():
    # Connect to the database
    db_path = Path(__file__).parent / "pharmacy.db"
    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()
    
    try:
        # Update prescription status values
        print("Updating prescription status values...")
        cursor.execute("UPDATE prescriptions SET status = 'PENDING' WHERE status = 'pending'")
        cursor.execute("UPDATE prescriptions SET status = 'APPROVED' WHERE status = 'approved'")
        cursor.execute("UPDATE prescriptions SET status = 'FILLED' WHERE status = 'filled'")
        cursor.execute("UPDATE prescriptions SET status = 'CANCELLED' WHERE status = 'cancelled'")
        
        # Update payment status values
        print("Updating payment status values...")
        cursor.execute("UPDATE invoices SET payment_status = 'PENDING' WHERE payment_status = 'pending'")
        cursor.execute("UPDATE invoices SET payment_status = 'PAID' WHERE payment_status = 'paid'")
        cursor.execute("UPDATE invoices SET payment_status = 'REFUNDED' WHERE payment_status = 'refunded'")
        cursor.execute("UPDATE invoices SET payment_status = 'PARTIAL' WHERE payment_status = 'partial'")
        
        # Update payment mode values
        print("Updating payment mode values...")
        cursor.execute("UPDATE invoices SET payment_mode = 'CASH' WHERE payment_mode = 'cash'")
        cursor.execute("UPDATE invoices SET payment_mode = 'CARD' WHERE payment_mode = 'card'")
        cursor.execute("UPDATE invoices SET payment_mode = 'INSURANCE' WHERE payment_mode = 'insurance'")
        cursor.execute("UPDATE invoices SET payment_mode = 'ONLINE' WHERE payment_mode = 'online'")
        
        cursor.execute("UPDATE payments SET payment_mode = 'CASH' WHERE payment_mode = 'cash'")
        cursor.execute("UPDATE payments SET payment_mode = 'CARD' WHERE payment_mode = 'card'")
        cursor.execute("UPDATE payments SET payment_mode = 'INSURANCE' WHERE payment_mode = 'insurance'")
        cursor.execute("UPDATE payments SET payment_mode = 'ONLINE' WHERE payment_mode = 'online'")
        
        # Update user role values
        print("Updating user role values...")
        cursor.execute("UPDATE users SET role = 'ADMIN' WHERE role = 'admin'")
        cursor.execute("UPDATE users SET role = 'PHARMACIST' WHERE role = 'pharmacist'")
        cursor.execute("UPDATE users SET role = 'CASHIER' WHERE role = 'cashier'")
        cursor.execute("UPDATE users SET role = 'DOCTOR' WHERE role = 'doctor'")
        
        # Commit the changes
        conn.commit()
        print("Enum values updated successfully!")
        
    except Exception as e:
        print(f"Error updating enum values: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    update_enum_values()