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
    """Main function to run migrations"""
    print("Running database migrations...")
    
    # Get the backend directory
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Run database migrations
    success, stdout, stderr = run_command("alembic upgrade head", cwd=backend_dir)
    if success:
        print("✅ Database migrations completed successfully")
        print(stdout)
    else:
        print(f"❌ Error running database migrations: {stderr}")
        return False
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)