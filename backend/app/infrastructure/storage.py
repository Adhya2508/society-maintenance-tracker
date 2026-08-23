import io
import uuid
from PIL import Image
from supabase import create_client, Client
from app.core.config import settings
from fastapi import HTTPException

def get_supabase_client() -> Client:
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        raise RuntimeError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured in environment")
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

def upload_complaint_photo(file_bytes: bytes, filename: str, content_type: str) -> str:
    """
    Validates file size (max 5MB), MIME type, and image integrity via Pillow.
    Generates a clean complaints/{uuid}/{filename_uuid}.ext path and uploads to Supabase bucket.
    """
    # 1. Size validation (5 MB limit)
    if len(file_bytes) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image size exceeds 5MB limit")
    
    # 2. Content-Type MIME type validation
    allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if content_type.lower() not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid image format. Allowed: JPEG, PNG, WEBP")
    
    # 3. Pillow Image verification
    try:
        img = Image.open(io.BytesIO(file_bytes))
        img.verify()
    except Exception:
        raise HTTPException(status_code=400, detail="Corrupted or invalid image file")

    # 4. Generate clean unique storage path: complaints/{uuid}/{filename_uuid}.ext
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else "jpg"
    if ext not in ["jpg", "jpeg", "png", "webp"]:
        ext = "jpg"
    
    storage_path = f"complaints/{uuid.uuid4()}/{uuid.uuid4()}.{ext}"

    # 5. Upload to Supabase Storage Bucket
    try:
        client = get_supabase_client()
        # Attempt auto-creation of bucket if it doesn't exist yet
        try:
            client.storage.create_bucket(settings.SUPABASE_STORAGE_BUCKET, options={"public": True})
        except Exception:
            pass  # Bucket already exists or permissions handled

        client.storage.from_(settings.SUPABASE_STORAGE_BUCKET).upload(
            path=storage_path,
            file=file_bytes,
            file_options={"content-type": content_type}
        )
        return storage_path
    except Exception as exc:
        # If bucket error or duplicate, try direct upload or log
        raise HTTPException(status_code=500, detail=f"Supabase storage upload failed: {str(exc)}")

def get_signed_url(storage_path: str, expires_in: int = 3600) -> str:
    """Generates a short-lived signed URL or public URL for viewing Supabase storage objects."""
    if not storage_path:
        return ""
    # If already a full http/https URL or Data URL, return as is
    if storage_path.startswith("http://") or storage_path.startswith("https://") or storage_path.startswith("data:"):
        return storage_path
    try:
        client = get_supabase_client()
        res = client.storage.from_(settings.SUPABASE_STORAGE_BUCKET).create_signed_url(
            path=storage_path,
            expires_in=expires_in
        )
        url = ""
        if isinstance(res, dict):
            url = res.get("signedUrl") or res.get("signedURL") or ""
        else:
            url = getattr(res, "signed_url", "") or str(res)
        
        if not url or url == storage_path:
            # Fallback to public URL format if signed URL fails or bucket is public
            url = f"{settings.SUPABASE_URL}/storage/v1/object/public/{settings.SUPABASE_STORAGE_BUCKET}/{storage_path}"
        return url
    except Exception as exc:
        print(f"Error generating URL for {storage_path}: {exc}")
        return f"{settings.SUPABASE_URL}/storage/v1/object/public/{settings.SUPABASE_STORAGE_BUCKET}/{storage_path}"

def delete_complaint_photo(storage_path: str):
    """Cleanup function to remove uploaded photo if DB transaction fails."""
    if not storage_path or storage_path.startswith("http") or storage_path.startswith("data:"):
        return
    try:
        client = get_supabase_client()
        client.storage.from_(settings.SUPABASE_STORAGE_BUCKET).remove([storage_path])
    except Exception as exc:
        print(f"Error deleting photo from storage: {exc}")
