from jose import JWTError, jwt
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))

def create_access_token(data: dict, expires_delta: int = EXPIRE_MINUTES):
    encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=expires_delta)
    encode.update({"exp": expire})
    return jwt.encode(encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_access_token(token: str) -> dict | None:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

RESET_SECRET_KEY = os.getenv("RESET_TOKEN", "resettokensecretkey2026")
RESET_EXPIRE_MINUTES = int(os.getenv("RESET_TOKEN_EXPIRE_MINUTES", "15"))

def create_reset_token(email: str, user_id: str, expires_delta: int = RESET_EXPIRE_MINUTES):
    encode = {"email": email, "user_id": user_id}
    expire = datetime.utcnow() + timedelta(minutes=expires_delta)
    encode.update({"exp": expire})
    return jwt.encode(encode, RESET_SECRET_KEY, algorithm=ALGORITHM)

def decode_reset_token(token: str) -> dict | None:
    try:
        payload = jwt.decode(token, RESET_SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None