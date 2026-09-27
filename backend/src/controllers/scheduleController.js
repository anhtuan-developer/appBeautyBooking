const scheduleService = require("../services/scheduleService");

function positiveInt(value) {
    const n = Number(value);
    return Number.isInteger(n) && n > 0 ? n : null;
}

async function getByEmployeeId(req, res) {
    const employeeId = positiveInt(req.params.employeeId);
    if (!employeeId) return res.status(400).json({ success: false, message: "employeeId không hợp lệ." });

    try {
        const data = await scheduleService.getByEmployeeId(employeeId);
        res.json({ success: true, data });
    } catch (error) {
        console.error("Get schedule error:", error);
        if (error.code === "EMPLOYEE_NOT_FOUND") {
            return res.status(404).json({ success: false, message: "Không tìm thấy nhân viên hoặc nhân viên không hoạt động." });
        }
        res.status(500).json({ success: false, message: "Không thể lấy lịch làm việc." });
    }
}

async function getAvailableSlots(req, res) {
    const employeeId = positiveInt(req.params.employeeId);
    const serviceId = positiveInt(req.query.serviceId);
    const date = String(req.query.date || "").trim();

    if (!employeeId) return res.status(400).json({ success: false, message: "employeeId không hợp lệ." });
    if (!serviceId) return res.status(400).json({ success: false, message: "serviceId không hợp lệ." });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({ success: false, message: "date phải có dạng YYYY-MM-DD." });
    }

    try {
        const data = await scheduleService.getAvailableSlots({ employeeId, serviceId, date });
        res.json({ success: true, data });
    } catch (error) {
        console.error("Get available slots error:", error);
        if (error.code === "EMPLOYEE_NOT_FOUND") {
            return res.status(404).json({ success: false, message: "Không tìm thấy nhân viên hoặc nhân viên không hoạt động." });
        }
        if (error.code === "SERVICE_NOT_FOUND") {
            return res.status(404).json({ success: false, message: "Không tìm thấy dịch vụ hoặc dịch vụ không thuộc salon của nhân viên." });
        }
        if (error.code === "INVALID_DATE") {
            return res.status(400).json({ success: false, message: "Ngày không hợp lệ." });
        }
        if (error.code === "INVALID_SERVICE_DURATION") {
            return res.status(400).json({ success: false, message: "Thời lượng dịch vụ không hợp lệ." });
        }
        res.status(500).json({ success: false, message: "Không thể lấy các khung giờ trống." });
    }
}

module.exports = { getByEmployeeId, getAvailableSlots };
