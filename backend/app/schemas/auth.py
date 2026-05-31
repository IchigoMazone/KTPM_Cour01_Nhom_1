from pydantic import BaseModel, field_validator
from app.validators.auth_validator import AuthValidator
from typing import Optional
import re

class LoginRequest(BaseModel):
    username: str
    password: str

    @field_validator("username")
    @classmethod
    def username_check(cls, username):
        if not AuthValidator.username_check(username):
            raise ValueError(
                "Tài khoản 8–16 ký tự, gồm chữ thường, số và dấu ‘_’."
            )
        return username
    
    @field_validator("password")
    @classmethod
    def password_check(cls, password):
        if not AuthValidator.password_check(password):
            raise ValueError(
                "Mật khẩu 8–16 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt."
            )
        return password


class RegisterRequest(BaseModel):
    username: str
    password: str
    first_name: str
    last_name: str
    email: Optional[str] = None
    phone: str
    address: Optional[str] = None

    @field_validator("username")
    @classmethod
    def username_check(cls, username):
        if not AuthValidator.username_check(username):
            raise ValueError(
                "Tài khoản 8–16 ký tự, gồm chữ thường, số và dấu ‘_’."
            )
        return username
    
    @field_validator("password")
    @classmethod
    def password_check(cls, password):
        if not AuthValidator.password_check(password):
            raise ValueError(
                "Mật khẩu 8–16 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt."
            )
        return password

    @field_validator("email")
    @classmethod
    def email_check(cls, email):
        if email is None or email == "":
            return None
        pattern = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
        if not bool(re.match(pattern, email)):
            raise ValueError("Email không hợp lệ.")
        return email

    @field_validator("phone")
    @classmethod
    def phone_check(cls, phone):
        if phone is None or phone == "":
            raise ValueError("Số điện thoại không được để trống.")
        pattern = r"^(0|\+84)[0-9]{9,10}$"
        if not bool(re.match(pattern, phone)):
            raise ValueError("Số điện thoại không hợp lệ.")
        return phone


from uuid import UUID

class ProfileResponse(BaseModel):
    profile_id: UUID
    full_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    image_url: Optional[str] = None
    loyalty_points: int = 0
    member_tier: str = "Thường"
    special_notes: Optional[str] = None


class UserMeResponse(BaseModel):
    user_id: UUID
    username: str
    role: str
    is_active: bool
    profile: Optional[ProfileResponse] = None


class UpdateMeRequest(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    image_url: Optional[str] = None
    special_notes: Optional[str] = None

    @field_validator("email")
    @classmethod
    def email_check(cls, email):
        if email is None or email == "":
            return email
        pattern = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
        if not bool(re.match(pattern, email)):
            raise ValueError("Email không hợp lệ.")
        return email


class ForgotPasswordRequest(BaseModel):
    username: str
    email: str

    @field_validator("email")
    @classmethod
    def email_check(cls, email):
        pattern = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
        if not bool(re.match(pattern, email)):
            raise ValueError("Email không hợp lệ.")
        return email


class RefreshTokenRequest(BaseModel):
    refresh_token: str



class ResetPasswordRequest(BaseModel):
    token: str
    password: str

    @field_validator("password")
    @classmethod
    def password_check(cls, password):
        if not AuthValidator.password_check(password):
            raise ValueError(
                "Mật khẩu 8–16 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt."
            )
        return password
