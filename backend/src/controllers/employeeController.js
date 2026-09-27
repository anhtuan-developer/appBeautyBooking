const employeeService = require("../services/employeeService");

function positiveInt(value) {
    const n = Number(value);
    return Number.isInteger(n) && n > 0 ? n : null;
}

async function getBySalonId(req, res) {
    const salonId = positiveInt(req.params.salonId);
    if (!salonId) return res.status(400).json({ success: false, message: "salonId không hợp lệ." });

    try {
        const data = await employeeService.getBySalonId(salonId);
        res.json({ success: true, data });
    } catch (error) {
        console.error("Get employees error:", error);
        res.status(500).json({ success: false, message: "Không thể lấy danh sách nhân viên." });
    }
}

async function getById(req, res) {
    const employeeId = positiveInt(req.params.employeeId);
    if (!employeeId) return res.status(400).json({ success: false, message: "employeeId không hợp lệ." });

    try {
        const data = await employeeService.getById(employeeId);
        if (!data) return res.status(404).json({ success: false, message: "Không tìm thấy nhân viên." });
        res.json({ success: true, data });
    } catch (error) {
        console.error("Get employee error:", error);
        res.status(500).json({ success: false, message: "Không thể lấy thông tin nhân viên." });
    }
}

module.exports = { getBySalonId, getById };
