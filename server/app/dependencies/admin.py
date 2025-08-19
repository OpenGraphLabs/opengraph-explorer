"""
Admin authentication and authorization dependencies
"""

import os
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBasic, HTTPBasicCredentials
import secrets

security = HTTPBasic()


def get_admin_credentials():
    """Get admin credentials from environment variables"""
    admin_username = os.getenv("ADMIN_USERNAME", "admin")
    admin_password = os.getenv("ADMIN_PASSWORD", "admin123")
    return admin_username, admin_password


def verify_admin(credentials: HTTPBasicCredentials = Depends(security)):
    """
    Verify admin credentials using basic authentication
    
    Args:
        credentials: HTTP Basic credentials
        
    Returns:
        bool: True if credentials are valid
        
    Raises:
        HTTPException: If credentials are invalid
    """
    admin_username, admin_password = get_admin_credentials()
    
    is_username_correct = secrets.compare_digest(
        credentials.username.encode("utf8"), admin_username.encode("utf8")
    )
    is_password_correct = secrets.compare_digest(
        credentials.password.encode("utf8"), admin_password.encode("utf8")
    )
    
    if not (is_username_correct and is_password_correct):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin credentials",
            headers={"WWW-Authenticate": "Basic"},
        )
    
    return True