from app.repositories.account_repository import AccountRepository
from app.core.security import create_access_token
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
                "user_id": account[0],
                "username": account[1]
            })

            return {
                "success": True,
                "message": "Đăng nhập thành công.",
                "access_token": access_token
            }
        finally:
            cursor.close()