import subprocess
import sys
import os

def run_command(command, cwd=None):
    """Run a command and return the result"""
    try:
        result = subprocess.run(
            command, 
            shell=True, 
            cwd=cwd, 
            stdout=subprocess.PIPE, 
            stderr=subprocess.PIPE,
            text=True
        )
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        return False, "", str(e)

def main():
    """Main function to set up all new features"""
    print("Setting up new features for Pharmacy Management System...")
    
    # Get the backend directory
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Step 1: Run database migrations
    print("\nStep 1: Running database migrations...")
    success, stdout, stderr = run_command("alembic upgrade head", cwd=backend_dir)
    if success:
        print("✅ Database migrations completed successfully")
    else:
        print(f"❌ Error running database migrations: {stderr}")
        return False
    
    # Step 2: Seed support data
    print("\nStep 2: Seeding support data...")
    success, stdout, stderr = run_command(f"{sys.executable} seed_support_data.py", cwd=backend_dir)
    if success:
        print("✅ Support data seeded successfully")
    else:
        print(f"❌ Error seeding support data: {stderr}")
        return False
    
    print("\n🎉 All new features have been set up successfully!")
    print("\nYou can now access:")
    print("- Audit Logs: http://localhost:3000/audit")
    print("- Help & Support: http://localhost:3000/support")
    print("- Subscription & Billing: http://localhost:3000/subscription")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)