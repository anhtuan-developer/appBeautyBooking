const authService = require("../services/authService");

function normalizeEmail(value) {
    return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
    return /^\+?[0-9\s().-]{8,20}$/.test(phone);
}

async function register(req, res) {
    try {
        const { fullName, email, phone, password } = req.body || {};

        if (!fullName || !email || !password) {
            return res.status(400).json({ success: false, message: "FullName, email và password là bắt buộc." });
        }
        if (typeof fullName !== "string" || fullName.trim().length < 2 || fullName.trim().length > 100) {
            return res.status(400).json({ success: false, message: "Họ tên phải từ 2 đến 100 ký tự." });
        }

        const normalizedEmail = normalizeEmail(email);
        if (!isValidEmail(normalizedEmail) || normalizedEmail.length > 255) {
            return res.status(400).json({ success: false, message: "Email không hợp lệ." });
        }

        if (typeof password !== "string" || password.length < 6 || password.length > 72) {
            return res.status(400).json({ success: false, message: "Mật khẩu phải từ 6 đến 72 ký tự." });
        }

        let normalizedPhone = null;
        if (phone !== undefined && phone !== null && String(phone).trim() !== "") {
            if (typeof phone !== "string") {
                return res.status(400).json({ success: false, message: "Số điện thoại không hợp lệ." });
            }
            normalizedPhone = phone.trim();
            if (!isValidPhone(normalizedPhone) || normalizedPhone.length > 20) {
                return res.status(400).json({ success: false, message: "Số điện thoại không hợp lệ." });
            }
        }

        const user = await authService.register({
            fullName: fullName.trim(),
            email: normalizedEmail,
            phone: normalizedPhone,
            password
        });

        return res.status(201).json({ success: true, message: "Đăng ký thành công.", data: user });
    } catch (error) {
        console.error("Register error:", error);
        if (error.message === "EMAIL_EXISTS") {
            return res.status(409).json({ success: false, message: "Email đã được sử dụng." });
        }
        return res.status(500).json({ success: false, message: "Đăng ký thất bại." });
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body || {};
        const normalizedEmail = normalizeEmail(email);

        if (!normalizedEmail || !password) {
            return res.status(400).json({ success: false, message: "Email và password là bắt buộc." });
        }
        if (!isValidEmail(normalizedEmail)) {
            return res.status(400).json({ success: false, message: "Email không hợp lệ." });
        }

        const result = await authService.login({ email: normalizedEmail, password: String(password) });
        return res.status(200).json({ success: true, message: "Đăng nhập thành công.", data: result });
    } catch (error) {
        console.error("Login error:", error);
        if (error.message === "INVALID_LOGIN") {
            return res.status(401).json({ success: false, message: "Email hoặc mật khẩu không đúng." });
        }
        if (error.message === "ACCOUNT_DISABLED") {
            return res.status(403).json({ success: false, message: "Tài khoản đã bị khóa." });
        }
        return res.status(500).json({ success: false, message: "Đăng nhập thất bại." });
    }
}

async function me(req, res) {
    try {
        const user = await authService.getCurrentUser(req.user.userId);
        return res.json({ success: true, data: user });
    } catch (error) {
        console.error("Get current user error:", error);
        if (error.message === "USER_NOT_FOUND") {
            return res.status(404).json({ success: false, message: "Không tìm thấy tài khoản." });
        }
        if (error.message === "ACCOUNT_DISABLED") {
            return res.status(403).json({ success: false, message: "Tài khoản đã bị khóa." });
        }
        return res.status(500).json({ success: false, message: "Không thể lấy thông tin tài khoản." });
    }
}

async function updateProfile(req, res) {
    try {
        const { fullName, phone } = req.body || {};

        if (fullName === undefined && phone === undefined) {
            return res.status(400).json({ success: false, message: "Cần gửi ít nhất fullName hoặc phone để cập nhật." });
        }

        let normalizedFullName;
        let normalizedPhone;

        if (fullName !== undefined) {
            if (typeof fullName !== "string" || fullName.trim().length < 2 || fullName.trim().length > 100) {
                return res.status(400).json({ success: false, message: "Họ tên phải từ 2 đến 100 ký tự." });
            }
            normalizedFullName = fullName.trim();
        }

        if (phone !== undefined) {
            if (phone === null || String(phone).trim() === "") {
                normalizedPhone = null;
            } else {
                if (typeof phone !== "string" || !isValidPhone(phone.trim()) || phone.trim().length > 20) {
                    return res.status(400).json({ success: false, message: "Số điện thoại không hợp lệ." });
                }
                normalizedPhone = phone.trim();
            }
        }

        const user = await authService.updateProfile(req.user.userId, {
            fullName: normalizedFullName,
            phone: normalizedPhone
        });

        return res.json({ success: true, message: "Cập nhật thông tin thành công.", data: user });
    } catch (error) {
        console.error("Update profile error:", error);
        if (error.message === "USER_NOT_FOUND") {
            return res.status(404).json({ success: false, message: "Không tìm thấy tài khoản." });
        }
        if (error.message === "ACCOUNT_DISABLED") {
            return res.status(403).json({ success: false, message: "Tài khoản đã bị khóa." });
        }
        return res.status(500).json({ success: false, message: "Cập nhật thông tin thất bại." });
    }
}

async function changePassword(req, res) {
    try {
        const { currentPassword, newPassword } = req.body || {};

        if (typeof currentPassword !== "string" || typeof newPassword !== "string") {
            return res.status(400).json({ success: false, message: "currentPassword và newPassword là bắt buộc." });
        }
        if (newPassword.length < 6 || newPassword.length > 72) {
            return res.status(400).json({ success: false, message: "Mật khẩu mới phải từ 6 đến 72 ký tự." });
        }
        if (currentPassword === newPassword) {
            return res.status(400).json({ success: false, message: "Mật khẩu mới phải khác mật khẩu hiện tại." });
        }

        await authService.changePassword(req.user.userId, currentPassword, newPassword);
        return res.json({ success: true, message: "Đổi mật khẩu thành công. Vui lòng đăng nhập lại trên các thiết bị khác nếu cần." });
    } catch (error) {
        console.error("Change password error:", error);
        if (error.message === "USER_NOT_FOUND") {
            return res.status(404).json({ success: false, message: "Không tìm thấy tài khoản." });
        }
        if (error.message === "ACCOUNT_DISABLED") {
            return res.status(403).json({ success: false, message: "Tài khoản đã bị khóa." });
        }
        if (error.message === "INVALID_CURRENT_PASSWORD") {
            return res.status(400).json({ success: false, message: "Mật khẩu hiện tại không đúng." });
        }
        if (error.message === "INVALID_PASSWORD_HASH") {
            return res.status(400).json({ success: false, message: "Tài khoản này chưa có mật khẩu bcrypt hợp lệ. Vui lòng tạo tài khoản mới hoặc xử lý dữ liệu mẫu." });
        }
        return res.status(500).json({ success: false, message: "Đổi mật khẩu thất bại." });
    }
}

module.exports = { register, login, me, updateProfile, changePassword };
