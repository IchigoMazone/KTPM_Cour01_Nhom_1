from database.database import get_connection
from repositories.account_repository import AccountRepository
from core.security import create_access_token
import bcrypt


class AccountService:
    
    def login(self, data):
        connect = get_connection()
        cursor = connect.cursor()
        
        repository = AccountRepository(cursor)
        account = repository.get_by_username(data['username'])

        if not account:
            cursor.close()
            connect.close()

            return {
                "success": False,
                "message": "Tài khoản hoặc mật khẩu không chính xác."
            }
        
        client_password = data['password'].encode('utf-8')
        server_password = account[2].encode('utf-8')

        if not bcrypt.checkpw(client_password.encode(), server_password.encode()):
            cursor.close()
            connect.close()

            return {
                "success": False,
                "message": "Tài khoản hoặc mật khẩu không chính xác."
            }
        
        cursor.close()
        connect.close()

        access_token = create_access_token({
            "user_id": account[0],
            "username": account[1]
        })

        return {
            "success": True,
            "message": "Đăng nhập thành công.",
            "access_token": access_token
        }