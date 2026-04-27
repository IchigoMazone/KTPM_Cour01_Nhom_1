import re

class AuthValidator:

    # Tai khoan co chu thuong, so va ki tu "_"
    @staticmethod
    def username_check(username: str) -> bool:
        pattern = r"^(?=.*[a-z])(?=.*[0-9])[a-z0-9_]{8,16}$"
        return bool(re.match(pattern, username))
    
    # Mat khau co chu thuong, chu hoa, so va ki tu dac biet
    @staticmethod
    def password_check(password: str) -> bool:
        pattern = r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$"
        return bool(re.match(pattern, password))
