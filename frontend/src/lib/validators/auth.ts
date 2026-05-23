import { EMAIL_REGEX, PASSWORD_REGEX, USERNAME_REGEX } from "./regex";

export function validateEmail(email: string) {
    if (!email) return "Email không được để trống."
    if (!EMAIL_REGEX.test(email)) return "Email không hợp lệ."
    return ""
}

export function validatePassword(password: string) {
    if (!password) return "Mật khẩu không được để trống"
    if (!PASSWORD_REGEX.test(password)) return "Mật khẩu không hợp lệ."
    return ""
}

export function validateUsername(username: string) {
    if (!username) return "Tên đăng nhập không được để trống."
    if (!USERNAME_REGEX.test(username)) return "Tài khoản 8–16 ký tự, gồm chữ thường, số và dấu ‘_’."
    return ""
}
