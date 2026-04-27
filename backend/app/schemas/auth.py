
from pydantic import BaseModel, field_validator
from app.validators.auth_validator import AuthValidator

class LoginRequest(BaseModel):
    username: str
    password: str

    @field_validator("username")
    @classmethod
    def username_check(cls, username):
        if not AuthValidator.username_check(username):
            raise ValueError(
                f"Tài khoản 8–16 ký tự, gồm chữ thường, số và dấu ‘_’."
            )
        return username
    
    @field_validator("password")
    @classmethod
    def password_check(cls, password):
        if not AuthValidator.password_check(password):
            raise ValueError(
                f"Mật khẩu 8–16 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt."
            )
        return password




