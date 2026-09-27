const jwt = require("jsonwebtoken");
const authService = require("../services/authService");

async function authMiddleware(req, res, next) {
    const authorization = req.headers.authorization;

    if (!authorization || !/^Bearer\s+/i.test(authorization)) {
        return res.status(401).json({ success: false, message: "Thiếu access token. Vui lòng đăng nhập." });
    }

    const token = authorization.replace(/^Bearer\s+/i, "").trim();
    if (!token) {
        return res.status(401).json({ success: false, message: "Access token không hợp lệ." });
    }
    if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is missing.");
        return res.status(500).json({ success: false, message: "Server chưa cấu hình JWT_SECRET." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded.userId || !decoded.role) {
            return res.status(401).json({ success: false, message: "Access token không hợp lệ." });
        }

        const currentUser = await authService.getActiveUserForToken(decoded.userId);
        req.user = {
            userId: currentUser.UserId,
            email: currentUser.Email,
            role: currentUser.Role
        };
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ success: false, message: "Access token đã hết hạn. Vui lòng đăng nhập lại." });
        }
        if (error.message === "ACCOUNT_DISABLED") {
            return res.status(403).json({ success: false, message: "Tài khoản đã bị khóa." });
        }
        if (error.message === "USER_NOT_FOUND") {
            return res.status(401).json({ success: false, message: "Tài khoản không còn tồn tại." });
        }
        return res.status(401).json({ success: false, message: "Access token không hợp lệ." });
    }
}

function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: "Bạn không có quyền thực hiện thao tác này." });
        }
        next();
    };
}

module.exports = { authMiddleware, requireRole };
