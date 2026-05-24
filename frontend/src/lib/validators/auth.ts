import { EMAIL_REGEX, PASSWORD_REGEX, USERNAME_REGEX } from "./regex";

export function validateEmail(email: string) {
  if (!email) return "Email không được để trống.";
  if (!EMAIL_REGEX.test(email)) return "Email không hợp lệ.";
  return "";
}

export function validatePassword(password: string) {
  if (!password) return "Mật khẩu không được để trống.";
  if (!PASSWORD_REGEX.test(password)) return "Mật khẩu không hợp lệ.";
  return "";
}

export function validateRequired(value: string, label: string) {
  if (!value.trim()) return `${label} không được để trống.`;
  return "";
}

export function validateUsername(username: string) {
  if (!username) return "Tên đăng nhập không được để trống.";
  if (!USERNAME_REGEX.test(username)) {
    return "Tên đăng nhập cần 8-16 kí tự, gồm chữ thường, số và dấu _.";
  }
  return "";
}

export function validateConfirmPassword(password: string, confirm: string) {
  if (!confirm) return "Xác nhận mật khẩu không được để trống.";
  if (password !== confirm) return "Mật khẩu xác nhận không khớp.";
  return "";
}

export type LoginField = "email" | "password";

export type LoginFormValues = {
  email: string;
  password: string;
};

export type LoginFormErrors = Record<LoginField, string>;

export function validateLoginField(
  field: LoginField,
  value: string,
): string {
  if (field === "email") return validateEmail(value);
  return validatePassword(value);
}

export function validateLoginForm(values: LoginFormValues): LoginFormErrors {
  return {
    email: validateEmail(values.email),
    password: validatePassword(values.password),
  };
}

export type ForgotPasswordField = "account" | "email";

export type ForgotPasswordFormValues = {
  account: string;
  email: string;
};

export type ForgotPasswordFormErrors = Record<ForgotPasswordField, string>;

export function validateForgotPasswordField(
  field: ForgotPasswordField,
  value: string,
): string {
  if (field === "account") return validateUsername(value);
  return validateEmail(value);
}

export function validateForgotPasswordForm(
  values: ForgotPasswordFormValues,
): ForgotPasswordFormErrors {
  return {
    account: validateUsername(values.account),
    email: validateEmail(values.email),
  };
}

export type RegisterField =
  | "firstName"
  | "lastName"
  | "email"
  | "username"
  | "password"
  | "confirm"
  | "agreed";

export type RegisterFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  confirm: string;
  agreed: boolean;
};

export type RegisterFormErrors = Record<RegisterField, string>;

export function validateRegisterField(
  field: RegisterField,
  values: RegisterFormValues,
): string {
  if (field === "firstName") return validateRequired(values.firstName, "Họ");
  if (field === "lastName") return validateRequired(values.lastName, "Tên");
  if (field === "email") return validateEmail(values.email);
  if (field === "username") return validateUsername(values.username);
  if (field === "password") return validatePassword(values.password);
  if (field === "confirm") {
    return validateConfirmPassword(values.password, values.confirm);
  }
  if (!values.agreed) return "Bạn cần đồng ý với điều khoản.";
  return "";
}

export function validateRegisterForm(
  values: RegisterFormValues,
): RegisterFormErrors {
  return {
    firstName: validateRegisterField("firstName", values),
    lastName: validateRegisterField("lastName", values),
    email: validateRegisterField("email", values),
    username: validateRegisterField("username", values),
    password: validateRegisterField("password", values),
    confirm: validateRegisterField("confirm", values),
    agreed: validateRegisterField("agreed", values),
  };
}

export type ResetPasswordField = "newPassword" | "confirmPassword";

export type ResetPasswordFormValues = {
  newPassword: string;
  confirmPassword: string;
};

export type ResetPasswordFormErrors = Record<ResetPasswordField, string>;

export function validateResetPasswordField(
  field: ResetPasswordField,
  values: ResetPasswordFormValues,
): string {
  if (field === "newPassword") return validatePassword(values.newPassword);
  return validateConfirmPassword(values.newPassword, values.confirmPassword);
}

export function validateResetPasswordForm(
  values: ResetPasswordFormValues,
): ResetPasswordFormErrors {
  return {
    newPassword: validateResetPasswordField("newPassword", values),
    confirmPassword: validateResetPasswordField("confirmPassword", values),
  };
}
