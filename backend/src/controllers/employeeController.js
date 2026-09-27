const employeeService = require("../services/employeeService");

function positiveInt(value) {
    const n = Number(value);
    return Number.isInteger(n) && n > 0 ? n : null;
}

function parsePagination(req, res) {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);

    if (!Number.isInteger(page) || page < 1) {
        res.status(400).json({ success: false, message: "page không hợp lệ." });
        return null;
    }
    if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
        res.status(400).json({ success: false, message: "limit phải từ 1 đến 50." });
        return null;
    }
    return { page, limit };
}

async function getBySalonId(req, res) {
    const salonId = positiveInt(req.params.salonId);
    if (!salonId) return res.status(400).json({ success: false, message: "salonId không hợp lệ." });

    const pagination = parsePagination(req, res);
    if (!pagination) return;
    const { page, limit } = pagination;
    const search = String(req.query.search || "").trim().slice(0, 100);

    try {
        const data = await employeeService.getBySalonId({ salonId, search, page, limit });
        res.json({ success: true, data });
    } catch (error) {
        console.error("Get employees error:", error);
        if (error.code === "SALON_NOT_FOUND") {
            return res.status(404).json({ success: false, message: "Không tìm thấy salon hoặc salon không hoạt động." });
        }
        res.status(500).json({ success: false, message: "Không thể lấy danh sách nhân viên." });
    }
}

async function getById(req, res) {
    const employeeId = positiveInt(req.params.employeeId);
    if (!employeeId) return res.status(400).json({ success: false, message: "employeeId không hợp lệ." });

    try {
        const data = await employeeService.getById(employeeId);
        if (!data) return res.status(404).json({ success: false, message: "Không tìm thấy nhân viên hoặc nhân viên không hoạt động." });
        res.json({ success: true, data });
    } catch (error) {
        console.error("Get employee error:", error);
        res.status(500).json({ success: false, message: "Không thể lấy thông tin nhân viên." });
    }
}

module.exports = { getBySalonId, getById };
