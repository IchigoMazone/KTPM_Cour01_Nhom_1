import os
import uuid
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

def upload_file_to_r2(file_content: bytes, filename: str, content_type: str) -> str:
    try:
        import boto3
        from botocore.config import Config
    except ImportError:
        raise ImportError("Vui lòng cài đặt boto3 bằng cách chạy: pip install boto3")

    account_id = os.getenv("R2_ACCOUNT_ID")
    access_key = os.getenv("R2_ACCESS_KEY_ID")
    secret_key = os.getenv("R2_SECRET_ACCESS_KEY")
    bucket_name = os.getenv("R2_BUCKET_NAME")
    public_url = os.getenv("R2_PUBLIC_URL", "").rstrip("/")

    if not all([account_id, access_key, secret_key, bucket_name]):
        # Fallback for local testing or when R2 is not fully configured
        print("[Warning] R2 credentials not fully configured in .env. Using mock URL.")
        # Ensure a clean fallback filename
        file_ext = filename.split(".")[-1] if "." in filename else "png"
        unique_name = f"{uuid.uuid4()}_{int(datetime.utcnow().timestamp())}.{file_ext}"
        return f"https://pub-mockup-r2.r2.dev/avatars/{unique_name}"

    s3_client = boto3.client(
        "s3",
        endpoint_url=f"https://{account_id}.r2.cloudflarestorage.com",
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        config=Config(signature_version="s3v4"),
        region_name="auto"
    )

    # Generate unique file path in R2 bucket
    file_ext = filename.split(".")[-1] if "." in filename else "png"
    unique_filename = f"avatars/{uuid.uuid4()}_{int(datetime.utcnow().timestamp())}.{file_ext}"

    s3_client.put_object(
        Bucket=bucket_name,
        Key=unique_filename,
        Body=file_content,
        ContentType=content_type
    )

    return f"{public_url}/{unique_filename}"
