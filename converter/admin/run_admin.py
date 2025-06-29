#!/usr/bin/env python3
"""
OpenGraph Converter Admin Launcher

This script launches the Streamlit admin interface for OpenGraph model conversion.
"""

import os
import sys
import subprocess
import argparse

# Add the parent directory to Python path for proper imports
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)

from admin.utils import validate_admin_dependencies, check_system_health


def check_dependencies():
    """Check if all required dependencies are installed"""
    print("🔍 Checking dependencies...")
    deps = validate_admin_dependencies()
    
    missing_deps = [dep for dep, available in deps.items() if not available]
    
    if missing_deps:
        print("❌ Missing dependencies:")
        for dep in missing_deps:
            print(f"   - {dep}")
        print("\n💡 To install missing dependencies, run:")
        print("   pip install -r requirements.txt")
        return False
    else:
        print("✅ All dependencies are available")
        return True


def check_system():
    """Check system health"""
    print("🔍 Checking system health...")
    health = check_system_health()
    
    if health['overall_status'] == 'healthy':
        print("✅ System is healthy")
    elif health['overall_status'] == 'warning':
        print("⚠️  System has warnings:")
        for warning in health['warnings']:
            print(f"   - {warning}")
    else:
        print("❌ System has errors:")
        for error in health['errors']:
            print(f"   - {error}")
        return False
    
    return True


def run_admin_app(port=8501, host="localhost"):
    """Launch the Streamlit admin app"""
    admin_app_path = os.path.join(os.path.dirname(__file__), "admin_app.py")
    
    cmd = [
        "streamlit", "run", admin_app_path,
        "--server.port", str(port),
        "--server.address", host,
        "--theme.base", "light",
        "--theme.primaryColor", "#FF6B35",
        "--theme.backgroundColor", "#FFFFFF",
        "--theme.secondaryBackgroundColor", "#F0F2F6"
    ]
    
    print(f"🚀 Starting OpenGraph Converter Admin on http://{host}:{port}")
    print("   Press Ctrl+C to stop the server")
    print("-" * 50)
    
    try:
        subprocess.run(cmd, check=True)
    except KeyboardInterrupt:
        print("\n👋 Admin server stopped")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to start admin server: {e}")
        sys.exit(1)


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description="OpenGraph Converter Admin")
    parser.add_argument("--port", type=int, default=8501, help="Port to run the admin on (default: 8501)")
    parser.add_argument("--host", type=str, default="localhost", help="Host to run the admin on (default: localhost)")
    parser.add_argument("--skip-checks", action="store_true", help="Skip dependency and system checks")
    
    args = parser.parse_args()
    
    print("🧠 OpenGraph Converter Admin")
    print("=" * 40)
    
    if not args.skip_checks:
        # Check dependencies
        if not check_dependencies():
            sys.exit(1)
        
        # Check system health
        if not check_system():
            print("⚠️  System checks failed. Use --skip-checks to run anyway.")
            sys.exit(1)
        
        print()
    
    # Run the admin app
    run_admin_app(port=args.port, host=args.host)


if __name__ == "__main__":
    main() 