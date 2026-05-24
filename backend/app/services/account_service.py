from app.repositories.account_repository import AccountRepository
from app.core.security import create_access_token, create_reset_token, decode_reset_token
import bcrypt

class AccountService:
    def __init__(self, connect):
        self.connect = connect
    
    def login(self, data):
        cursor = self.connect.cursor()
        try:
            repository = AccountRepository(cursor)
            account = repository.get_by_username(data['username'])

            if not account:
                return {
                    "success": False,
                    "message": "Tài khoản hoặc mật khẩu không chính xác."
                }
            
            client_password = data['password'].encode('utf-8')
            server_password = account[2] if isinstance(account[2], bytes) else account[2].encode('utf-8')

            if not bcrypt.checkpw(client_password, server_password):
                return {
                    "success": False,
                    "message": "Tài khoản hoặc mật khẩu không chính xác."
                }

            access_token = create_access_token({
                "user_id": str(account[0]),
                "username": account[1],
                "role": account[3]
            })

            return {
                "success": True,
                "message": "Đăng nhập thành công.",
                "access_token": access_token,
                "role": account[3]
            }
        finally:
            cursor.close()

    def register(self, data):
        cursor = self.connect.cursor()
        try:
            repository = AccountRepository(cursor)
            
            # Kiểm tra tài khoản đã tồn tại chưa
            existing_user = repository.get_by_username(data['username'])
            if existing_user:
                return {
                    "success": False,
                    "message": "Tài khoản đã tồn tại."
                }
            
            # Kiểm tra email đã được sử dụng chưa
            existing_email = repository.get_by_email(data['email'])
            if existing_email:
                return {
                    "success": False,
                    "message": "Email đã được sử dụng."
                }
            
            # Băm mật khẩu
            password_hash = bcrypt.hashpw(
                data['password'].encode('utf-8'), 
                bcrypt.gensalt()
            ).decode('utf-8')
            
            # Ghép first_name và last_name thành full_name
            full_name = f"{data['first_name']} {data['last_name']}".strip()
            
            # Tạo tài khoản
            user_id = repository.create_account(
                username=data['username'],
                password_hash=password_hash,
                role="user"
            )
            
            # Tạo profile tương ứng
            repository.create_profile(
                user_id=user_id,
                full_name=full_name,
                email=data['email'],
                phone=data.get('phone'),
                address=data.get('address')
            )
            
            self.connect.commit()
            return {
                "success": True,
                "message": "Đăng ký tài khoản thành công.",
                "user_id": user_id
            }
        except Exception as e:
            self.connect.rollback()
            return {
                "success": False,
                "message": f"Có lỗi xảy ra: {str(e)}"
            }
        finally:
            cursor.close()

    def get_me(self, user_id: str):
        cursor = self.connect.cursor()
        try:
            repository = AccountRepository(cursor)
            account = repository.get_by_id(user_id)
            if not account:
                return None
            
            profile_data = repository.get_profile_by_user_id(user_id, role=account[2])
            profile = None
            if profile_data:
                profile = {
                    "profile_id": profile_data[0],
                    "full_name": profile_data[1],
                    "email": profile_data[2],
                    "phone": profile_data[3],
                    "address": profile_data[4],
                    "loyalty_points": profile_data[5],
                    "member_tier": profile_data[6],
                    "special_notes": profile_data[7]
                }
            
            return {
                "user_id": account[0],
                "username": account[1],
                "role": account[2],
                "is_active": account[3],
                "profile": profile
            }
        finally:
            cursor.close()

    def update_me(self, user_id: str, data):
        cursor = self.connect.cursor()
        try:
            repository = AccountRepository(cursor)
            current = self.get_me(user_id)
            if not current or not current.get("profile"):
                return None

            profile = current["profile"]
            email = data.get("email", profile.get("email"))
            repository.update_profile(
                user_id=user_id,
                role=current["role"],
                full_name=data.get("full_name", profile.get("full_name")),
                email=email or None,
                phone=data.get("phone", profile.get("phone")),
                address=data.get("address", profile.get("address")),
                special_notes=data.get("special_notes", profile.get("special_notes")),
            )
            self.connect.commit()
            return self.get_me(user_id)
        except Exception as e:
            self.connect.rollback()
            return {
                "success": False,
                "message": f"Có lỗi xảy ra khi cập nhật hồ sơ: {str(e)}"
            }
        finally:
            cursor.close()

    def forgot_password(self, username: str, email: str):
        cursor = self.connect.cursor()
        try:
            repository = AccountRepository(cursor)
            account = repository.get_by_username(username)
            if not account:
                return {
                    "success": False,
                    "message": "Tên đăng nhập không tồn tại trong hệ thống."
                }
            
            profile = repository.get_profile_by_user_id(account[0], account[3])
            if not profile or profile[2] != email:
                return {
                    "success": False,
                    "message": "Email đăng ký không chính xác hoặc không khớp với tài khoản."
                }
            
            # Tạo reset token
            reset_token = create_reset_token(email=email, user_id=str(account[0]))
            
            return {
                "success": True,
                "message": "Mã xác thực đặt lại mật khẩu đã được tạo thành công.",
                "reset_token": reset_token
            }
        finally:
            cursor.close()


    def reset_password(self, token: str, new_password: str):
        payload = decode_reset_token(token)
        if not payload:
            return {
                "success": False,
                "message": "Mã xác thực không hợp lệ hoặc đã hết hạn."
            }
        
        user_id = payload.get("user_id")
        cursor = self.connect.cursor()
        try:
            repository = AccountRepository(cursor)
            # Kiểm tra tài khoản có tồn tại không
            account = repository.get_by_id(user_id)
            if not account:
                return {
                    "success": False,
                    "message": "Tài khoản không tồn tại."
                }
            
            # Băm mật khẩu mới
            password_hash = bcrypt.hashpw(
                new_password.encode('utf-8'),
                bcrypt.gensalt()
            ).decode('utf-8')
            
            repository.update_password(user_id, password_hash)
            self.connect.commit()
            
            return {
                "success": True,
                "message": "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại bằng mật khẩu mới."
            }
        except Exception as e:
            self.connect.rollback()
            return {
                "success": False,
                "message": f"Có lỗi xảy ra khi đặt lại mật khẩu: {str(e)}"
            }
        finally:
            cursor.close()

