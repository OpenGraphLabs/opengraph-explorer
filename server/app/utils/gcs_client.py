"""
Google Cloud Storage Client

Handles image upload and signed URL generation for GCS
"""

import os
import base64
import uuid
from datetime import timedelta
from typing import Optional, Tuple
from google.cloud import storage
from google.cloud.storage import Blob
import io
from PIL import Image as PILImage
from ..config import settings


class GCSClient:
    """Google Cloud Storage client for image operations"""
    
    def __init__(self, bucket_name: Optional[str] = None):
        """Initialize GCS client
        
        Args:
            bucket_name: Name of the GCS bucket (defaults to settings value)
        """
        # Use bucket name from settings if not provided
        self.bucket_name = bucket_name or settings.gcs_bucket_name
        
        # Set the service account credentials if configured
        if settings.google_application_credentials:
            os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = settings.google_application_credentials
        
        # Initialize client with project from settings
        self.client = storage.Client(project=settings.google_cloud_project)
        self.bucket = self.client.bucket(self.bucket_name)
    
    def upload_image(
        self,
        image_data: str,
        file_name: Optional[str] = None,
        folder: str = "first-person-images"
    ) -> Tuple[str, int, int]:
        """Upload image to GCS
        
        Args:
            image_data: Base64 encoded image data or image URL
            file_name: Optional file name
            folder: Folder path in bucket
            
        Returns:
            Tuple of (blob_name, width, height)
        """
        # Generate unique filename if not provided
        if not file_name:
            file_name = f"{uuid.uuid4()}.jpg"
        
        # Construct blob path
        blob_name = f"{folder}/{file_name}"
        
        # Decode base64 image if it's a data URL
        if image_data.startswith('data:image'):
            # Extract base64 part from data URL
            header, encoded = image_data.split(',', 1)
            image_bytes = base64.b64decode(encoded)
        else:
            # Assume it's already base64 encoded
            image_bytes = base64.b64decode(image_data)
        
        # Get image dimensions
        img = PILImage.open(io.BytesIO(image_bytes))
        width, height = img.size
        
        # Upload to GCS
        blob = self.bucket.blob(blob_name)
        blob.upload_from_string(image_bytes, content_type='image/jpeg')
        
        return blob_name, width, height
    
    def generate_signed_url(
        self,
        blob_name: str,
        expiration: timedelta = timedelta(hours=1)
    ) -> str:
        """Generate a signed URL for accessing a private blob
        
        Args:
            blob_name: Name of the blob in GCS
            expiration: How long the URL should be valid
            
        Returns:
            Signed URL string
        """
        blob = self.bucket.blob(blob_name)
        
        url = blob.generate_signed_url(
            version="v4",
            expiration=expiration,
            method="GET"
        )
        
        return url
    
    def delete_blob(self, blob_name: str) -> bool:
        """Delete a blob from GCS
        
        Args:
            blob_name: Name of the blob to delete
            
        Returns:
            True if deleted successfully
        """
        blob = self.bucket.blob(blob_name)
        blob.delete()
        return True